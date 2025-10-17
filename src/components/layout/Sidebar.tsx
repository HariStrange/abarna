import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Masters",
    icon: Database,
    children: [
      { title: "Branch Manager", href: "/admin-table/branch-manager" },
      { title: "Warehouse Manager", href: "/admin-table/warehouse-manager" },
      { title: "Zone Manager", href: "/admin-table/zone-manager" },
      { title: "Rack Manager", href: "/admin-table/rack-manager" },
      { title: "Bin Manager", href: "/admin-table/bin-manager" },
      { title: "Item Type Manager", href: "/admin-table/item-type-manager" },
      { title: "Item Manager", href: "/admin-table/item-manager" },
    ],
  },
  {
    title: "Inventory",
    icon: Shield,
    children: [
      { title: "Supplier Manager", href: "/admin-table/supplier-manager" },
      { title: "Purchase Order", href: "/admin-table/purchase-order" },
      { title: "GRN Manager", href: "/admin-table/grn-manager" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = true,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    if (collapsed) return;
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border shadow-lg transition-all duration-300",
          "lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
        animate={{
          width: collapsed ? "4rem" : "16rem",
        }}
        initial={false}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <img
                      src="https://res.cloudinary.com/di3jfjzfn/image/upload/v1760597280/Picsart_25-10-16_12-00-08-989-removebg-preview_oue1ur.png"
                      alt="Sholas Logo"
                      className="h-10 w-auto dark:hidden"
                    />
                    <img
                      src="https://res.cloudinary.com/di3jfjzfn/image/upload/v1760598322/Picsart_25-10-16_12-27-13-498__1_-removebg-preview_azx2vm.png"
                      alt="Sholas Logo"
                      className="h-10 w-auto hidden dark:block"
                    />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex items-center justify-center h-12 border-b border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <TooltipProvider delayDuration={0}>
            <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.title}>
                  {item.children ? (
                    <div>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleExpanded(item.title)}
                              className={cn(
                                "w-full flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all hover:bg-sidebar-accent",
                                expandedItems.includes(item.title) &&
                                  "bg-sidebar-accent"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex flex-col gap-1">
                            <p className="font-semibold">{item.title}</p>
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={onClose}
                                className="text-xs hover:underline"
                              >
                                {child.title}
                              </Link>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleExpanded(item.title)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-sidebar-accent group",
                              expandedItems.includes(item.title) &&
                                "bg-sidebar-accent"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </div>
                            <motion.div
                              animate={{
                                rotate: expandedItems.includes(item.title)
                                  ? 180
                                  : 0,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {expandedItems.includes(item.title) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-9 mt-1 space-y-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.href}
                                      to={child.href}
                                      onClick={onClose}
                                      className={cn(
                                        "block px-3 py-2 rounded-lg text-sm transition-all hover:bg-sidebar-accent hover:translate-x-1",
                                        isActive(child.href) &&
                                          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                      )}
                                    >
                                      {child.title}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.href!}
                              onClick={onClose}
                              className={cn(
                                "flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all hover:bg-sidebar-accent",
                                isActive(item.href!) &&
                                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link
                          to={item.href!}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-sidebar-accent group",
                            isActive(item.href!) &&
                              "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              ))}
            </nav>
          </TooltipProvider>

          <Separator />

          <div className="p-3 space-y-1">
            {collapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center p-3"
                      asChild
                    >
                      <Link to="/settings">
                        <Settings className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-destructive hover:text-destructive p-3"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/settings" className="w-full flex items-center">
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
