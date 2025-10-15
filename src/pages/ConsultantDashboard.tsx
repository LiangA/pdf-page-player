import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const ConsultantDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      
      // Fetch profile data and verify role
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        navigate("/dashboard");
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

      setProfile(profileData);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "登出失敗",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "已登出",
        description: "您已成功登出",
      });
      navigate("/login");
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
            <h1 className="text-4xl font-bold text-foreground">顧問儀表板</h1>
            <p className="text-muted-foreground mt-2">
              歡迎回來，{profile?.full_name || user?.email}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            登出
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>個人資料</CardTitle>
              <CardDescription>查看和編輯您的個人資料</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">姓名:</span> {profile?.full_name || "未設定"}</p>
                <p><span className="font-semibold">電子郵件:</span> {profile?.email}</p>
                <p><span className="font-semibold">角色:</span> {profile?.role}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>待處理諮詢</CardTitle>
              <CardDescription>查看客戶的諮詢請求</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">目前沒有待處理的諮詢</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>我的預約</CardTitle>
              <CardDescription>管理您的預約行程</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">目前沒有預約</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>客戶管理</CardTitle>
              <CardDescription>查看和管理您的客戶</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">暫無客戶資料</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
