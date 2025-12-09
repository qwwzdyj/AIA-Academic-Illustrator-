'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { Stepper } from '@/components/Stepper';
import { ArchitectStep } from '@/components/steps/ArchitectStep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import { RendererStep } from '@/components/steps/RendererStep';
import { useWorkflowStore } from '@/store/workflowStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { currentStep, _hasHydrated } = useWorkflowStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Prevent hydration mismatch
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Stepper />

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ArchitectStep />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ReviewStep />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <RendererStep />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
