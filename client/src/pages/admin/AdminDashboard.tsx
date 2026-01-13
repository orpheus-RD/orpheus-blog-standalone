import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Camera, FileText, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: photos } = trpc.photos.list.useQuery({});
  const { data: essays } = trpc.essays.listAll.useQuery({});
  const { data: papers } = trpc.papers.listAll.useQuery({});

  const stats = [
    {
      title: "Photography",
      value: photos?.length || 0,
      icon: Camera,
      description: "已上传的照片",
    },
    {
      title: "Magazine",
      value: essays?.length || 0,
      icon: FileText,
      description: `${essays?.filter(e => e.published).length || 0} 篇已发布`,
    },
    {
      title: "Academic",
      value: papers?.length || 0,
      icon: GraduationCap,
      description: `${papers?.filter(p => p.published).length || 0} 篇已发布`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white">
          Dashboard
        </h1>
        <p className="text-neutral-400 mt-1">
          Welcome back! Here's an overview of your blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-neutral-900 border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-neutral-800">
                <stat.icon className="h-4 w-4 text-neutral-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-neutral-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
          <CardDescription className="text-neutral-500">常用功能快捷入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/photos"
              className="flex items-center gap-4 p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-neutral-800">
                <Camera className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <p className="font-medium text-white">Upload Photos</p>
                <p className="text-sm text-neutral-500">添加新的摄影作品</p>
              </div>
            </a>
            <a
              href="/admin/essays"
              className="flex items-center gap-4 p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-neutral-800">
                <FileText className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <p className="font-medium text-white">Write Essay</p>
                <p className="text-sm text-neutral-500">创建新的杂志文章</p>
              </div>
            </a>
            <a
              href="/admin/papers"
              className="flex items-center gap-4 p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="p-3 rounded-lg bg-neutral-800">
                <GraduationCap className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <p className="font-medium text-white">Add Paper</p>
                <p className="text-sm text-neutral-500">录入学术论文信息</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Photos */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Recent Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-neutral-800"
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
              <p className="text-neutral-500 text-sm">暂无照片</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Essays */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Recent Essays</CardTitle>
          </CardHeader>
          <CardContent>
            {essays && essays.length > 0 ? (
              <div className="space-y-3">
                {essays.slice(0, 4).map((essay) => (
                  <div
                    key={essay.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-800"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">
                        {essay.title}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {essay.published ? "已发布" : "草稿"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        essay.published
                          ? "bg-green-900/30 text-green-400 border border-green-800/50"
                          : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                      }`}
                    >
                      {essay.published ? "Published" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">暂无文章</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
