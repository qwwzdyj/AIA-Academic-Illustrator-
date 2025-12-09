import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ModelConfig {
    baseUrl: string;
    apiKey: string;
    modelName: string;
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    schema: string;
    imageUrl: string | null;
}

interface WorkflowState {
    // Configs (Persisted)
    logicConfig: ModelConfig;
    visionConfig: ModelConfig;

    // App State
    language: 'en' | 'zh';
    currentStep: 1 | 2 | 3;
    paperContent: string;
    generatedSchema: string;
    generatedImage: string | null;
    referenceImages: string[]; // Base64 encoded
    history: HistoryItem[];

    // Hydration flag
    _hasHydrated: boolean;

    // Actions
    setLogicConfig: (config: ModelConfig) => void;
    setVisionConfig: (config: ModelConfig) => void;
    setLanguage: (lang: 'en' | 'zh') => void;
    setCurrentStep: (step: 1 | 2 | 3) => void;
    setPaperContent: (content: string) => void;
    setGeneratedSchema: (schema: string) => void;
    setGeneratedImage: (image: string | null) => void;
    addReferenceImage: (image: string) => void;
    removeReferenceImage: (index: number) => void;
    clearReferenceImages: () => void;
    addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
    loadFromHistory: (id: string) => void;
    resetProject: () => void;
    setHasHydrated: (state: boolean) => void;
}

const defaultLogicConfig: ModelConfig = {
    baseUrl: 'https://api.deepseek.com',
    apiKey: '',
    modelName: 'deepseek-chat',
};

const defaultVisionConfig: ModelConfig = {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: '',
    modelName: 'gemini-3-pro-image-preview',
};

export const useWorkflowStore = create<WorkflowState>()(
    persist(
        (set, get) => ({
            // Initial state
            logicConfig: defaultLogicConfig,
            visionConfig: defaultVisionConfig,
            language: 'zh',
            currentStep: 1,
            paperContent: '',
            generatedSchema: '',
            generatedImage: null,
            referenceImages: [],
            history: [],
            _hasHydrated: false,

            // Actions
            setLogicConfig: (config) => set({ logicConfig: config }),
            setVisionConfig: (config) => set({ visionConfig: config }),
            setLanguage: (lang) => set({ language: lang }),
            setCurrentStep: (step) => set({ currentStep: step }),
            setPaperContent: (content) => set({ paperContent: content }),
            setGeneratedSchema: (schema) => set({ generatedSchema: schema }),
            setGeneratedImage: (image) => set({ generatedImage: image }),

            addReferenceImage: (image) => set((state) => ({
                referenceImages: [...state.referenceImages, image]
            })),

            removeReferenceImage: (index) => set((state) => ({
                referenceImages: state.referenceImages.filter((_, i) => i !== index)
            })),

            clearReferenceImages: () => set({ referenceImages: [] }),

            addToHistory: (item) => set((state) => ({
                history: [
                    {
                        ...item,
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                    },
                    ...state.history.slice(0, 9), // Keep last 10 items
                ]
            })),

            loadFromHistory: (id) => {
                const item = get().history.find((h) => h.id === id);
                if (item) {
                    set({
                        generatedSchema: item.schema,
                        generatedImage: item.imageUrl,
                    });
                }
            },

            resetProject: () => set({
                paperContent: '',
                generatedSchema: '',
                generatedImage: null,
                referenceImages: [],
                currentStep: 1,
            }),

            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'academic-illustrator-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                logicConfig: state.logicConfig,
                visionConfig: state.visionConfig,
                language: state.language,
                paperContent: state.paperContent,
                generatedSchema: state.generatedSchema,
                history: state.history,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
