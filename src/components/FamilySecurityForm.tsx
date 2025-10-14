import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield, Calculator } from "lucide-react";

interface SecurityData {
  livingExpense: { amount: number; years: number };
  housingExpense: { amount: number; years: number };
  childExpense: { amount: number; years: number };
  parentExpense: { amount: number; years: number };
  otherExpense: { amount: number; years: number };
  finalExpense: { amount: number; years: number };
  activeIncome: number;
  passiveIncome: number;
  liquidAssets: number;
  laborInsurance: number;
  groupInsurance: number;
  commercialInsurance: number;
}

interface FamilySecurityFormProps {
  onNext: (data: SecurityData) => void;
  onBack: () => void;
}

export const FamilySecurityForm = ({ onNext, onBack }: FamilySecurityFormProps) => {
  const [data, setData] = useState<SecurityData>({
    livingExpense: { amount: 0, years: 0 },
    housingExpense: { amount: 0, years: 0 },
    childExpense: { amount: 0, years: 0 },
    parentExpense: { amount: 0, years: 0 },
    otherExpense: { amount: 0, years: 0 },
    finalExpense: { amount: 0, years: 0 },
    activeIncome: 0,
    passiveIncome: 0,
    liquidAssets: 0,
    laborInsurance: 0,
    groupInsurance: 0,
    commercialInsurance: 0,
  });

  const calculateTotal = () => {
    const expenses = [
      data.livingExpense.amount * data.livingExpense.years * 12,
      data.housingExpense.amount * data.housingExpense.years * 12,
      data.childExpense.amount * data.childExpense.years * 12,
      data.parentExpense.amount * data.parentExpense.years * 12,
      data.otherExpense.amount * data.otherExpense.years * 12,
      data.finalExpense.amount,
    ];
    return expenses.reduce((a, b) => a + b, 0);
  };

  const calculateCoverage = () => {
    return data.laborInsurance + data.groupInsurance + data.commercialInsurance;
  };

  const calculateGap = () => {
    return calculateTotal() - calculateCoverage() - data.liquidAssets;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">家庭保障</h2>
        <p className="text-muted-foreground">計算您的家庭保障需求與缺口</p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            需求項目（每月金額 × 年數）
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: "livingExpense" as const, label: "生活費用需求" },
              { key: "housingExpense" as const, label: "住房費用需求" },
              { key: "childExpense" as const, label: "子女費用需求" },
              { key: "parentExpense" as const, label: "父母孝養需求" },
              { key: "otherExpense" as const, label: "其他費用需求" },
            ].map((item) => {
              const currentData = data[item.key];
              return (
                <div key={item.key} className="space-y-3 p-4 rounded-lg bg-muted/30">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="每月金額"
                        value={currentData.amount || ""}
                        onChange={(e) =>
                          setData({
                            ...data,
                            [item.key]: {
                              ...currentData,
                              amount: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="年數"
                        value={currentData.years || ""}
                        onChange={(e) =>
                          setData({
                            ...data,
                            [item.key]: {
                              ...currentData,
                              years: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="space-y-3 p-4 rounded-lg bg-muted/30">
              <Label className="text-sm font-medium">最後費用需求（總額）</Label>
              <Input
                type="number"
                placeholder="總金額"
                value={data.finalExpense.amount || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    finalExpense: { ...data.finalExpense, amount: Number(e.target.value) },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">已備資源</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>主動收入（元／年）</Label>
              <Input
                type="number"
                value={data.activeIncome || ""}
                onChange={(e) => setData({ ...data, activeIncome: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>被動收入（元／年）</Label>
              <Input
                type="number"
                value={data.passiveIncome || ""}
                onChange={(e) => setData({ ...data, passiveIncome: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>可變現資產</Label>
              <Input
                type="number"
                value={data.liquidAssets || ""}
                onChange={(e) => setData({ ...data, liquidAssets: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">現有保障</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>勞保保額</Label>
              <Input
                type="number"
                value={data.laborInsurance || ""}
                onChange={(e) => setData({ ...data, laborInsurance: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>團險保額</Label>
              <Input
                type="number"
                value={data.groupInsurance || ""}
                onChange={(e) => setData({ ...data, groupInsurance: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>商業保險保額</Label>
              <Input
                type="number"
                value={data.commercialInsurance || ""}
                onChange={(e) => setData({ ...data, commercialInsurance: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <h3 className="font-semibold text-lg mb-4">保障分析結果</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">總需求</div>
            <div className="text-2xl font-bold text-foreground">
              {calculateTotal().toLocaleString()}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">已備保障</div>
            <div className="text-2xl font-bold text-secondary">
              {calculateCoverage().toLocaleString()}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">保障缺口</div>
            <div className={`text-2xl font-bold ${calculateGap() > 0 ? 'text-destructive' : 'text-secondary'}`}>
              {calculateGap().toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          上一步
        </Button>
        <Button onClick={() => onNext(data)} className="flex-1 bg-gradient-to-r from-primary to-primary-dark">
          下一步
        </Button>
      </div>
    </div>
  );
};
