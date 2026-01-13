import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Settings, User, Database, Shield } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white">
          Settings
        </h1>
        <p className="text-neutral-400 mt-1">
          Manage your blog settings
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800">
                <User className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Profile</CardTitle>
                <CardDescription className="text-neutral-500">Your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Username</p>
                <p className="font-medium text-white">{user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium text-white">{user?.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Role</p>
                <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-900/30 text-purple-400 border border-purple-800/50">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800">
                <Shield className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Security</CardTitle>
                <CardDescription className="text-neutral-500">Account security settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Login Method</p>
                <p className="font-medium text-white">{user?.loginMethod || "Manus OAuth"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Last Login</p>
                <p className="font-medium text-white">
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
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800">
                <Database className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Data Management</CardTitle>
                <CardDescription className="text-neutral-500">Database and storage info</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Database</p>
                <p className="font-medium text-white">MySQL / TiDB</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">File Storage</p>
                <p className="font-medium text-white">S3 Compatible Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800">
                <Settings className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">About</CardTitle>
                <CardDescription className="text-neutral-500">System information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">System Name</p>
                <p className="font-medium text-white">Orpheus Blog</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Version</p>
                <p className="font-medium text-white">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Tech Stack</p>
                <p className="font-medium text-white">React + tRPC + Drizzle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-neutral-800/50 border-neutral-700">
        <CardContent className="p-6">
          <h3 className="font-semibold text-white mb-2">使用提示</h3>
          <ul className="text-sm text-neutral-400 space-y-2">
            <li>• 您可以在 <strong className="text-white">Photography</strong> 页面上传和管理照片</li>
            <li>• 在 <strong className="text-white">Magazine</strong> 页面撰写和发布文章，支持 Markdown 格式</li>
            <li>• <strong className="text-white">Academic</strong> 页面用于录入您的研究成果和论文信息</li>
            <li>• 所有内容默认为草稿状态，需要手动发布才能在前台显示</li>
            <li>• 图片会自动上传到云存储，无需担心服务器空间</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
