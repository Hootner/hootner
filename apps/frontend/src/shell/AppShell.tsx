import { Outlet, NavLink } from "react-router-dom";
import {
  MonitorPlay,
  Cube,
  ShieldCheck,
  ChartLine,
  Broadcast,
  UsersThree,
  Sparkle,
  Stack,
  Code,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Video Intelligence", icon: MonitorPlay },
  { to: "/social", label: "Social Feed", icon: UsersThree },
  { to: "/generate", label: "AI Generator", icon: Sparkle },
  { to: "/3d", label: "3D Visualization", icon: Cube },
  { to: "/scene-builder", label: "Scene Builder", icon: Stack },
  { to: "/shaders", label: "Shader Lab", icon: Code },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
  { to: "/heatmap-3d", label: "3D Heatmap", icon: Broadcast },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Background gradient */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, oklch(0.25 0.20 290) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.78 0.15 80) 0%, transparent 50%)",
        }}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 lg:w-64 z-50 border-r border-border/50 backdrop-blur-xl bg-sidebar/80 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h1 className="hidden lg:block text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            HOOTNER
          </h1>
          <span className="lg:hidden text-xl font-bold text-primary">H</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary-foreground border border-primary/30"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" weight="duotone" />
              <span className="hidden lg:inline text-sm font-medium">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="hidden lg:block">
            <p className="text-xs text-muted-foreground">
              Global Intelligence Platform
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              v2.0.0 &middot; Hexarchy
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-16 lg:ml-64 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
