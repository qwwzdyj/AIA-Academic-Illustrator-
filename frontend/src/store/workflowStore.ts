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
    deleteFromHistory: (id: string) => void;
    clearHistory: () => void;
    resetProject: () => void;
    setHasHydrated: (state: boolean) => void;
    canAddToHistory: () => boolean; // Check if we can add new history
    getHistoryCount: () => number;
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

// Maximum number of history items with images (to prevent storage overflow)
const MAX_HISTORY_ITEMS = 2;

// Safe localStorage wrapper with quota handling
const safeStorage = {
    getItem: (name: string): string | null => {
        try {
            return localStorage.getItem(name);
        } catch {
            return null;
        }
    },
    setItem: (name: string, value: string): void => {
        try {
            localStorage.setItem(name, value);
        } catch (e) {
            console.warn('localStorage quota exceeded:', e);
            throw e;
        }
    },
    removeItem: (name: string): void => {
        try {
            localStorage.removeItem(name);
        } catch {
            // Ignore errors
        }
    },
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

            // Check if we can add new history (limit: 2)
            canAddToHistory: () => {
                return get().history.length < MAX_HISTORY_ITEMS;
            },

            getHistoryCount: () => {
                return get().history.length;
            },

            addToHistory: (item) => {
                const state = get();
                // Don't add if at limit
                if (state.history.length >= MAX_HISTORY_ITEMS) {
                    console.warn('History limit reached, cannot add new item');
                    return;
                }

                const newItem: HistoryItem = {
                    ...item,
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                };

                const newHistory = [newItem, ...state.history];

                try {
                    set({ history: newHistory });
                } catch (e) {
                    console.warn('Failed to save to history:', e);
                }
            },

            loadFromHistory: (id) => {
                const item = get().history.find((h) => h.id === id);
                if (item) {
                    set({
                        generatedSchema: item.schema,
                        generatedImage: item.imageUrl,
                        currentStep: 3, // Go to step 3 to view the image
                    });
                }
            },

            deleteFromHistory: (id) => set((state) => ({
                history: state.history.filter((h) => h.id !== id),
            })),

            clearHistory: () => set({ history: [] }),

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
            storage: createJSONStorage(() => safeStorage),
            partialize: (state) => ({
                logicConfig: state.logicConfig,
                visionConfig: state.visionConfig,
                language: state.language,
                paperContent: state.paperContent,
                generatedSchema: state.generatedSchema,
                // Save full images in history (max 2 items)
                history: state.history,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
