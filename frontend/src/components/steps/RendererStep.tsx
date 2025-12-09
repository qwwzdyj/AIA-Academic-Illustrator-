'use client';

import { Download, FileText, History as HistoryIcon, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkflowStore } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';

export function RendererStep() {
    const {
        language,
        generatedImage,
        generatedSchema,
        history,
        loadFromHistory,
    } = useWorkflowStore();
    const t = useTranslation(language);

    const handleDownloadImage = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        if (generatedImage.startsWith('data:')) {
            link.href = generatedImage;
        } else {
            link.href = generatedImage;
            link.target = '_blank';
        }
        link.download = `academic-diagram-${Date.now()}.png`;
        link.click();
    };

    const handleExportSchema = () => {
        const blob = new Blob([generatedSchema], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `visual-schema-${Date.now()}.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-7xl mx-auto"
        >
            <div className="grid md:grid-cols-4 gap-6">
                {/* Main Canvas */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">{t('generatedDiagram')}</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportSchema}
                                    className="border-slate-200"
                                >
                                    <FileText className="w-4 h-4 mr-1.5" />
                                    {t('exportSchema')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadImage}
                                    disabled={!generatedImage}
                                    className="border-slate-200"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    {t('downloadImage')}
                                </Button>
                            </div>
                        </div>

                        {/* Canvas with dot pattern background */}
                        <div
                            className="relative rounded-lg min-h-[500px] flex items-center justify-center overflow-hidden"
                            style={{
                                backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
                                backgroundSize: '20px 20px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {generatedImage ? (
                                <Card className="p-4 bg-white shadow-sm max-w-full">
                                    <img
                                        src={generatedImage}
                                        alt="Generated academic diagram"
                                        className="max-w-full max-h-[600px] object-contain"
                                    />
                                </Card>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>{t('noImage')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-24">
                        <div className="flex items-center gap-2 mb-4">
                            <HistoryIcon className="w-4 h-4 text-slate-500" />
                            <h3 className="font-semibold text-slate-900">{t('history')}</h3>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-auto">
                            {history.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">
                                    No history yet
                                </p>
                            ) : (
                                history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => loadFromHistory(item.id)}
                                        className="w-full p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left"
                                    >
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt="History item"
                                                className="w-full h-16 object-cover rounded mb-2"
                                            />
                                        ) : (
                                            <div className="w-full h-16 bg-slate-100 rounded mb-2 flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-500">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
