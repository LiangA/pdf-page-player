import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, ArrowRight, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ChildrenEducationFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const referenceData = [
  { country: "美國", bachelor: { public: 600, private: 750 }, master: { public: 360, private: 500 } },
  { country: "英國", bachelor: { public: 500, private: 750 }, master: { public: 390, private: 600 } },
  { country: "澳洲", bachelor: { public: 380, private: 600 }, master: { public: 300, private: 360 } },
  { country: "台灣", bachelor: { public: 140, private: 190 }, master: { public: 120, private: 150 } },
];

export const ChildrenEducationForm = ({ onNext, onBack }: ChildrenEducationFormProps) => {
  const { register, handleSubmit } = useForm();
  const [children] = useState([
    { id: "child1", label: "長子/女" },
    { id: "child2", label: "次子/女" },
  ]);

  const onSubmit = (data: any) => {
    onNext({ childrenEducation: data });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground mb-4">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">子女教育</h2>
        <p className="text-muted-foreground">針對小孩我們特有的期望與安排</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {children.map((child) => (
          <Card key={child.id} className="p-6 bg-gradient-to-br from-card via-secondary/5 to-card">
            <h3 className="text-xl font-semibold mb-4 text-primary">{child.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>大學學費(萬元)</Label>
                <Input
                  type="number"
                  placeholder="例如：600"
                  {...register(`${child.id}.bachelorFee`)}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>碩士學費(萬元)</Label>
                <Input
                  type="number"
                  placeholder="例如：360"
                  {...register(`${child.id}.masterFee`)}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>幾年後接受高等教育</Label>
                <Input
                  type="number"
                  placeholder="例如：10"
                  {...register(`${child.id}.yearsUntilCollege`)}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>通膨率(%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="例如：3"
                  {...register(`${child.id}.inflationRate`)}
                  className="bg-background/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label>已準備金額(萬元)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  {...register(`${child.id}.preparedAmount`)}
                  className="bg-background/50"
                />
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-6 bg-muted/30">
          <Accordion type="single" collapsible>
            <AccordionItem value="reference">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <span>子女高等教育基金參考表</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">國家</th>
                        <th className="text-center py-3 px-4">大學(4年)/公立</th>
                        <th className="text-center py-3 px-4">大學(4年)/私立</th>
                        <th className="text-center py-3 px-4">碩士(2年)/公立</th>
                        <th className="text-center py-3 px-4">碩士(2年)/私立</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referenceData.map((row) => (
                        <tr key={row.country} className="border-b">
                          <td className="py-3 px-4 font-medium">{row.country}</td>
                          <td className="text-center py-3 px-4">{row.bachelor.public}</td>
                          <td className="text-center py-3 px-4">{row.bachelor.private}</td>
                          <td className="text-center py-3 px-4">{row.master.public}</td>
                          <td className="text-center py-3 px-4">{row.master.private}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground mt-2">以上單位為萬元</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
