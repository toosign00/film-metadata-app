'use client';

import { Check } from 'lucide-react';
import type { StepNavigationProps } from '@/types/stepNavigation.types';

const steps = [
  { number: 1, label: 'Select' },
  { number: 2, label: 'Metadata' },
  { number: 3, label: 'Export' },
];

export const StepNavigation = ({
  activeStep,
  filesCount,
  resultsCount,
  processing,
  goToStep,
}: StepNavigationProps) => {
  const isStepEnabled = (stepNumber: number) => {
    if (processing) return false;
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return filesCount > 0;
    return resultsCount > 0;
  };

  return (
    <nav aria-label='작업 진행 단계' className='border-b border-border'>
      <ol className='mx-auto flex h-14 w-full max-w-5xl items-center px-4 sm:px-6'>
        {steps.map((step, index) => {
          const enabled = isStepEnabled(step.number);
          const completed = step.number < activeStep;
          const active = step.number === activeStep;

          return (
            <li
              key={step.number}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <button
                type='button'
                onClick={() => goToStep(step.number)}
                disabled={!enabled}
                aria-current={active ? 'step' : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset ${
                  enabled ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    completed
                      ? 'bg-primary text-primary-foreground'
                      : active
                        ? 'bg-foreground text-background'
                        : 'border border-border-hover text-foreground-muted'
                  }`}
                >
                  {completed ? (
                    <Check aria-hidden='true' size={12} strokeWidth={3} />
                  ) : (
                    step.number.toString().padStart(2, '0')
                  )}
                </span>
                <span
                  className={`hidden text-sm sm:inline ${
                    active ? 'font-semibold text-foreground' : 'text-foreground-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <span
                  aria-hidden='true'
                  className={`mx-4 h-px flex-1 ${completed ? 'bg-primary/50' : 'bg-border'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
