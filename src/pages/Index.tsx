import { useState } from "react";
import { WealthAnalysisHero } from "@/components/WealthAnalysisHero";
import { ProgressBar } from "@/components/ProgressBar";
import { FamilyMembersForm } from "@/components/FamilyMembersForm";
import { FinancialGoalsForm } from "@/components/FinancialGoalsForm";
import { FamilySecurityForm } from "@/components/FamilySecurityForm";
import { MedicalProtectionForm } from "@/components/MedicalProtectionForm";
import { ChildrenEducationForm } from "@/components/ChildrenEducationForm";
import { FinancialFreedomForm } from "@/components/FinancialFreedomForm";
import { SummaryView } from "@/components/SummaryView";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const steps = ["開始", "家庭成員", "財務目標", "家庭保障", "醫療保障", "子女教育", "財務自由", "完成"];

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setFormData({});
  };

  if (currentStep === 0) {
    return <WealthAnalysisHero onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <ProgressBar currentStep={currentStep} totalSteps={steps.length - 1} steps={steps} />
      
      <div className="pb-12">
        {currentStep === 1 && (
          <FamilyMembersForm onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 2 && (
          <FinancialGoalsForm onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 3 && (
          <FamilySecurityForm onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 4 && (
          <MedicalProtectionForm onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 5 && (
          <ChildrenEducationForm onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 6 && (
          <FinancialFreedomForm onNext={handleNext} onBack={handleBack} />
        )}
        {currentStep === 7 && (
          <SummaryView onBack={handleBack} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default Index;
