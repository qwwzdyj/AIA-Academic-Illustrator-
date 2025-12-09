const API_BASE_URL = 'http://localhost:8000';

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

export async function generateSchema(
    paperContent: string,
    config: ModelConfig,
    inputImages?: string[]
): Promise<GenerateSchemaResponse> {
    const response = await fetch(`${API_BASE_URL}/api/generate-schema`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paper_content: paperContent,
            input_images: inputImages,
            config,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to generate schema');
    }

    return response.json();
}

export async function renderImage(
    visualSchema: string,
    config: ModelConfig,
    referenceImages?: string[]
): Promise<RenderImageResponse> {
    const response = await fetch(`${API_BASE_URL}/api/render-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            visual_schema: visualSchema,
            reference_images: referenceImages,
            config,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || 'Failed to render image');
    }

    return response.json();
}
