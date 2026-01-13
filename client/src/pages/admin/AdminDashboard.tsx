import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Camera, FileText, GraduationCap, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: photos } = trpc.photos.list.useQuery({});
  const { data: essays } = trpc.essays.listAll.useQuery({});
  const { data: papers } = trpc.papers.listAll.useQuery({});

  const stats = [
    {
      title: "摄影作品",
      value: photos?.length || 0,
      icon: Camera,
      description: "已上传的照片",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "杂志随笔",
      value: essays?.length || 0,
      icon: FileText,
      description: `${essays?.filter(e => e.published).length || 0} 篇已发布`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "学术论文",
      value: papers?.length || 0,
      icon: GraduationCap,
      description: `${papers?.filter(p => p.published).length || 0} 篇已发布`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          欢迎回来！这是您博客的概览。
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">快速操作</CardTitle>
          <CardDescription>常用功能快捷入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/photos"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-blue-50">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">上传照片</p>
                <p className="text-sm text-slate-500">添加新的摄影作品</p>
              </div>
            </a>
            <a
              href="/admin/essays"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">写随笔</p>
                <p className="text-sm text-slate-500">创建新的杂志文章</p>
              </div>
            </a>
            <a
              href="/admin/papers"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-purple-50">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">添加论文</p>
                <p className="text-sm text-slate-500">录入学术论文信息</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Photos */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">最近上传的照片</CardTitle>
          </CardHeader>
          <CardContent>
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-100"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">暂无照片</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Essays */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">最近的文章</CardTitle>
          </CardHeader>
          <CardContent>
            {essays && essays.length > 0 ? (
              <div className="space-y-3">
                {essays.slice(0, 4).map((essay) => (
                  <div
                    key={essay.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {essay.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {essay.published ? "已发布" : "草稿"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        essay.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {essay.published ? "已发布" : "草稿"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">暂无文章</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
