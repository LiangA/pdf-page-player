import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, GripVertical } from "lucide-react";

interface FinancialGoal {
  id: string;
  icon: string;
  title: string;
  description: string;
  priority: number;
}

interface FinancialGoalsFormProps {
  onNext: (data: FinancialGoal[]) => void;
  onBack: () => void;
}

export const FinancialGoalsForm = ({ onNext, onBack }: FinancialGoalsFormProps) => {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: "1",
      icon: "🏥",
      title: "醫療保障",
      description: "照顧自己失去賺錢能力的缺口",
      priority: 1,
    },
    {
      id: "2",
      icon: "🏠",
      title: "家庭保障",
      description: "你對家庭的承諾與責任",
      priority: 2,
    },
    {
      id: "3",
      icon: "🎓",
      title: "子女教育",
      description: "針對小孩我們特有的期望與安排",
      priority: 3,
    },
    {
      id: "4",
      icon: "💰",
      title: "財務自由",
      description: "當我們被動收入大於主動收入時，可選擇不工作還有可靠的收入，俗稱「退休規劃」",
      priority: 4,
    },
    {
      id: "5",
      icon: "💎",
      title: "資產傳承",
      description: "當我們有能力在生前贈與，或百年後留遺產給你關心的人",
      priority: 5,
    },
  ]);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const getPriorityNumber = (id: string) => {
    const index = selectedGoals.indexOf(id);
    return index === -1 ? null : index + 1;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground mb-4">
          <Target className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">財務目標排序</h2>
        <p className="text-muted-foreground">請選擇並排序您的財務目標（點擊卡片選擇，順序即為優先順序）</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const priorityNum = getPriorityNumber(goal.id);
          
          return (
            <Card
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg relative ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {isSelected && priorityNum && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                  {priorityNum}
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="text-4xl">{goal.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{goal.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedGoals.length > 0 && (
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3 text-foreground">您的優先順序：</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((id, index) => {
              const goal = goals.find(g => g.id === id);
              return goal ? (
                <div key={id} className="px-4 py-2 bg-card rounded-full border border-primary text-sm font-medium flex items-center gap-2">
                  <span>{index + 1}.</span>
                  <span>{goal.icon}</span>
                  <span>{goal.title}</span>
                </div>
              ) : null;
            })}
          </div>
        </Card>
      )}

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          上一步
        </Button>
        <Button
          onClick={() => onNext(goals)}
          disabled={selectedGoals.length === 0}
          className="flex-1 bg-gradient-to-r from-primary to-primary-dark"
        >
          下一步
        </Button>
      </div>
    </div>
  );
};
