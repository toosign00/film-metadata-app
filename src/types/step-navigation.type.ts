export interface StepNavigationProps {
  activeStep: number;
  goToStep: (step: number) => void;
  filesCount: number;
  resultsCount: number;
  resetForm: () => void;
  processing?: boolean;
}
