import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeartPulse, ArrowLeft, ArrowRight } from "lucide-react";

interface MedicalProtectionFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

interface MemberProtection {
  hospitalization: { need: string; have: string };
  medicalLimit: { need: string; have: string };
  disability: { need: string; have: string };
  criticalIllness: { need: string; have: string };
  cancerBenefit: { need: string; have: string };
}

const protectionItems = [
  { key: "hospitalization", label: "住院日額(日)", unit: "元/日" },
  { key: "medicalLimit", label: "醫療限額(次)", unit: "萬元" },
  { key: "disability", label: "失能意外", unit: "萬元" },
  { key: "criticalIllness", label: "重大傷病", unit: "萬元" },
  { key: "cancerBenefit", label: "癌症一次金", unit: "萬元" },
];

export const MedicalProtectionForm = ({ onNext, onBack }: MedicalProtectionFormProps) => {
  const { register, handleSubmit } = useForm();
  const [members] = useState([
    { id: "self", label: "本人" },
    { id: "spouse", label: "配偶" },
    { id: "child1", label: "長子/女" },
    { id: "child2", label: "次子/女" },
  ]);

  const onSubmit = (data: any) => {
    onNext({ medicalProtection: data });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground mb-4">
          <HeartPulse className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">醫療保障</h2>
        <p className="text-muted-foreground">照顧自己失去賺錢能力的缺口</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {members.map((member) => (
          <Card key={member.id} className="p-6 bg-gradient-to-br from-card via-primary/5 to-card">
            <h3 className="text-xl font-semibold mb-4 text-primary">{member.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {protectionItems.map((item) => (
                <div key={item.key} className="space-y-3">
                  <Label className="text-sm font-semibold">{item.label}</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">需求</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register(`${member.id}.${item.key}.need`)}
                        className="bg-background/50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">已備</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        {...register(`${member.id}.${item.key}.have`)}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 border-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            上一步
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-primary-dark"
          >
            下一步
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};
