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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-neutral-900 rounded-2xl border border-neutral-800">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
            <span className="text-black font-display text-2xl">O</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-center text-white">
            Orpheus Admin
          </h1>
          <p className="text-sm text-neutral-400 text-center max-w-sm">
            Sign in with your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-lg border border-red-800/50">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-white text-black hover:bg-neutral-200 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={() => window.location.href = "/"}
          className="text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
