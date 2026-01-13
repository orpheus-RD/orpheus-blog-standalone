import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  Camera, 
  FileText, 
  GraduationCap, 
  Home, 
  LogOut, 
  PanelLeft, 
  Settings,
  LayoutDashboard
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, Route, Switch } from "wouter";
import { DashboardLayoutSkeleton } from '@/components/DashboardLayoutSkeleton';

// Admin sub-pages
import AdminDashboard from "./admin/AdminDashboard";
import AdminPhotos from "./admin/AdminPhotos";
import AdminEssays from "./admin/AdminEssays";
import AdminPapers from "./admin/AdminPapers";
import AdminSettings from "./admin/AdminSettings";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Camera, label: "摄影作品", path: "/admin/photos" },
  { icon: FileText, label: "杂志随笔", path: "/admin/essays" },
  { icon: GraduationCap, label: "学术论文", path: "/admin/papers" },
  { icon: Settings, label: "设置", path: "/admin/settings" },
];

const SIDEBAR_WIDTH_KEY = "admin-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function Admin() {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
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
              请登录以访问后台管理系统
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            登录
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <span className="text-red-600 text-3xl">⚠</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              权限不足
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              您没有访问后台管理系统的权限。请联系管理员。
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <AdminLayoutContent setSidebarWidth={setSidebarWidth} />
    </SidebarProvider>
  );
}

type AdminLayoutContentProps = {
  setSidebarWidth: (width: number) => void;
};

function AdminLayoutContent({ setSidebarWidth }: AdminLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => 
    location === item.path || (item.path !== '/admin' && location.startsWith(item.path))
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-slate-900"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-slate-800">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-slate-400" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-display text-lg text-white truncate">
                    Orpheus
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    Admin
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-slate-900">
            <SidebarMenu className="px-2 py-3">
              {menuItems.map(item => {
                const isActive = location === item.path || 
                  (item.path !== '/admin' && location.startsWith(item.path));
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal text-slate-300 hover:text-white hover:bg-slate-800 ${
                        isActive ? "bg-slate-800 text-white" : ""
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Back to site link */}
            <div className="px-2 mt-auto">
              <SidebarMenuButton
                onClick={() => window.location.href = '/'}
                tooltip="返回网站"
                className="h-10 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Home className="h-4 w-4" />
                <span>返回网站</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3 bg-slate-900 border-t border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-slate-800 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-slate-700 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-white">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-slate-50">
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-white px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground font-medium">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-6">
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/photos" component={AdminPhotos} />
            <Route path="/admin/essays" component={AdminEssays} />
            <Route path="/admin/papers" component={AdminPapers} />
            <Route path="/admin/settings" component={AdminSettings} />
          </Switch>
        </main>
      </SidebarInset>
    </>
  );
}
