import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/const";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "登录失败");
      }

      // Login successful - store token in localStorage as backup for cross-domain
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // Force a full page reload to refresh auth state
      window.location.replace("/admin");
    } catch (err) {
      console.error("[Login Error]", err);
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
            <span className="text-white font-display text-2xl">O</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Orpheus 后台管理
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            请输入管理员账号登录
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              "登录"
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={() => window.location.href = "/"}
          className="text-muted-foreground"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}
