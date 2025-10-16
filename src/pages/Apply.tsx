import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

const applySchema = z.object({
  name: z.string().trim().min(1, { message: "請輸入姓名" }).max(100),
  gender: z.enum(["male", "female", "other"], { message: "請選擇性別" }),
  birthDate: z.date({ message: "請選擇生日" }),
  email: z.string().trim().email({ message: "請輸入有效的電子郵件地址" }).max(255),
  hasChildren: z.boolean(),
  hasInsurance: z.boolean(),
  hasMortgage: z.boolean(),
  hasInvestment: z.boolean(),
  goal1: z.string().min(1),
  goal2: z.string().min(1),
  goal3: z.string().min(1),
  goal4: z.string().min(1),
  goal5: z.string().min(1),
  appointmentDate: z.date({ message: "請選擇預約日期" }),
  appointmentTime: z.string().min(1, { message: "請選擇預約時間" }),
});

const financialGoals = [
  { id: "retirement", label: "退休規劃" },
  { id: "children_education", label: "子女教育" },
  { id: "property", label: "置產購屋" },
  { id: "wealth_growth", label: "財富增值" },
  { id: "risk_protection", label: "風險保障" },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [email, setEmail] = useState("");
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [hasMortgage, setHasMortgage] = useState<boolean | null>(null);
  const [hasInvestment, setHasInvestment] = useState<boolean | null>(null);
  const [goal1, setGoal1] = useState("");
  const [goal2, setGoal2] = useState("");
  const [goal3, setGoal3] = useState("");
  const [goal4, setGoal4] = useState("");
  const [goal5, setGoal5] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [appointmentTime, setAppointmentTime] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      gender !== "" &&
      birthDate !== undefined &&
      email.trim() !== "" &&
      hasChildren !== null &&
      hasInsurance !== null &&
      hasMortgage !== null &&
      hasInvestment !== null &&
      goal1 !== "" &&
      goal2 !== "" &&
      goal3 !== "" &&
      goal4 !== "" &&
      goal5 !== "" &&
      appointmentDate !== undefined &&
      appointmentTime !== ""
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "表單未完成",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      });
      return;
    }

    try {
      applySchema.parse({
        name,
        gender,
        birthDate,
        email,
        hasChildren: hasChildren ?? false,
        hasInsurance: hasInsurance ?? false,
        hasMortgage: hasMortgage ?? false,
        hasInvestment: hasInvestment ?? false,
        goal1,
        goal2,
        goal3,
        goal4,
        goal5,
        appointmentDate,
        appointmentTime,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "驗證錯誤",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Combine date and time for requested_time
      const [hours, minutes] = appointmentTime.split(":");
      const requestedDateTime = new Date(appointmentDate!);
      requestedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase.functions.invoke("submit-inquiry", {
        body: {
          form_data: {
            name,
            gender,
            birth_date: birthDate!.toISOString(),
            email,
            has_children: hasChildren,
            has_insurance: hasInsurance,
            has_mortgage: hasMortgage,
            has_investment: hasInvestment,
            financial_goals: [goal1, goal2, goal3, goal4, goal5],
          },
          requested_time: requestedDateTime.toISOString(),
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "申請已送出",
        description: "我們已收到您的諮詢申請，請檢查您的電子郵件",
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "送出失敗",
        description: "無法送出申請，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-large">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">申請已送出</CardTitle>
            <CardDescription className="text-center">
              感謝您的申請！我們已將確認信發送至您的電子郵件。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              我們的顧問將盡快與您聯繫，安排諮詢時間。
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full"
            >
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableGoals = financialGoals.filter(
    (goal) => ![goal1, goal2, goal3, goal4, goal5].includes(goal.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-large">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">財務諮詢申請表</CardTitle>
            <CardDescription>
              請填寫以下資訊，我們將為您安排專業的財務顧問
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">基本資料</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="請輸入您的姓名"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>性別 *</Label>
                  <RadioGroup value={gender} onValueChange={setGender} disabled={isLoading}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">男性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">女性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">其他</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>生日 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "PPP") : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">電子郵件 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Yes/No Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">財務狀況</h3>
                
                <div className="space-y-2">
                  <Label>您有子女嗎？ *</Label>
                  <RadioGroup
                    value={hasChildren === null ? "" : hasChildren ? "yes" : "no"}
                    onValueChange={(val) => setHasChildren(val === "yes")}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="children-yes" />
                      <Label htmlFor="children-yes" className="font-normal">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="children-no" />
                      <Label htmlFor="children-no" className="font-normal">否</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>您有保險嗎？ *</Label>
                  <RadioGroup
                    value={hasInsurance === null ? "" : hasInsurance ? "yes" : "no"}
                    onValueChange={(val) => setHasInsurance(val === "yes")}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="insurance-yes" />
                      <Label htmlFor="insurance-yes" className="font-normal">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="insurance-no" />
                      <Label htmlFor="insurance-no" className="font-normal">否</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>您有房貸嗎？ *</Label>
                  <RadioGroup
                    value={hasMortgage === null ? "" : hasMortgage ? "yes" : "no"}
                    onValueChange={(val) => setHasMortgage(val === "yes")}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="mortgage-yes" />
                      <Label htmlFor="mortgage-yes" className="font-normal">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="mortgage-no" />
                      <Label htmlFor="mortgage-no" className="font-normal">否</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>您有投資經驗嗎？ *</Label>
                  <RadioGroup
                    value={hasInvestment === null ? "" : hasInvestment ? "yes" : "no"}
                    onValueChange={(val) => setHasInvestment(val === "yes")}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="investment-yes" />
                      <Label htmlFor="investment-yes" className="font-normal">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="investment-no" />
                      <Label htmlFor="investment-no" className="font-normal">否</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Financial Goals Ranking */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">財務目標排序</h3>
                <p className="text-sm text-muted-foreground">請依優先順序選擇您的五大財務目標</p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>第一優先 *</Label>
                    <Select value={goal1} onValueChange={setGoal1} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇目標" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialGoals
                          .filter((g) => ![goal2, goal3, goal4, goal5].includes(g.id))
                          .map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>第二優先 *</Label>
                    <Select value={goal2} onValueChange={setGoal2} disabled={isLoading || !goal1}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇目標" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialGoals
                          .filter((g) => ![goal1, goal3, goal4, goal5].includes(g.id))
                          .map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>第三優先 *</Label>
                    <Select value={goal3} onValueChange={setGoal3} disabled={isLoading || !goal2}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇目標" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialGoals
                          .filter((g) => ![goal1, goal2, goal4, goal5].includes(g.id))
                          .map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>第四優先 *</Label>
                    <Select value={goal4} onValueChange={setGoal4} disabled={isLoading || !goal3}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇目標" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialGoals
                          .filter((g) => ![goal1, goal2, goal3, goal5].includes(g.id))
                          .map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>第五優先 *</Label>
                    <Select value={goal5} onValueChange={setGoal5} disabled={isLoading || !goal4}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇目標" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialGoals
                          .filter((g) => ![goal1, goal2, goal3, goal4].includes(g.id))
                          .map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Appointment Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">預約時間</h3>
                
                <div className="space-y-2">
                  <Label>預約日期 *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !appointmentDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {appointmentDate ? format(appointmentDate, "PPP") : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={appointmentDate}
                        onSelect={setAppointmentDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>預約時段 *</Label>
                  <Select value={appointmentTime} onValueChange={setAppointmentTime} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇時段" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? "送出中..." : "送出申請"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Apply;
