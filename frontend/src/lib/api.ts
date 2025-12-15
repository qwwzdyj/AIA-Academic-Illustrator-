import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export interface ModelConfig {
    baseUrl: string;
    apiKey: string;
    modelName: string;
}

export interface GenerateSchemaResponse {
    schema: string;
}

export interface RenderImageResponse {
    imageUrl: string | null;
    text?: string;
}

// Prompt templates (moved from backend)
const ARCHITECT_PROMPT_TEMPLATE = `You are an expert academic diagram architect. Analyze the following paper content and generate a detailed Visual Schema that describes a publication-quality academic diagram.

The Visual Schema should include:
1. Layout structure (zones, panels, sections)
2. Visual elements (shapes, icons, connections)
3. Color scheme
4. Text labels and annotations
5. Flow/direction indicators

Paper Content:
{paper_content}

Generate a comprehensive Visual Schema in the following format:

---BEGIN PROMPT---
[DIAGRAM TITLE]
A clear, descriptive title for the diagram

[OVERALL LAYOUT]
Describe the overall structure and organization

[ZONES/SECTIONS]
Detail each zone or section with:
- Position and size
- Background color/style
- Content description

[VISUAL ELEMENTS]
List all visual elements with:
- Type (box, arrow, icon, etc.)
- Position
- Style (color, border, shadow)
- Content/label

[CONNECTIONS]
Describe connections between elements:
- From/To
- Arrow style
- Labels

[COLOR PALETTE]
List the main colors used

[KEY TEXT LABELS]
Important text annotations
---END PROMPT---`;

const RENDERER_PROMPT_TEMPLATE = `You are an expert academic diagram renderer. Based on the following Visual Schema, generate a high-quality academic diagram suitable for CVPR/NeurIPS publications.

{visual_schema_content}

Create a clean, professional academic diagram with:
- Clear visual hierarchy
- Professional color scheme
- Crisp lines and shapes
- Readable text labels
- Publication-quality aesthetics`;

const RENDERER_WITH_REFERENCES_TEMPLATE = `You are an expert academic diagram renderer. Based on the following Visual Schema and reference images, generate a high-quality academic diagram that matches the style of the references.

{visual_schema_content}

The reference images show the desired aesthetic style. Generate a diagram that:
- Follows the layout and structure from the Visual Schema
- Matches the visual style of the reference images
- Has publication-quality aesthetics suitable for CVPR/NeurIPS`;

/**
 * Generate Visual Schema from paper content using OpenAI-compatible API
 */
export async function generateSchema(
    paperContent: string,
    config: ModelConfig,
    inputImages?: string[]
): Promise<GenerateSchemaResponse> {
    // Check if we should use Google Native API
    // Use Native API if model name starts with 'gemini' and we are likely hitting Google (or if URL implies it)
    // We'll prioritize Native if the model makes sense for it.
    const isGoogleModel = config.modelName.toLowerCase().startsWith('gemini');
    const isGoogleEndpoint = config.baseUrl.includes('googleapis.com') || config.baseUrl.includes('goog') || !config.baseUrl;

    if (isGoogleModel && isGoogleEndpoint) {
        return await generateSchemaGoogleNative(paperContent, config, inputImages);
    }

    // Normalize Base URL: Ensure it ends with /v1 if it's a custom OpenAI endpoint and missing it
    // (unless it's Google, which uses a different format handled above)
    // Normalize Base URL: Ensure it ends with /v1 if it's a custom OpenAI endpoint and missing it
    // (unless it's Google, which uses a different format handled above)
    let finalBaseUrl = config.baseUrl;
    if (!isGoogleModel && !finalBaseUrl.includes('googleapis') && !finalBaseUrl.endsWith('/v1') && !finalBaseUrl.endsWith('/v1/')) {
        // Simple heuristic: if it doesn't look like it has a version path, append /v1
        finalBaseUrl = finalBaseUrl.replace(/\/$/, '') + '/v1';
    }

    const prompt = ARCHITECT_PROMPT_TEMPLATE.replace('{paper_content}', paperContent);

    // Build message content
    let content: any[];

    if (inputImages && inputImages.length > 0) {
        // Multimodal format with images
        content = inputImages.map((img) => ({
            type: 'image_url',
            image_url: { url: img },
        }));
        content.push({
            type: 'text',
            text: prompt,
        });
    } else {
        // Text only
        content = [{
            type: 'text',
            text: prompt,
        }];
    }

    // Use Server-Side Proxy to avoid CORS issues
    const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: config.apiKey,
            baseUrl: finalBaseUrl,
            path: '/chat/completions',
            body: {
                model: config.modelName,
                messages: [{ role: 'user', content }],
                temperature: 0.7,
                max_tokens: 4096,
            }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Proxy Error: ${err.error || response.statusText}`);
    }

    const data = await response.json();
    const schema = data.choices?.[0]?.message?.content || '';
    return { schema };
}

/**
 * Generate Visual Schema using Google Native GenAI SDK
 */
async function generateSchemaGoogleNative(
    paperContent: string,
    config: ModelConfig,
    inputImages?: string[]
): Promise<GenerateSchemaResponse> {
    try {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        const prompt = ARCHITECT_PROMPT_TEMPLATE.replace('{paper_content}', paperContent);

        const contents: any[] = [prompt];

        if (inputImages && inputImages.length > 0) {
            // Convert data URLs to inlineData parts
            // Format: data:image/png;base64,....
            inputImages.forEach(img => {
                const match = img.match(/^data:(image\/[a-z]+);base64,(.+)$/);
                if (match) {
                    contents.push({
                        inlineData: {
                            mimeType: match[1],
                            data: match[2]
                        }
                    });
                }
            });
        }

        const response = await ai.models.generateContent({
            model: config.modelName,
            contents: contents.length === 1 ? contents[0] : contents,
        });

        // Extract text
        let schema = '';
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    schema += part.text;
                }
            }
        }
        return { schema };

    } catch (error: any) {
        console.error("Google Native Schema Gen Error:", error);
        throw new Error(`Google Native API Failed: ${error.message}`);
    }
}

/**
 * Render image from Visual Schema using OpenAI-compatible API or Google Native API
 */
export async function renderImage(
    visualSchema: string,
    config: ModelConfig,
    referenceImages?: string[]
): Promise<RenderImageResponse> {

    // Check if we should use Google Native API (e.g. for gemini-3-pro-image-preview)
    // Check if we should use Google Native API (e.g. for gemini-3-pro-image-preview)
    // ONLY use Native API if it's a Google endpoint. If it's a proxy (like yunwu.ai), use OpenAI client.
    const isGoogleModel = config.modelName.toLowerCase().includes('gemini');
    const isGoogleEndpoint = config.baseUrl.includes('googleapis.com') || config.baseUrl.includes('goog') || !config.baseUrl;
    const shouldUseNative = isGoogleModel && isGoogleEndpoint && config.modelName.includes('gemini-3');

    if (shouldUseNative) {
        return await renderImageGoogleNative(visualSchema, config);
    }

    // Normalize Base URL: Ensure it ends with /v1 if it's a custom OpenAI endpoint and missing it
    // 1. 清理用户可能误填的 /chat/completions 后缀
    let finalBaseUrl = config.baseUrl.replace(/\/chat\/completions\/?$/, '');

    // 2. 清理末尾可能多余的斜杠 (防止 .ai//v1 这种情况)
    finalBaseUrl = finalBaseUrl.replace(/\/$/, '');

    // 3. 判断是否需要补充 /v1
    const isOfficialGoogle = finalBaseUrl.includes('googleapis.com') || finalBaseUrl.includes('goog');

    // 只有在非 Google 官方地址，且当前不以 /v1 结尾时，才追加 /v1
    if (!isOfficialGoogle && !finalBaseUrl.endsWith('/v1')) {
        finalBaseUrl = finalBaseUrl + '/v1';
    }

    // Choose template based on whether reference images are provided
    let prompt: string;
    if (referenceImages && referenceImages.length > 0) {
        prompt = RENDERER_WITH_REFERENCES_TEMPLATE.replace('{visual_schema_content}', visualSchema);
    } else {
        prompt = RENDERER_PROMPT_TEMPLATE.replace('{visual_schema_content}', visualSchema);
    }

    // Build message content
    let content: any[];

    if (referenceImages && referenceImages.length > 0) {
        content = referenceImages.map((img) => ({
            type: 'image_url',
            image_url: { url: img },
        }));
        content.push({
            type: 'text',
            text: prompt,
        });
    } else {
        content = [{
            type: 'text',
            text: prompt,
        }];
    }

    // Use Server-Side Proxy to avoid CORS issues
    const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: config.apiKey,
            baseUrl: finalBaseUrl,
            path: '/chat/completions',
            body: {
                model: config.modelName,
                messages: [{ role: 'user', content }],
                temperature: 0.7,
                max_tokens: 4096,
            }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Proxy Error: ${err.error || response.statusText}`);
    }

    const data = await response.json();
    const resultContent = data.choices?.[0]?.message?.content || '';

    // Try to extract image from response
    if (resultContent) {
        // Look for base64 image pattern
        const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/;
        const match = resultContent.match(base64Pattern);
        if (match) {
            return { imageUrl: match[0] };
        }

        // Check for raw base64 (without data URL prefix)
        if (resultContent.length > 1000 && /^[A-Za-z0-9+/=\s]+$/.test(resultContent)) {
            return { imageUrl: `data:image/png;base64,${resultContent.trim()}` };
        }
    }

    // Attempt to parse JSON response if model outputted JSON
    try {
        const jsonMatch = resultContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonPart = JSON.parse(jsonMatch[0]);
            if (jsonPart.image_url) return { imageUrl: jsonPart.image_url };
            if (jsonPart.b64_json) return { imageUrl: `data:image/png;base64,${jsonPart.b64_json}` };
        }
    } catch (e) {
        // Ignore JSON parse error
    }

    // Fallback: Return raw content if it looks like a URL
    if (resultContent.startsWith('http')) {
        return { imageUrl: resultContent.trim() };
    }

    return { imageUrl: null, text: resultContent };
}

/**
 * Render image using Google Native GenAI SDK (@google/genai)
 * Specifically for models like gemini-3-pro-image-preview
 */
async function renderImageGoogleNative(
    visualSchema: string,
    config: ModelConfig
): Promise<RenderImageResponse> {
    try {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });

        // Construct prompt similar to normal flow
        const prompt = RENDERER_PROMPT_TEMPLATE.replace('{visual_schema_content}', visualSchema);

        const response = await ai.models.generateContent({
            model: config.modelName,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // As per user example
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: "4K" // Assuming high quality requested
                }
            }
        });

        // Extract image from response
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const base64Image = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    return {
                        imageUrl: `data:${mimeType};base64,${base64Image}`
                    };
                }
            }
        }

        return { imageUrl: null, text: "No image generated in Google Native response." };

    } catch (error: any) {
        console.error("Google Native API Error:", error);
        throw new Error(`Google Native API Failed: ${error.message}`);
    }
}
