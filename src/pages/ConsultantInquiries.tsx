import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Calendar, Mail, User, Clock } from "lucide-react";

interface Inquiry {
  id: string;
  form_data: {
    name: string;
    gender: string;
    birthDate: string;
    email: string;
    questions: Record<string, boolean>;
    goalsPriority: string[];
  };
  requested_time: string;
  status: string;
  created_at: string;
}

const ConsultantInquiries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if user has consultant or admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["consultant", "admin"]);

      if (!roleData || roleData.length === 0) {
        toast({
          title: "權限不足",
          description: "您沒有權限訪問此頁面",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      await fetchInquiries();
    };

    checkAuthAndFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const fetchInquiries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "載入失敗",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setInquiries((data || []) as Inquiry[]);
    }
    setIsLoading(false);
  };

  const handleAcceptInquiry = async (inquiryId: string) => {
    setAcceptingId(inquiryId);

    try {
      const { data, error } = await supabase.functions.invoke("accept-inquiry", {
        body: { inquiry_id: inquiryId },
      });

      if (error) throw error;

      if (data.needsAuth) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
        return;
      }

      if (data.conflict) {
        toast({
          title: "時段衝突",
          description: data.message,
          variant: "destructive",
        });
        setAcceptingId(null);
        return;
      }

      toast({
        title: "預約成功",
        description: "已成功接受此預約並建立會議",
      });

      // Refresh the inquiries list
      await fetchInquiries();
    } catch (error: any) {
      toast({
        title: "操作失敗",
        description: error.message || "無法接受此預約",
        variant: "destructive",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">新客戶諮詢</h1>
            <p className="text-muted-foreground mt-2">
              查看並接受待處理的客戶諮詢申請
            </p>
          </div>
          <Button onClick={() => navigate("/consultant/dashboard")} variant="outline">
            返回儀表板
          </Button>
        </div>

        {inquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">目前沒有待處理的諮詢申請</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="shadow-medium">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {inquiry.form_data.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4" />
                        {inquiry.form_data.email}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{inquiry.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">個人資訊</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">性別:</span> {inquiry.form_data.gender}</p>
                        <p><span className="font-medium">生日:</span> {inquiry.form_data.birthDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        預約時間
                      </p>
                      <div className="mt-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(inquiry.requested_time), "yyyy年MM月dd日 HH:mm", { locale: zhTW })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">財務目標優先順序</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {inquiry.form_data.goalsPriority.map((goal, index) => (
                        <Badge key={index} variant="outline">
                          {index + 1}. {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">問卷回答</p>
                    <div className="mt-2 space-y-1 text-sm">
                      {Object.entries(inquiry.form_data.questions).map(([key, value]) => (
                        <p key={key}>
                          <span className="font-medium">{key}:</span> {value ? "是" : "否"}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => handleAcceptInquiry(inquiry.id)}
                      disabled={acceptingId === inquiry.id}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {acceptingId === inquiry.id ? "處理中..." : "接受預約"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantInquiries;
