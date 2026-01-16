import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Users,
  Calendar,
  Clock,
  DollarSign,
  Award,
  BookOpen,
  TrendingUp,
  Star,
  Plus,
  Edit,
  Eye,
  Brain,
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Sparkles,
  GraduationCap,
  Medal,
  Briefcase,
  FileText
} from "lucide-react";

// 員工列表
const employees = [
  {
    id: 1,
    name: "王醫師",
    role: "主治醫師",
    department: "醫美科",
    skills: ["玻尿酸", "肉毒桿菌", "皮秒雷射", "音波拉提"],
    performance: 95,
    salary: 150000,
    bonus: 25000,
    trainingHours: 24,
    avatar: ""
  },
  {
    id: 2,
    name: "李護理師",
    role: "資深護理師",
    department: "護理部",
    skills: ["術前諮詢", "術後護理", "客戶關係"],
    performance: 88,
    salary: 55000,
    bonus: 8000,
    trainingHours: 16,
    avatar: ""
  },
  {
    id: 3,
    name: "張美容師",
    role: "美容師",
    department: "美容部",
    skills: ["保濕導入", "清潔護理", "按摩"],
    performance: 82,
    salary: 42000,
    bonus: 5000,
    trainingHours: 12,
    avatar: ""
  }
];

// AI 排班建議
const aiScheduleSuggestions = [
  {
    id: 1,
    type: "optimization",
    title: "週六下午人力不足",
    description: "根據歷史預約數據，週六下午 14:00-18:00 預約量較高，建議增加 1 名護理師",
    impact: "high",
    action: "調整排班"
  },
  {
    id: 2,
    type: "warning",
    title: "王醫師連續工作天數過長",
    description: "王醫師已連續工作 6 天，建議安排休假以維持工作品質",
    impact: "medium",
    action: "安排休假"
  },
  {
    id: 3,
    type: "suggestion",
    title: "技能分配優化",
    description: "週三玻尿酸預約較多，建議安排具備相關技能的醫師值班",
    impact: "low",
    action: "查看詳情"
  }
];

// 培訓課程
const trainingCourses = [
  {
    id: 1,
    name: "新型玻尿酸注射技術",
    type: "專業技能",
    duration: "4 小時",
    instructor: "外聘講師",
    date: "2024-01-25",
    participants: 5,
    status: "upcoming"
  },
  {
    id: 2,
    name: "客戶服務溝通技巧",
    type: "軟技能",
    duration: "2 小時",
    instructor: "內部培訓",
    date: "2024-01-20",
    participants: 8,
    status: "completed"
  },
  {
    id: 3,
    name: "醫療法規更新說明",
    type: "法規合規",
    duration: "1 小時",
    instructor: "法務顧問",
    date: "2024-02-01",
    participants: 12,
    status: "upcoming"
  }
];

export default function HRManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">人力資源管理</h1>
            <p className="text-gray-500 mt-1">智能排班、技能管理、薪資計算與績效考核</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              AI 排班建議
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增員工
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總員工數</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本月薪資</p>
                  <p className="text-2xl font-bold">NT$680K</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均績效</p>
                  <p className="text-2xl font-bold">88%</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">培訓時數</p>
                  <p className="text-2xl font-bold">156 hr</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">出勤率</p>
                  <p className="text-2xl font-bold">97%</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <Users className="w-4 h-4 mr-2" />
              員工總覽
            </TabsTrigger>
            <TabsTrigger value="ai-schedule">
              <Brain className="w-4 h-4 mr-2" />
              AI 排班
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Award className="w-4 h-4 mr-2" />
              技能矩陣
            </TabsTrigger>
            <TabsTrigger value="salary">
              <DollarSign className="w-4 h-4 mr-2" />
              薪資獎金
            </TabsTrigger>
            <TabsTrigger value="training">
              <BookOpen className="w-4 h-4 mr-2" />
              培訓管理
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Target className="w-4 h-4 mr-2" />
              績效考核
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>員工列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((emp) => (
                    <div key={emp.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={emp.avatar} />
                          <AvatarFallback className="text-lg">{emp.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{emp.name}</h4>
                            <Badge variant="secondary">{emp.role}</Badge>
                            <Badge variant="outline">{emp.department}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {emp.skills.map((skill, idx) => (
                              <Badge key={idx} className="bg-blue-50 text-blue-700 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-500">績效</p>
                            <p className="font-semibold text-green-600">{emp.performance}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">培訓</p>
                            <p className="font-semibold">{emp.trainingHours}hr</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">獎金</p>
                            <p className="font-semibold text-purple-600">NT${(emp.bonus / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          詳情
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Schedule Tab */}
          <TabsContent value="ai-schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <CardTitle>AI 智能排班建議</CardTitle>
                </div>
                <CardDescription>根據歷史數據與預約情況自動優化排班</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiScheduleSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className={`p-4 border rounded-lg ${
                      suggestion.impact === 'high' ? 'border-red-200 bg-red-50' :
                      suggestion.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            suggestion.type === 'optimization' ? 'bg-blue-100' :
                            suggestion.type === 'warning' ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}>
                            {suggestion.type === 'optimization' && <Sparkles className="w-5 h-5 text-blue-600" />}
                            {suggestion.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                            {suggestion.type === 'suggestion' && <Target className="w-5 h-5 text-green-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          </div>
                        </div>
                        <Button size="sm">
                          {suggestion.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Schedule Preview */}
                <div className="mt-6 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-4">本週排班預覽</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => (
                      <div key={day} className="text-center">
                        <p className="text-sm font-medium mb-2">週{day}</p>
                        <div className={`p-2 rounded-lg text-xs ${idx === 5 ? 'bg-red-100' : 'bg-gray-50'}`}>
                          <p>王醫師</p>
                          <p>李護理師</p>
                          {idx !== 6 && <p>張美容師</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>技能矩陣</CardTitle>
                <CardDescription>員工技能分布與能力評估</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">員工</th>
                        <th className="text-center p-3">玻尿酸</th>
                        <th className="text-center p-3">肉毒桿菌</th>
                        <th className="text-center p-3">皮秒雷射</th>
                        <th className="text-center p-3">音波拉提</th>
                        <th className="text-center p-3">術前諮詢</th>
                        <th className="text-center p-3">術後護理</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{emp.name}</span>
                            </div>
                          </td>
                          {['玻尿酸', '肉毒桿菌', '皮秒雷射', '音波拉提', '術前諮詢', '術後護理'].map((skill) => (
                            <td key={skill} className="text-center p-3">
                              {emp.skills.includes(skill) ? (
                                <div className="flex justify-center">
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full" />
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>薪資與獎金管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((emp) => (
                    <div key={emp.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{emp.name}</h4>
                            <p className="text-sm text-gray-500">{emp.role}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-xs text-gray-500">底薪</p>
                            <p className="font-semibold">NT${emp.salary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">績效獎金</p>
                            <p className="font-semibold text-green-600">NT${emp.bonus.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">加班費</p>
                            <p className="font-semibold">NT$3,000</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">總計</p>
                            <p className="font-bold text-purple-600">NT${(emp.salary + emp.bonus + 3000).toLocaleString()}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          薪資單
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>培訓課程管理</CardTitle>
                    <CardDescription>員工專業技能與軟技能培訓</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新增課程
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingCourses.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            course.type === '專業技能' ? 'bg-blue-100' :
                            course.type === '軟技能' ? 'bg-green-100' :
                            'bg-yellow-100'
                          }`}>
                            <GraduationCap className={`w-6 h-6 ${
                              course.type === '專業技能' ? 'text-blue-600' :
                              course.type === '軟技能' ? 'text-green-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{course.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Badge variant="secondary">{course.type}</Badge>
                              <span>{course.duration}</span>
                              <span>•</span>
                              <span>{course.instructor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">日期</p>
                            <p className="font-medium">{course.date}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">參與人數</p>
                            <p className="font-medium">{course.participants} 人</p>
                          </div>
                          <Badge className={course.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {course.status === 'completed' ? '已完成' : '即將開始'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>績效考核</CardTitle>
                <CardDescription>員工績效評估與目標追蹤</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {employees.map((emp) => (
                    <div key={emp.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{emp.name}</h4>
                          <p className="text-sm text-gray-500">{emp.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{emp.performance}%</p>
                          <p className="text-xs text-gray-500">綜合績效</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { name: "服務品質", score: 92 },
                          { name: "工作效率", score: 88 },
                          { name: "團隊合作", score: 85 },
                          { name: "專業成長", score: 90 }
                        ].map((metric) => (
                          <div key={metric.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">{metric.name}</span>
                              <span className="font-medium">{metric.score}%</span>
                            </div>
                            <Progress value={metric.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
