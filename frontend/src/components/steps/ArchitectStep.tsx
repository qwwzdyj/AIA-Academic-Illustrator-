'use client';

import { useState, useCallback, useRef } from 'react';
import { Sparkles, Loader2, Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { generateSchema } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function ArchitectStep() {
    const {
        language,
        paperContent,
        setPaperContent,
        setGeneratedSchema,
        setCurrentStep,
        logicConfig,
    } = useWorkflowStore();
    const t = useTranslation(language);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; base64: string; type: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!logicConfig.apiKey) {
            toast.error(t('missingApiKey'));
            return;
        }

        if (!paperContent.trim() && uploadedFiles.length === 0) {
            toast.error(language === 'zh' ? '请输入文本或上传文件' : 'Please enter text or upload files');
            return;
        }

        setIsGenerating(true);
        try {
            const inputImages = uploadedFiles.length > 0
                ? uploadedFiles.map(f => f.base64)
                : undefined;

            const contentToSend = paperContent.trim() ||
                (language === 'zh'
                    ? '请分析上传的文档并生成视觉架构。'
                    : 'Please analyze the uploaded document(s) and generate a Visual Schema.');

            const response = await generateSchema(contentToSend, logicConfig, inputImages);
            setGeneratedSchema(response.schema);
            setCurrentStep(2);
            toast.success(language === 'zh' ? '蓝图生成成功！' : 'Blueprint generated successfully!');
        } catch (error) {
            console.error(error);
            toast.error(t('generationFailed'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = useCallback((files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setUploadedFiles(prev => [...prev, {
                        name: file.name,
                        base64: event.target!.result as string,
                        type: file.type,
                    }]);
                }
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    }, [handleFileUpload]);

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-4xl mx-auto"
        >
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {t('step1Title')}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('step1Desc')}
                    </p>
                </div>

                {/* Unified Input Area */}
                <div
                    className="relative"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {/* Text Input */}
                    <Textarea
                        value={paperContent}
                        onChange={(e) => setPaperContent(e.target.value)}
                        placeholder={t('paperPlaceholder')}
                        className="min-h-[300px] resize-none border-slate-200 focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm pb-16"
                    />

                    {/* Bottom Toolbar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        {/* Attachment Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            <Paperclip className="w-4 h-4" />
                            {language === 'zh' ? '添加附件' : 'Add Attachment'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,image/*,application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files)}
                        />

                        {/* Character Count */}
                        <span className="text-xs text-slate-400">
                            {paperContent.length} {language === 'zh' ? '字符' : 'chars'}
                        </span>
                    </div>
                </div>

                {/* Uploaded Files */}
                <AnimatePresence>
                    {uploadedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                        >
                            <p className="text-sm font-medium text-slate-700 mb-2">
                                {language === 'zh' ? '已添加附件:' : 'Attachments:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {uploadedFiles.map((file, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative group flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200"
                                    >
                                        {file.type.includes('pdf') ? (
                                            <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        ) : (
                                            <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        )}
                                        <span className="text-sm text-slate-600 max-w-[150px] truncate">
                                            {file.name}
                                        </span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="ml-1 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hint */}
                <p className="mt-3 text-xs text-slate-400">
                    {language === 'zh'
                        ? '💡 提示：可以同时输入文字描述和上传文档（PDF/图片），AI 会综合分析生成蓝图'
                        : '💡 Tip: You can enter text and upload documents (PDF/images) together. AI will analyze them comprehensively.'}
                </p>

                {/* Generate Button */}
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!paperContent.trim() && uploadedFiles.length === 0)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 transition-transform"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('generating')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('generateBlueprint')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
