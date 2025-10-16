import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

interface WealthAnalysisHeroProps {
  onStart: () => void;
}

export const WealthAnalysisHero = ({ onStart }: WealthAnalysisHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background px-4">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/login")}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          登入
        </Button>
      </div>
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            財富需求分析
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            人生就像一段追夢的旅程，每個階段都有自己的目標和期待
          </p>
        </div>

        <div className="prose prose-lg mx-auto text-muted-foreground">
          <p>
            從建立家庭、事業有成、購置房產、子女教育、享受退休生活到財富傳承。
            我們深知這些夢想的重要性，通過詳細的財務分析和專業建議，
            用心制定每一步的財務規劃，幫助您和您的家人實現這些珍貴的夢想，
            讓愛與希望在每個人生階段綻放。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button 
            size="lg" 
            onClick={onStart}
            className="group px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            開始分析
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            asChild
            className="px-8 py-6 text-lg"
          >
            <Link to="/apply">新客戶申請</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-12 max-w-3xl mx-auto">
          {[
            { icon: "🏥", label: "醫療保障" },
            { icon: "🏠", label: "家庭保障" },
            { icon: "🎓", label: "子女教育" },
            { icon: "💰", label: "財務自由" },
            { icon: "💎", label: "資產傳承" }
          ].map((item, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary transition-all hover:shadow-md"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
