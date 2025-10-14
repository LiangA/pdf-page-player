import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Download, FileText } from "lucide-react";

interface SummaryViewProps {
  onBack: () => void;
  onReset: () => void;
}

export const SummaryView = ({ onBack, onReset }: SummaryViewProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground mb-4 animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-4xl font-bold">分析完成！</h2>
        <p className="text-xl text-muted-foreground">您的財富需求分析已完成</p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-card rounded-lg">
            <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">分析報告已生成</h3>
              <p className="text-muted-foreground">
                我們已根據您提供的資訊完成財務分析，包含家庭保障缺口、醫療需求、教育規劃、退休計畫等詳細內容。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl mb-2">🏥</div>
              <div className="font-semibold mb-1">醫療保障</div>
              <div className="text-sm text-muted-foreground">完整的醫療保障分析</div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-semibold mb-1">家庭保障</div>
              <div className="text-sm text-muted-foreground">家庭財務安全規劃</div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl mb-2">🎓</div>
              <div className="font-semibold mb-1">子女教育</div>
              <div className="text-sm text-muted-foreground">教育基金準備建議</div>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold mb-1">財務自由</div>
              <div className="text-sm text-muted-foreground">退休規劃與建議</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              variant="outline" 
              className="flex-1 border-2"
              onClick={onReset}
            >
              重新開始
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-2" />
              下載報告
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">下一步建議</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>與專業財務顧問討論此分析報告</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>定期（每年）更新您的財務需求分析</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>根據分析結果調整您的保險與投資配置</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
