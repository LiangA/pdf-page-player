import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Coins, ArrowLeft, ArrowRight } from "lucide-react";

interface FinancialFreedomFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const lifestyleOptions = [
  {
    value: "basic",
    label: "基本生活",
    amount: "5萬/月",
    description: "衣食無缺、身體健康，有穩定住處就好",
  },
  {
    value: "comfortable",
    label: "舒適生活",
    amount: "12萬/月",
    description: "基本生活外，還能擁有嗜好，如音樂電影、與朋友時常相聚等等",
  },
  {
    value: "premium",
    label: "優質生活",
    amount: "20萬/月",
    description: "慈善捐贈、參與國際性社團、私人俱樂部活動、家庭國內外旅遊等等",
  },
];

export const FinancialFreedomForm = ({ onNext, onBack }: FinancialFreedomFormProps) => {
  const { register, handleSubmit, setValue } = useForm();
  const [selectedLifestyle, setSelectedLifestyle] = useState("comfortable");

  const onSubmit = (data: any) => {
    onNext({ financialFreedom: data });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground mb-4">
          <Coins className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">財務自由</h2>
        <p className="text-muted-foreground">
          當被動收入大於主動收入時，可選擇不工作還有可靠的收入
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-card via-primary/5 to-card">
          <h3 className="text-lg font-semibold mb-4">退休財務規劃</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>現在存款(萬元)</Label>
              <Input
                type="number"
                placeholder="例如：500"
                {...register("currentSavings")}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>每月領取金額(萬元)</Label>
              <Input
                type="number"
                placeholder="例如：10"
                {...register("monthlyWithdrawal")}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>預計退休年齡</Label>
              <Input
                type="number"
                placeholder="例如：60"
                {...register("retirementAge")}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>通膨率(%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="例如：3"
                {...register("inflationRate")}
                className="bg-background/50"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card via-secondary/5 to-card">
          <h3 className="text-lg font-semibold mb-4">期望的生活品質</h3>
          <RadioGroup
            value={selectedLifestyle}
            onValueChange={(value) => {
              setSelectedLifestyle(value);
              setValue("lifestyle", value);
            }}
            className="space-y-4"
          >
            {lifestyleOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedLifestyle === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background/50 hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedLifestyle(option.value);
                  setValue("lifestyle", option.value);
                }}
              >
                <RadioGroupItem value={option.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-base font-semibold cursor-pointer">
                      {option.label}
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {option.amount}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </Card>

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
