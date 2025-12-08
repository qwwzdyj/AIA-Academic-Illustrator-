from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import base64
import json
import io
import google.generativeai as genai
from openai import OpenAI

# PDF to Image conversion
try:
    import fitz  # PyMuPDF
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("Warning: PyMuPDF not installed. PDF conversion disabled.")

from prompts_config import (
    ARCHITECT_PROMPT_TEMPLATE,
    RENDERER_PROMPT_TEMPLATE,
    RENDERER_WITH_REFERENCES_TEMPLATE
)

app = FastAPI(title="Academic Illustrator Agent API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def convert_pdf_to_images(pdf_base64: str, dpi: int = 150) -> List[str]:
    """
    Convert PDF pages to PNG images (base64 encoded).
    Returns a list of base64 data URLs for each page.
    """
    if not PDF_SUPPORT:
        print("PDF conversion not available - PyMuPDF not installed")
        return []
    
    try:
        # Remove data URL prefix if present
        if "," in pdf_base64:
            pdf_base64 = pdf_base64.split(",")[1]
        
        # Decode base64 to bytes
        pdf_bytes = base64.b64decode(pdf_base64)
        
        # Open PDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        images = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Render page to image
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PNG bytes
            img_bytes = pix.tobytes("png")
            
            # Encode to base64
            img_base64 = base64.b64encode(img_bytes).decode("utf-8")
            images.append(f"data:image/png;base64,{img_base64}")
            
            print(f"Converted PDF page {page_num + 1}/{len(doc)} to PNG")
        
        doc.close()
        return images
    
    except Exception as e:
        print(f"Error converting PDF: {str(e)}")
        return []


class ModelConfig(BaseModel):
    baseUrl: str
    apiKey: str
    modelName: str


class GenerateSchemaRequest(BaseModel):
    paper_content: str
    input_images: Optional[List[str]] = None  # Base64 encoded PDF pages or images
    config: ModelConfig


class RenderImageRequest(BaseModel):
    visual_schema: str
    reference_images: Optional[List[str]] = None  # Base64 encoded images
    config: ModelConfig


def is_gemini_endpoint(url: str) -> bool:
    """Check if the URL is a Google/Gemini endpoint"""
    return "googleapis" in url or "generativelanguage" in url or "google" in url


def create_openai_client(config: ModelConfig) -> OpenAI:
    """Create OpenAI-compatible client"""
    return OpenAI(
        api_key=config.apiKey,
        base_url=config.baseUrl if config.baseUrl else None
    )



@app.post("/api/generate-schema")
async def generate_schema(request: GenerateSchemaRequest):
    """
    Step 1: The Architect
    Generates a Visual Schema from paper content using a logic model.
    Supports text input, PDF pages, or images.
    """
    try:
        # Validate API Key
        if not request.config.apiKey or request.config.apiKey.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="API Key is required. Please configure your API key in Settings."
            )
        
        prompt = ARCHITECT_PROMPT_TEMPLATE.format(paper_content=request.paper_content)
        
        if is_gemini_endpoint(request.config.baseUrl):
            # Use Gemini SDK with multimodal support
            genai.configure(api_key=request.config.apiKey)
            model = genai.GenerativeModel(request.config.modelName)
            
            # Build content parts for multimodal input
            content_parts = []
            
            # Add input images/PDFs if provided
            if request.input_images:
                for img_base64 in request.input_images:
                    # Remove data URL prefix if present
                    if "," in img_base64:
                        mime_type = "image/png"
                        if "pdf" in img_base64.split(",")[0]:
                            mime_type = "application/pdf"
                        elif "jpeg" in img_base64.split(",")[0] or "jpg" in img_base64.split(",")[0]:
                            mime_type = "image/jpeg"
                        img_base64 = img_base64.split(",")[1]
                    else:
                        mime_type = "image/png"
                    
                    content_parts.append({
                        "mime_type": mime_type,
                        "data": img_base64
                    })
            
            content_parts.append(prompt)
            
            response = model.generate_content(content_parts)
            schema = response.text
        else:
            # Use OpenAI SDK (compatible with yunwu, DeepSeek, etc.)
            client = create_openai_client(request.config)
            
            # Build messages based on whether images are provided
            if request.input_images and len(request.input_images) > 0:
                # Multimodal format with images (OpenAI Vision API format)
                content = []
                for idx, img_base64 in enumerate(request.input_images):
                    # Parse the data URL to get MIME type
                    if img_base64.startswith("data:"):
                        # Extract MIME type from data URL
                        mime_part = img_base64.split(";")[0]  # e.g., "data:image/png"
                        mime_type = mime_part.replace("data:", "")
                        print(f"Image {idx + 1} MIME type: {mime_type}")
                        
                        # Handle PDF: convert to images
                        if "pdf" in mime_type.lower():
                            print(f"Converting PDF {idx + 1} to images...")
                            pdf_images = convert_pdf_to_images(img_base64)
                            for page_idx, page_img in enumerate(pdf_images):
                                content.append({
                                    "type": "image_url",
                                    "image_url": {"url": page_img}
                                })
                                print(f"Added PDF page {page_idx + 1} as image")
                            continue
                        
                        image_url = img_base64
                    else:
                        # Add default prefix (assume PNG)
                        image_url = f"data:image/png;base64,{img_base64}"
                        print(f"Image {idx + 1}: No MIME type, defaulting to image/png")
                    
                    content.append({
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    })
                
                # If all images were filtered out (e.g., all PDFs), use text-only mode
                if len(content) == 0:
                    print("No valid images after filtering, using text-only mode")
                    messages = [{"role": "user", "content": prompt}]
                else:
                    # Add text prompt after images
                    content.append({
                        "type": "text",
                        "text": prompt
                    })
                    messages = [{"role": "user", "content": content}]
            else:
                # Simple text format (for text-only models)
                messages = [{"role": "user", "content": prompt}]
            
            print(f"Calling OpenAI-compatible API: {request.config.baseUrl}")
            print(f"Model: {request.config.modelName}")
            print(f"Has images: {bool(request.input_images)}")
            
            response = client.chat.completions.create(
                model=request.config.modelName,
                messages=messages,
                temperature=0.7,
                max_tokens=4096
            )
            schema = response.choices[0].message.content
        
        return {"schema": schema}
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in generate_schema: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Schema generation failed: {str(e)}")


@app.post("/api/render-image")
async def render_image(request: RenderImageRequest):
    """
    Step 3: The Renderer
    Renders an academic diagram from the Visual Schema using OpenAI-compatible API.
    """
    try:
        # Validate API Key
        if not request.config.apiKey or request.config.apiKey.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="API Key is required. Please configure your Vision Model API key in Settings."
            )
        
        # Validate schema format
        if "---BEGIN PROMPT---" not in request.visual_schema or "---END PROMPT---" not in request.visual_schema:
            raise HTTPException(
                status_code=400, 
                detail="Invalid Schema Format: Please preserve the BEGIN/END tags."
            )
        
        # Choose template based on whether reference images are provided
        if request.reference_images and len(request.reference_images) > 0:
            prompt = RENDERER_WITH_REFERENCES_TEMPLATE.format(
                visual_schema_content=request.visual_schema
            )
        else:
            prompt = RENDERER_PROMPT_TEMPLATE.format(
                visual_schema_content=request.visual_schema
            )
        
        # Use OpenAI SDK for image generation (compatible with yunwu.ai proxy)
        client = create_openai_client(request.config)
        
        # Build messages
        content = []
        
        # Add reference images if provided
        if request.reference_images and len(request.reference_images) > 0:
            for idx, img_base64 in enumerate(request.reference_images):
                if img_base64.startswith("data:"):
                    image_url = img_base64
                else:
                    image_url = f"data:image/png;base64,{img_base64}"
                content.append({
                    "type": "image_url",
                    "image_url": {"url": image_url}
                })
                print(f"Added reference image {idx + 1}")
        
        # Add text prompt
        content.append({
            "type": "text",
            "text": prompt
        })
        
        messages = [{"role": "user", "content": content}]
        
        print(f"Calling Vision API: {request.config.baseUrl}")
        print(f"Model: {request.config.modelName}")
        print(f"Has reference images: {bool(request.reference_images)}")
        
        response = client.chat.completions.create(
            model=request.config.modelName,
            messages=messages,
            temperature=0.7,
            max_tokens=4096
        )
        
        # Parse response - check for image in response
        result_content = response.choices[0].message.content
        
        # Try to extract image from response (if model returns base64 image)
        if result_content:
            # Check if response contains base64 image data
            import re
            # Look for base64 image pattern
            base64_pattern = r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+'
            matches = re.findall(base64_pattern, result_content)
            if matches:
                return {"imageUrl": matches[0]}
            
            # Check for raw base64 (without data URL prefix)
            if len(result_content) > 1000 and result_content.replace('\n', '').replace(' ', '').isalnum():
                # Likely raw base64 image
                return {"imageUrl": f"data:image/png;base64,{result_content.strip()}"}
        
        # If no image found, return text response
        return {"imageUrl": None, "text": result_content}
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in render_image: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Image rendering failed: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Academic Illustrator Agent"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
