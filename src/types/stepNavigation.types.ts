export interface StepNavigationProps {
  activeStep: number;
  filesCount: number;
  resultsCount: number;
  processing: boolean;
  goToStep: (step: number) => void;
}
