'use client';

import { Download, FileText, History as HistoryIcon, ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkflowStore } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function RendererStep() {
    const {
        language,
        generatedImage,
        generatedSchema,
        history,
        loadFromHistory,
        deleteFromHistory,
        clearHistory,
        getHistoryCount,
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

        toast.success(language === 'zh' ? '图片已下载' : 'Image downloaded');
    };

    const handleExportSchema = () => {
        const blob = new Blob([generatedSchema], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `visual-schema-${Date.now()}.md`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success(language === 'zh' ? 'Schema 已导出' : 'Schema exported');
    };

    const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteFromHistory(id);
        toast.success(language === 'zh' ? '已删除，现在可以继续渲染' : 'Deleted, you can now render');
    };

    const handleClearHistory = () => {
        if (confirm(language === 'zh' ? '确定清空所有历史记录？' : 'Clear all history?')) {
            clearHistory();
            toast.success(language === 'zh' ? '历史记录已清空' : 'History cleared');
        }
    };

    const historyCount = getHistoryCount();
    const isHistoryFull = historyCount >= 2;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-7xl mx-auto"
        >
            {/* History Full Warning */}
            <AnimatePresence>
                {isHistoryFull && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">
                                {language === 'zh' ? '⚠️ 缓存已满' : '⚠️ Cache Full'}
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                                {language === 'zh'
                                    ? '请下载保存您需要的图片，然后删除历史记录以继续渲染新图片。'
                                    : 'Please download images you need, then delete history to render new images.'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                    className="border-slate-800 text-slate-800 hover:bg-slate-100"
                                >
                                    <FileText className="w-4 h-4 mr-1.5" />
                                    {t('exportSchema')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadImage}
                                    disabled={!generatedImage}
                                    className="border-slate-800 text-slate-800 hover:bg-slate-100 disabled:border-slate-300 disabled:text-slate-300"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    {t('downloadImage')}
                                </Button>
                            </div>
                        </div>

                        {/* Save reminder when image exists */}
                        {generatedImage && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    💾 {language === 'zh'
                                        ? '重要：请点击「下载图片」保存到本地！关闭页面后需要从历史记录重新加载。'
                                        : 'Important: Click "Download Image" to save locally!'}
                                </p>
                            </div>
                        )}

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
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <HistoryIcon className="w-4 h-4 text-slate-500" />
                                <h3 className="font-semibold text-slate-900">{t('history')}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isHistoryFull ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {historyCount}/2
                                </span>
                            </div>
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    {language === 'zh' ? '清空' : 'Clear'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-auto">
                            {history.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">
                                    {language === 'zh' ? '暂无历史记录' : 'No history yet'}
                                </p>
                            ) : (
                                history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative group"
                                    >
                                        <button
                                            onClick={() => loadFromHistory(item.id)}
                                            className="w-full p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left"
                                        >
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt="History item"
                                                    className="w-full h-20 object-cover rounded mb-2"
                                                />
                                            ) : (
                                                <div className="w-full h-20 bg-slate-100 rounded mb-2 flex items-center justify-center">
                                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                        </button>
                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteHistory(item.id, e)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title={language === 'zh' ? '删除' : 'Delete'}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Help text */}
                        <p className="mt-4 text-xs text-slate-400 text-center">
                            {language === 'zh'
                                ? '点击历史记录可加载，悬停显示删除按钮'
                                : 'Click to load, hover to delete'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
