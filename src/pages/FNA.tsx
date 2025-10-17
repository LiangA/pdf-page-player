import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { ProgressBar } from "@/components/ProgressBar";
import { FamilyMembersForm } from "@/components/FamilyMembersForm";
import { FinancialGoalsForm } from "@/components/FinancialGoalsForm";
import { MedicalProtectionForm } from "@/components/MedicalProtectionForm";
import { ChildrenEducationForm } from "@/components/ChildrenEducationForm";
import { FamilySecurityForm } from "@/components/FamilySecurityForm";
import { FinancialFreedomForm } from "@/components/FinancialFreedomForm";
import { Button } from "@/components/ui/button";

const FNA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [fnaData, setFnaData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedFnaData = useDebounce(fnaData, 1000);

  const steps = [
    "家庭成員",
    "財務目標",
    "醫療保障",
    "子女教育",
    "家庭安全",
    "財務自由"
  ];

  // Check authentication and load existing data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUserId(session.user.id);

      // Load existing FNA data
      const { data: fnaRecord, error } = await supabase
        .from("financial_needs_analysis")
        .select("fna_data")
        .eq("client_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading FNA data:", error);
      } else if (fnaRecord?.fna_data) {
        setFnaData(fnaRecord.fna_data);
      }

      setIsLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (!userId || isLoading || Object.keys(debouncedFnaData).length === 0) return;

    const autoSave = async () => {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("financial_needs_analysis")
          .upsert({
            client_id: userId,
            fna_data: debouncedFnaData,
            last_updated: new Date().toISOString()
          }, {
            onConflict: "client_id"
          });

        if (error) throw error;

        console.log("Auto-saved successfully");
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast({
          title: "自動儲存失敗",
          description: "請檢查網路連線",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    autoSave();
  }, [debouncedFnaData, userId, isLoading, toast]);

  const handleNext = useCallback((stepData: any) => {
    const stepKey = [
      "familyMembers",
      "financialGoals", 
      "medicalProtection",
      "childrenEducation",
      "familySecurity",
      "financialFreedom"
    ][currentStep];

    setFnaData((prev: any) => ({
      ...prev,
      [stepKey]: stepData
    }));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "表單已完成",
        description: "您的財務需求分析表單已儲存",
      });
      navigate("/dashboard");
    }
  }, [currentStep, steps.length, toast, navigate]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleExit = async () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <FamilyMembersForm
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <FinancialGoalsForm
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <MedicalProtectionForm
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ChildrenEducationForm
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <FamilySecurityForm
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <FinancialFreedomForm
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <ProgressBar
        currentStep={currentStep}
        totalSteps={steps.length}
        steps={steps}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">財務需求分析</h1>
            <div className="flex items-center gap-4">
              {isSaving && (
                <span className="text-sm text-muted-foreground">儲存中...</span>
              )}
              <Button onClick={handleExit} variant="outline">
                離開
              </Button>
            </div>
          </div>

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default FNA;
