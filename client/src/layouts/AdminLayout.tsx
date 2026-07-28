import { NavLink, Outlet } from "react-router";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/economy", label: "Economy" },
  { to: "/admin/audit-logs", label: "Audit Logs" },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <nav aria-label="Admin navigation" className="w-56 border-r border-border bg-surface p-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm",
                    isActive ? "bg-accent text-bg-canvas" : "text-text-primary hover:bg-surface-raised",
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
