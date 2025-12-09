'use client';

import { useWorkflowStore } from '@/store/workflowStore';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
    { step: 1 as const, titleKey: 'step1Title', descKey: 'step1Desc' },
    { step: 2 as const, titleKey: 'step2Title', descKey: 'step2Desc' },
    { step: 3 as const, titleKey: 'step3Title', descKey: 'step3Desc' },
];

export function Stepper() {
    const { language, currentStep, setCurrentStep, generatedSchema, generatedImage } = useWorkflowStore();
    const t = useTranslation(language);

    const canNavigateTo = (step: 1 | 2 | 3) => {
        if (step === 1) return true;
        if (step === 2) return !!generatedSchema;
        if (step === 3) return !!generatedSchema;
        return false;
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <div className="flex items-center justify-between">
                {steps.map((item, index) => (
                    <div key={item.step} className="flex items-center">
                        {/* Step indicator */}
                        <button
                            onClick={() => canNavigateTo(item.step) && setCurrentStep(item.step)}
                            disabled={!canNavigateTo(item.step)}
                            className={`relative flex flex-col items-center ${canNavigateTo(item.step) ? 'cursor-pointer' : 'cursor-not-allowed'
                                }`}
                        >
                            {/* Circle */}
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep === item.step
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : currentStep > item.step
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'bg-white border-slate-300 text-slate-400'
                                    }`}
                                whileHover={canNavigateTo(item.step) ? { scale: 1.05 } : {}}
                                whileTap={canNavigateTo(item.step) ? { scale: 0.95 } : {}}
                            >
                                {currentStep > item.step ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="font-semibold">{item.step}</span>
                                )}
                            </motion.div>

                            {/* Label */}
                            <div className="mt-3 text-center">
                                <p
                                    className={`font-medium text-sm ${currentStep === item.step ? 'text-indigo-600' : 'text-slate-600'
                                        }`}
                                >
                                    {t(item.titleKey as any)}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {t(item.descKey as any)}
                                </p>
                            </div>

                            {/* Active indicator */}
                            {currentStep === item.step && (
                                <motion.div
                                    layoutId="activeStep"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600"
                                />
                            )}
                        </button>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4 h-0.5 min-w-[80px]">
                                <div
                                    className={`h-full rounded-full transition-colors ${currentStep > item.step ? 'bg-emerald-500' : 'bg-slate-200'
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
