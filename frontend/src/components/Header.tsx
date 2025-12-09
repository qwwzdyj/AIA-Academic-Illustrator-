'use client';

import { Settings, RotateCcw, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';

interface HeaderProps {
    onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
    const { language, setLanguage, resetProject } = useWorkflowStore();
    const t = useTranslation(language);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                            {t('appTitle')}
                        </h1>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Language Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <Globe className="w-4 h-4 mr-1.5" />
                            {language === 'en' ? 'EN' : '中文'}
                        </Button>

                        {/* Reset Project */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetProject}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <RotateCcw className="w-4 h-4 mr-1.5" />
                            {t('resetProject')}
                        </Button>

                        {/* Settings */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenSettings}
                            className="border-slate-200 hover:bg-slate-50"
                        >
                            <Settings className="w-4 h-4 mr-1.5" />
                            {t('settings')}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
