'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useWorkflowStore, ModelConfig } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const { language, logicConfig, visionConfig, setLogicConfig, setVisionConfig } = useWorkflowStore();
    const t = useTranslation(language);

    const [localLogicConfig, setLocalLogicConfig] = useState<ModelConfig>(logicConfig);
    const [localVisionConfig, setLocalVisionConfig] = useState<ModelConfig>(visionConfig);
    const [showLogicKey, setShowLogicKey] = useState(false);
    const [showVisionKey, setShowVisionKey] = useState(false);

    const handleSave = () => {
        setLogicConfig(localLogicConfig);
        setVisionConfig(localVisionConfig);
        onOpenChange(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent className="sm:max-w-[600px] bg-white border-slate-200">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                    {t('settingsTitle')}
                                </DialogTitle>
                            </DialogHeader>

                            <Tabs defaultValue="logic" className="mt-6">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                                    <TabsTrigger
                                        value="logic"
                                        className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                                    >
                                        {t('logicModel')}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="vision"
                                        className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                                    >
                                        {t('visionModel')}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="logic" className="space-y-4 mt-4">
                                    <ConfigForm
                                        config={localLogicConfig}
                                        onChange={setLocalLogicConfig}
                                        showKey={showLogicKey}
                                        onToggleKey={() => setShowLogicKey(!showLogicKey)}
                                        t={t}
                                    />
                                </TabsContent>

                                <TabsContent value="vision" className="space-y-4 mt-4">
                                    <ConfigForm
                                        config={localVisionConfig}
                                        onChange={setLocalVisionConfig}
                                        showKey={showVisionKey}
                                        onToggleKey={() => setShowVisionKey(!showVisionKey)}
                                        t={t}
                                    />
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="border-slate-200"
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {t('save')}
                                </Button>
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

interface ConfigFormProps {
    config: ModelConfig;
    onChange: (config: ModelConfig) => void;
    showKey: boolean;
    onToggleKey: () => void;
    t: ReturnType<typeof useTranslation>;
}

function ConfigForm({ config, onChange, showKey, onToggleKey, t }: ConfigFormProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="baseUrl" className="text-slate-700">
                    {t('baseUrl')}
                </Label>
                <Input
                    id="baseUrl"
                    value={config.baseUrl}
                    onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className="h-10 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-slate-700">
                    {t('apiKey')}
                </Label>
                <div className="relative">
                    <Input
                        id="apiKey"
                        type={showKey ? 'text' : 'password'}
                        value={config.apiKey}
                        onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                        placeholder="sk-xxxx..."
                        className="h-10 pr-10 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                        type="button"
                        onClick={onToggleKey}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="modelName" className="text-slate-700">
                    {t('modelName')}
                </Label>
                <Input
                    id="modelName"
                    value={config.modelName}
                    onChange={(e) => onChange({ ...config, modelName: e.target.value })}
                    placeholder="gpt-4, deepseek-chat, gemini-pro..."
                    className="h-10 border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>
        </div>
    );
}
