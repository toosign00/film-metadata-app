export interface HeaderProps {
  className?: string;
  activeStep?: number;
  filesCount?: number;
  resultsCount?: number;
  processing?: boolean;
  goToStep?: (step: number) => void;
}
