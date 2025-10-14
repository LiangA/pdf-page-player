import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users } from "lucide-react";

interface FamilyMember {
  id: string;
  relation: string;
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  occupation: string;
}

interface FamilyMembersFormProps {
  onNext: (data: FamilyMember[]) => void;
  onBack: () => void;
}

export const FamilyMembersForm = ({ onNext, onBack }: FamilyMembersFormProps) => {
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", relation: "本人", name: "", gender: "", birthDate: "", age: 0, occupation: "" },
    { id: "2", relation: "配偶", name: "", gender: "", birthDate: "", age: 0, occupation: "" },
  ]);

  const addMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      relation: "子女",
      name: "",
      gender: "",
      birthDate: "",
      age: 0,
      occupation: "",
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: string, field: keyof FamilyMember, value: string | number) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleBirthDateChange = (id: string, value: string) => {
    updateMember(id, "birthDate", value);
    if (value) {
      const age = calculateAge(value);
      updateMember(id, "age", age);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-primary-foreground mb-4">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold">家庭成員</h2>
        <p className="text-muted-foreground">請填寫您的家庭成員資訊</p>
      </div>

      <div className="space-y-4">
        {members.map((member, index) => (
          <Card key={member.id} className="p-6 hover:shadow-lg transition-shadow border-border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-foreground">{member.relation}</h3>
              {members.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(member.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${member.id}`}>姓名</Label>
                <Input
                  id={`name-${member.id}`}
                  value={member.name}
                  onChange={(e) => updateMember(member.id, "name", e.target.value)}
                  placeholder="請輸入姓名"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`gender-${member.id}`}>性別</Label>
                <Select value={member.gender} onValueChange={(v) => updateMember(member.id, "gender", v)}>
                  <SelectTrigger id={`gender-${member.id}`}>
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`birthDate-${member.id}`}>出生日期</Label>
                <Input
                  id={`birthDate-${member.id}`}
                  type="date"
                  value={member.birthDate}
                  onChange={(e) => handleBirthDateChange(member.id, e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`age-${member.id}`}>年齡</Label>
                <Input
                  id={`age-${member.id}`}
                  type="number"
                  value={member.age || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`occupation-${member.id}`}>事業／職稱</Label>
                <Input
                  id={`occupation-${member.id}`}
                  value={member.occupation}
                  onChange={(e) => updateMember(member.id, "occupation", e.target.value)}
                  placeholder="請輸入職業"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addMember}
        className="w-full border-dashed border-2 hover:bg-secondary/10 hover:border-secondary"
      >
        <Plus className="h-4 w-4 mr-2" />
        新增家庭成員
      </Button>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          上一步
        </Button>
        <Button onClick={() => onNext(members)} className="flex-1 bg-gradient-to-r from-primary to-primary-dark">
          下一步
        </Button>
      </div>
    </div>
  );
};
