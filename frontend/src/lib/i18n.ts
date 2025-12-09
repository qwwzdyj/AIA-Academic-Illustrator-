export const translations = {
    en: {
        // Header
        appTitle: 'Academic Illustrator',
        settings: 'Settings',
        resetProject: 'Reset Project',

        // Settings Modal
        settingsTitle: 'Model Configuration',
        logicModel: 'Logic Model (Step 1)',
        visionModel: 'Vision Model (Step 2)',
        baseUrl: 'Base URL',
        apiKey: 'API Key',
        modelName: 'Model Name',
        save: 'Save',
        cancel: 'Cancel',

        // Stepper
        step1Title: 'The Architect',
        step1Desc: 'Generate Visual Schema',
        step2Title: 'The Review',
        step2Desc: 'Edit & Refine Schema',
        step3Title: 'The Renderer',
        step3Desc: 'Generate Image',

        // Step 1
        paperPlaceholder: 'Paste your paper abstract or method description here, or upload a document',
        generateBlueprint: 'Generate Blueprint',
        generating: 'Generating...',

        // Step 2
        sourceInput: 'Source Input',
        blueprintEditor: 'Blueprint Editor',
        referenceImages: 'Reference Images',
        addReference: 'Add reference diagrams for style guidance',
        dragDropImages: 'Drag & drop images here, or click to upload',
        renderImage: 'Render Image',
        rendering: 'Rendering...',
        schemaError: 'Invalid Schema Format: Please preserve the BEGIN/END tags.',

        // Step 3
        generatedDiagram: 'Generated Diagram',
        chatRefinement: 'Chat Refinement',
        downloadImage: 'Download Image',
        exportSchema: 'Export Schema',
        history: 'History',
        noImage: 'No image generated yet',

        // Errors
        missingApiKey: 'Please configure your API key in Settings',
        generationFailed: 'Generation failed. Please try again.',
    },
    zh: {
        // Header
        appTitle: '学术插图师',
        settings: '设置',
        resetProject: '重置项目',

        // Settings Modal
        settingsTitle: '模型配置',
        logicModel: '逻辑模型 (步骤 1)',
        visionModel: '视觉模型 (步骤 2)',
        baseUrl: '接口地址',
        apiKey: 'API 密钥',
        modelName: '模型名称',
        save: '保存',
        cancel: '取消',

        // Stepper
        step1Title: '架构师',
        step1Desc: '生成视觉架构',
        step2Title: '审阅',
        step2Desc: '编辑与优化架构',
        step3Title: '渲染器',
        step3Desc: '生成图像',

        // Step 1
        paperPlaceholder: '在此粘贴您的论文摘要或方法描述,推荐直接上传文档',
        generateBlueprint: '生成蓝图',
        generating: '生成中...',

        // Step 2
        sourceInput: '源输入',
        blueprintEditor: '蓝图编辑器',
        referenceImages: '参考图片',
        addReference: '添加参考图表用于风格指导',
        dragDropImages: '拖拽图片到此处，或点击上传',
        renderImage: '渲染图像',
        rendering: '渲染中...',
        schemaError: '无效的架构格式：请保留 BEGIN/END 标签。',

        // Step 3
        generatedDiagram: '生成的图表',
        chatRefinement: '对话优化',
        downloadImage: '下载图片',
        exportSchema: '导出架构',
        history: '历史记录',
        noImage: '尚未生成图像',

        // Errors
        missingApiKey: '请在设置中配置您的 API 密钥',
        generationFailed: '生成失败，请重试。',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function useTranslation(language: 'en' | 'zh') {
    return (key: TranslationKey): string => {
        return translations[language][key] || key;
    };
}
