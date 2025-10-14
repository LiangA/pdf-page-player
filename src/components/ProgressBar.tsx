import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressBar = ({ currentStep, totalSteps, steps }: ProgressBarProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                index < currentStep
                  ? "bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground shadow-md"
                  : index === currentStep
                  ? "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-lg scale-110"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <div
              className={cn(
                "text-xs mt-2 font-medium text-center hidden md:block",
                index === currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};
