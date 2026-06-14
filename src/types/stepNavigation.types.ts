export interface StepNavigationProps {
  activeStep: number;
  filesCount: number;
  resultsCount: number;
  errorsCount: number;
  processing: boolean;
  goToStep: (step: number) => void;
}
