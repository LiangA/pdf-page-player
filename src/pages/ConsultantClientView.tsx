import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const ConsultantClientView = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [fnaData, setFnaData] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if consultant has access (through appointments)
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .select("*")
        .eq("consultant_id", session.user.id)
        .eq("client_id", clientId)
        .maybeSingle();

      if (appointmentError || !appointment) {
        toast({
          title: "無權限",
          description: "您沒有查看此客戶資料的權限",
          variant: "destructive",
        });
        navigate("/consultant/dashboard");
        return;
      }

      setHasAccess(true);

      // Load client profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientId)
        .single();

      if (profileError) {
        console.error("Error loading client profile:", profileError);
      } else {
        setClientProfile(profile);
      }

      // Load FNA data
      const { data: fna, error: fnaError } = await supabase
        .from("financial_needs_analysis")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (fnaError) {
        console.error("Error loading FNA data:", fnaError);
      } else {
        setFnaData(fna?.fna_data);
      }

      setIsLoading(false);
    };

    checkAccessAndLoadData();
  }, [clientId, navigate, toast]);

  const renderSectionData = (title: string, data: any) => {
    if (!data) return <p className="text-muted-foreground">尚未填寫</p>;
    
    return (
      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">客戶檔案</h1>
            <p className="text-muted-foreground mt-2">
              {clientProfile?.full_name || "客戶"}
            </p>
          </div>
          <Button onClick={() => navigate("/consultant/dashboard")} variant="outline">
            返回
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本資料</CardTitle>
            <CardDescription>客戶個人資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-semibold">姓名:</span> {clientProfile?.full_name || "未設定"}</p>
            <p><span className="font-semibold">電子郵件:</span> {clientProfile?.email}</p>
            <p><span className="font-semibold">角色:</span> {clientProfile?.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>財務需求分析</CardTitle>
            <CardDescription>客戶已填寫的 FNA 資料（唯讀）</CardDescription>
          </CardHeader>
          <CardContent>
            {!fnaData ? (
              <p className="text-muted-foreground">客戶尚未填寫 FNA 表單</p>
            ) : (
              <Tabs defaultValue="familyMembers" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="familyMembers">家庭成員</TabsTrigger>
                  <TabsTrigger value="financialGoals">財務目標</TabsTrigger>
                  <TabsTrigger value="medicalProtection">醫療保障</TabsTrigger>
                  <TabsTrigger value="childrenEducation">子女教育</TabsTrigger>
                  <TabsTrigger value="familySecurity">家庭安全</TabsTrigger>
                  <TabsTrigger value="financialFreedom">財務自由</TabsTrigger>
                </TabsList>
                
                <Separator className="my-4" />
                
                <TabsContent value="familyMembers">
                  {renderSectionData("家庭成員", fnaData?.familyMembers)}
                </TabsContent>
                
                <TabsContent value="financialGoals">
                  {renderSectionData("財務目標", fnaData?.financialGoals)}
                </TabsContent>
                
                <TabsContent value="medicalProtection">
                  {renderSectionData("醫療保障", fnaData?.medicalProtection)}
                </TabsContent>
                
                <TabsContent value="childrenEducation">
                  {renderSectionData("子女教育", fnaData?.childrenEducation)}
                </TabsContent>
                
                <TabsContent value="familySecurity">
                  {renderSectionData("家庭安全", fnaData?.familySecurity)}
                </TabsContent>
                
                <TabsContent value="financialFreedom">
                  {renderSectionData("財務自由", fnaData?.financialFreedom)}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultantClientView;
