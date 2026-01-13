import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Settings, User, Database, Shield } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-slate-900">
          设置
        </h1>
        <p className="text-slate-500 mt-1">
          管理您的博客设置
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">个人信息</CardTitle>
                <CardDescription>您的账户信息</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">用户名</p>
                <p className="font-medium text-slate-900">{user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">邮箱</p>
                <p className="font-medium text-slate-900">{user?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">角色</p>
                <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                  {user?.role === 'admin' ? '管理员' : '用户'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">安全设置</CardTitle>
                <CardDescription>账户安全相关设置</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">登录方式</p>
                <p className="font-medium text-slate-900">{user?.loginMethod || "Manus OAuth"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">上次登录</p>
                <p className="font-medium text-slate-900">
                  {user?.lastSignedIn 
                    ? new Date(user.lastSignedIn).toLocaleString('zh-CN')
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Database className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">数据管理</CardTitle>
                <CardDescription>数据库和存储信息</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">数据库</p>
                <p className="font-medium text-slate-900">MySQL / TiDB</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">文件存储</p>
                <p className="font-medium text-slate-900">S3 兼容存储</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Settings className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg">关于</CardTitle>
                <CardDescription>系统信息</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">系统名称</p>
                <p className="font-medium text-slate-900">Orpheus Blog</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">版本</p>
                <p className="font-medium text-slate-900">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">技术栈</p>
                <p className="font-medium text-slate-900">React + tRPC + Drizzle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">使用提示</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• 您可以在 <strong>摄影作品</strong> 页面上传和管理照片</li>
            <li>• 在 <strong>杂志随笔</strong> 页面撰写和发布文章，支持 Markdown 格式</li>
            <li>• <strong>学术论文</strong> 页面用于录入您的研究成果和论文信息</li>
            <li>• 所有内容默认为草稿状态，需要手动发布才能在前台显示</li>
            <li>• 图片会自动上传到云存储，无需担心服务器空间</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
