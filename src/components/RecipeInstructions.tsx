'use client';

import { useState, useEffect, useRef } from 'react';

interface RecipeInstructionsProps {
  steps: string;
}

export default function RecipeInstructions({ steps }: RecipeInstructionsProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Filter out empty lines to ensure the step count is accurate
  const stepList = steps.split('\n').filter((step) => step.trim() !== '');

  const handleStepClick = () => {
    if (activeStep === null) {
      setActiveStep(0);
    } else if (activeStep < stepList.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(null);
    }
  };

  const handleCancel = () => {
    setActiveStep(null);
  };

  useEffect(() => {
    if (activeStep !== null && stepRefs.current[activeStep]) {
      stepRefs.current[activeStep]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeStep]);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <span className="text-orange-500">📝</span> Instructions
        </h2>
        <div className="flex items-center gap-2">
          {activeStep !== null && (
            <button
              onClick={handleCancel}
              className="text-sm text-stone-500 hover:text-stone-800 font-bold px-4 py-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              Exit
            </button>
          )}
          <button
            onClick={handleStepClick}
            className={`px-6 py-3 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
              activeStep === null
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {activeStep === null ? '🧑‍🍳 Start Cooking' : activeStep < stepList.length - 1 ? 'Next Step' : 'Finish'}
          </button>
        </div>
      </div>

      <ol className="space-y-6 text-lg text-stone-700 relative">
        {stepList.map((step, i) => (
          <li
            key={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
              activeStep === i
                ? 'bg-orange-50'
                : activeStep !== null
                ? 'opacity-40'
                : 'hover:bg-stone-50'
            }`}
          >
            <div className="flex-shrink-0">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm transition-colors ${
                  activeStep === i
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-stone-300 text-white bg-emerald-600'
                }`}
              >
                {i + 1}
              </span>
            </div>
            <p className={`leading-relaxed pt-0.5 ${activeStep === i ? 'font-medium text-stone-900' : ''}`}>
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
