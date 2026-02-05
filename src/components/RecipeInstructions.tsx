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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <span className="text-orange-500">📝</span> Instructions
        </h2>
        {activeStep !== null && (
          <button
            onClick={handleCancel}
            className="text-stone-500 hover:text-stone-800 font-bold px-4 py-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            Exit Cooking Mode
          </button>
        )}
      </div>

      <div className="mb-8 sticky top-4 z-10">
        <button
          onClick={handleStepClick}
          className={`w-full md:w-auto px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${
            activeStep === null
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : activeStep < stepList.length - 1
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-stone-800 text-white hover:bg-stone-900'
          }`}
        >
          {activeStep === null ? (
            <>Start Cooking Mode 👨‍🍳</>
          ) : activeStep < stepList.length - 1 ? (
            <>Next Step &rarr;</>
          ) : (
            <>Finish Cooking 🎉</>
          )}
        </button>
      </div>

      <ol className="space-y-6 text-lg text-stone-700 relative">
        {stepList.map((step, i) => (
          <li
            key={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={`flex gap-4 p-6 rounded-3xl transition-all duration-500 border-2 ${
              activeStep === i
                ? 'bg-orange-50 border-orange-200 shadow-xl scale-105 transform'
                : activeStep !== null
                ? 'opacity-30 blur-[1px] border-transparent grayscale'
                : 'border-transparent hover:bg-stone-50'
            }`}
          >
            <div className="relative flex-shrink-0">
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-colors ${
                  activeStep === i
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {i + 1}
              </span>
            </div>
            <span className={`mt-1 leading-relaxed ${activeStep === i ? 'font-medium text-stone-900' : ''}`}>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
