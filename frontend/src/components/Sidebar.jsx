import { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  BookOpen, BarChart3, BookMarked, History, Crown, Settings, 
  LogOut, Menu, X, ChevronLeft, ChevronRight,
  FileQuestion, Target, Users, Flag, TrendingUp, FileText, MessageSquare
} from "lucide-react";
import { Button } from "./ui/button";
import { AuthContext, API } from "../App";
import { usePrefetch } from "../hooks/usePrefetch";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { prefetchAdminData } = usePrefetch();

  // Prefetch data on hover for admin routes
  const handleNavHover = useCallback((path) => {
    if (!isAdmin) return;
    
    const routeMap = {
      '/admin': 'dashboard',
      '/admin/questions': 'questions',
      '/admin/simulators': 'simulators',
      '/admin/users': 'users',
      '/admin/reports': 'reports'
    };
    
    const section = routeMap[path];
    if (section) {
      prefetchAdminData(section);
    }
  }, [isAdmin, prefetchAdminData]);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {
      // Error silenciado
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  // Student navigation items
  const studentNavItems = [
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/subjects", icon: BookMarked, label: "Práctica por Materia" },
    { path: "/history", icon: History, label: "Historial" },
    { path: "/subscription", icon: Crown, label: "Mi Suscripción" },
  ];

  // Admin navigation items
  const adminNavItems = [
    { path: "/admin", icon: BarChart3, label: "Dashboard" },
    { path: "/admin/questions", icon: FileQuestion, label: "Preguntas" },
    { path: "/admin/reading-texts", icon: FileText, label: "Textos de Lectura" },
    { path: "/admin/simulators", icon: Target, label: "Simulacros" },
    { path: "/admin/users", icon: Users, label: "Usuarios" },
    { path: "/admin/reports", icon: Flag, label: "Reportes" },
    { path: "/admin/feedback", icon: MessageSquare, label: "Feedback" },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const isActive = (path) => {
    if (path === "/dashboard" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2 mb-10 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-[#F2B705]" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold font-[Poppins] whitespace-nowrap">IngresoUNAM</span>
        )}
      </div>

      {/* Section label */}
      {!isCollapsed && (
        <p className="text-xs text-white/50 uppercase tracking-wider mb-4">
          {isAdmin ? "Admin Panel" : "Menú"}
        </p>
      )}

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              onMouseEnter={() => handleNavHover(item.path)}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} ${
                active 
                  ? 'text-white bg-white/10' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isCollapsed ? item.label : undefined}
              data-testid={`nav-${item.path.replace(/\//g, '-')}`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Button>
          );
        })}    
        
        {/* Admin link for students / Student view for admin */}
        {!isAdmin && user?.role === "admin" && (
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/admin");
              setIsMobileOpen(false);
            }}
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-white/70 hover:text-white hover:bg-white/10`}
            title={isCollapsed ? "Admin" : undefined}
          >
            <Settings className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && "Admin"}
          </Button>
        )}

        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/dashboard");
                setIsMobileOpen(false);
              }}
              className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-white/70 hover:text-white hover:bg-white/10`}
              title={isCollapsed ? "Vista Estudiante" : undefined}
            >
              <TrendingUp className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && "Vista Estudiante"}
            </Button>
          </div>
        )}
      </nav>

      {/* User section at bottom */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-[#F2B705] rounded-full flex items-center justify-center text-[#0A2540] font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Usuario"}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-[#F2B705] rounded-full flex items-center justify-center text-[#0A2540] font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className={`${isCollapsed ? 'flex justify-center mb-4' : 'flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg'}`}>
          {!isCollapsed && <span className="text-xs text-white/60">Tema</span>}
          <ThemeToggle collapsed={isCollapsed} />
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-white/70 hover:text-white hover:bg-white/10`}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          data-testid="logout-btn"
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>

      {/* Collapse toggle button (desktop only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F2B705] rounded-full flex items-center justify-center text-[#0A2540] shadow-lg hover:scale-110 transition-transform hidden lg:flex"
        data-testid="collapse-sidebar-btn"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-[100] flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            data-testid="mobile-menu-btn"
          >
            <Menu className="w-6 h-6 text-[#0A2540] dark:text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0A2540] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#F2B705]" />
            </div>
            <span className="text-lg font-bold text-[#0A2540] dark:text-white">IngresoUNAM</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          data-testid="mobile-logout"
        >
          <LogOut className="w-5 h-5 text-[#4A5568] dark:text-slate-400" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-[#0A2540] text-white p-6 z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed left-0 top-0 h-full bg-[#0A2540] text-white p-6 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        data-testid="desktop-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Spacer for mobile (to push content below fixed header) */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;
