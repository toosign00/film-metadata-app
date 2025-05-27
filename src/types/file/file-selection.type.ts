export interface FileSelectionProps {
  activeStep: number;
  onFileSelect: (files: File[]) => void;
  sortedFiles: File[];
  goToStep: (step: number) => void;
  resetForm: () => void;
}
