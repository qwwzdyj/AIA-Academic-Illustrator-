'use client';

import { useState, useCallback, useRef } from 'react';
import { Loader2, Image as ImageIcon, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkflowStore } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { renderImage } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import for Monaco Editor (SSR disabled)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] bg-slate-100 animate-pulse rounded-lg" />
    ),
});

export function ReviewStep() {
    const {
        language,
        paperContent,
        generatedSchema,
        setGeneratedSchema,
        referenceImages,
        addReferenceImage,
        removeReferenceImage,
        setGeneratedImage,
        setCurrentStep,
        visionConfig,
        addToHistory,
        canAddToHistory,
        getHistoryCount,
    } = useWorkflowStore();
    const t = useTranslation(language);
    const [isRendering, setIsRendering] = useState(false);
    const [mobileTab, setMobileTab] = useState<'source' | 'editor' | 'reference'>('editor');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateSchema = (schema: string): boolean => {
        return schema.includes('---BEGIN PROMPT---') && schema.includes('---END PROMPT---');
    };

    const handleRender = async () => {
        // Check history limit first
        if (!canAddToHistory()) {
            toast.error(
                language === 'zh'
                    ? '🚫 缓存已满（2/2）！请先到【步骤3】下载保存图片，然后删除历史记录后再渲染。'
                    : '🚫 Cache full (2/2)! Please go to Step 3 to download and delete history before rendering.',
                { duration: 5000 }
            );
            // Navigate to step 3 so user can manage history
            setCurrentStep(3);
            return;
        }

        if (!visionConfig.apiKey) {
            toast.error(t('missingApiKey'));
            return;
        }

        if (!validateSchema(generatedSchema)) {
            toast.error(t('schemaError'));
            return;
        }

        setIsRendering(true);
        try {
            const response = await renderImage(generatedSchema, visionConfig, referenceImages);
            if (response.imageUrl) {
                setGeneratedImage(response.imageUrl);
                addToHistory({ schema: generatedSchema, imageUrl: response.imageUrl });
                setCurrentStep(3);
                toast.success(language === 'zh' ? '图片渲染成功！' : 'Image rendered successfully!');
            } else {
                toast.error(language === 'zh' ? '未生成图片，请检查模型配置' : 'No image was generated. Please check your model configuration.');
            }
        } catch (error) {
            console.error(error);
            toast.error(t('generationFailed'));
        } finally {
            setIsRendering(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        addReferenceImage(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }, [addReferenceImage]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        addReferenceImage(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-7xl mx-auto"
        >
            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
                {/* Left: Source Input */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4">{t('sourceInput')}</h3>
                    <div className="h-[400px] overflow-auto bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-600">
                        {paperContent || 'No content'}
                    </div>
                </div>

                {/* Right: Schema Editor */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4">{t('blueprintEditor')}</h3>
                    <div className="h-[400px] rounded-lg overflow-hidden border border-slate-200">
                        <MonacoEditor
                            height="100%"
                            defaultLanguage="markdown"
                            value={generatedSchema}
                            onChange={(value) => setGeneratedSchema(value || '')}
                            theme="vs-light"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                padding: { top: 16 },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
                <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                        <TabsTrigger value="source">{t('sourceInput')}</TabsTrigger>
                        <TabsTrigger value="editor">{t('blueprintEditor')}</TabsTrigger>
                        <TabsTrigger value="reference">{t('referenceImages')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="source" className="mt-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 h-[500px] overflow-auto font-mono text-sm">
                            {paperContent || 'No content'}
                        </div>
                    </TabsContent>
                    <TabsContent value="editor" className="mt-4">
                        <div className="h-[500px] rounded-lg overflow-hidden border border-slate-200">
                            <MonacoEditor
                                height="100%"
                                defaultLanguage="markdown"
                                value={generatedSchema}
                                onChange={(value) => setGeneratedSchema(value || '')}
                                theme="vs-light"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    wordWrap: 'on',
                                }}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="reference" className="mt-4">
                        <ReferenceImagePanel
                            images={referenceImages}
                            onAdd={addReferenceImage}
                            onRemove={removeReferenceImage}
                            onDrop={handleDrop}
                            fileInputRef={fileInputRef}
                            onFileSelect={handleFileSelect}
                            t={t}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Reference Images (Desktop) */}
            <div className="hidden md:block mt-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-2">{t('referenceImages')}</h3>
                    <p className="text-sm text-slate-500 mb-4">{t('addReference')}</p>
                    <ReferenceImagePanel
                        images={referenceImages}
                        onAdd={addReferenceImage}
                        onRemove={removeReferenceImage}
                        onDrop={handleDrop}
                        fileInputRef={fileInputRef}
                        onFileSelect={handleFileSelect}
                        t={t}
                    />
                </div>
            </div>

            {/* Render Button */}
            <div className="mt-6 flex justify-end">
                <Button
                    onClick={handleRender}
                    disabled={isRendering || !generatedSchema.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 transition-transform"
                >
                    {isRendering ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('rendering')}
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            {t('renderImage')}
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}

interface ReferenceImagePanelProps {
    images: string[];
    onAdd: (image: string) => void;
    onRemove: (index: number) => void;
    onDrop: (e: React.DragEvent) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    t: ReturnType<typeof useTranslation>;
}

function ReferenceImagePanel({
    images,
    onRemove,
    onDrop,
    fileInputRef,
    onFileSelect,
    t,
}: ReferenceImagePanelProps) {
    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">{t('dragDropImages')}</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onFileSelect}
                />
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={img}
                                alt={`Reference ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                                onClick={() => onRemove(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
