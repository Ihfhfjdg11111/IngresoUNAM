import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Shield, ShieldOff, Trash2, Search, Users, Crown, XCircle, CreditCard
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import { Input } from "../../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { AuthContext, API } from "../../App";
import { toast } from "sonner";
import { useAdminData } from "../../contexts/AdminDataContext";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const { getCachedData, setCachedData, isStale, invalidateCache } = useAdminData();
  
  // Use cached data if available
  const cachedUsers = getCachedData('users');
  const [users, setUsers] = useState(cachedUsers || []);
  const [loading, setLoading] = useState(!cachedUsers || isStale('users', 60000));
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [removePremiumDialogOpen, setRemovePremiumDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [premiumUsers, setPremiumUsers] = useState(new Set());

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchPremiumStatus = async (userIds) => {
    try {
      const response = await fetch(`${API}/users/me/subscription`, {
        headers,
        credentials: "include"
      });
      // We'll check premium status per user in the list
      // For now, we'll fetch subscription info for each user
      const premiumSet = new Set();
      for (const userId of userIds) {
        const subRes = await fetch(`${API}/admin/users/${userId}/subscription`, {
          headers,
          credentials: "include"
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.is_premium) {
            premiumSet.add(userId);
          }
        }
      }
      setPremiumUsers(premiumSet);
    } catch (error) {
      console.error("Error fetching premium status:", error);
    }
  };

  const fetchUsers = useCallback(async (force = false) => {
    // Use cache if available and not stale (60 seconds for users)
    if (!force && cachedUsers && !isStale('users', 60000)) {
      setUsers(cachedUsers);
      setLoading(false);
      // Don't use cached premium data - always fetch fresh
      fetchPremiumStatus(cachedUsers.map(u => u.user_id));
      return;
    }
    
    // Clear cache when forcing refresh
    if (force) {
      invalidateCache('users');
    }

    try {
      const response = await fetch(`${API}/admin/users`, {
        headers,
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        // Fetch subscription status for each user
        const usersWithPremium = await Promise.all(
          data.map(async (u) => {
            try {
              const subRes = await fetch(`${API}/admin/users/${u.user_id}/subscription`, {
                headers,
                credentials: "include"
              });
              if (subRes.ok) {
                const subData = await subRes.json();
                return { ...u, subscription: subData };
              } else {
                // Subscription no disponible
              }
            } catch (e) {}
            return { ...u, subscription: null };
          })
        );
        setCachedData('users', usersWithPremium);
        setUsers(usersWithPremium);
      } else {
        toast.error("Error al cargar usuarios");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
      // Use cached data on error
      if (cachedUsers) setUsers(cachedUsers);
    } finally {
      setLoading(false);
    }
  }, [headers, cachedUsers, isStale, setCachedData]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {}
    localStorage.clear();
    navigate("/");
  };

  const openRoleDialog = (user, newRole) => {
    setSelectedUser(user);
    setTargetRole(newRole);
    setRoleDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API}/admin/users/${selectedUser.user_id}/role`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ role: targetRole })
      });

      if (response.ok) {
        toast.success(`Usuario ${targetRole === "admin" ? "promovido a administrador" : "cambiado a estudiante"}`);
        setRoleDialogOpen(false);
        setSelectedUser(null);
        // Invalidate cache and refetch
        invalidateCache('users');
        invalidateCache('stats');
        fetchUsers(true);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al cambiar rol");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API}/admin/users/${selectedUser.user_id}`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Usuario eliminado");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        // Invalidate cache and refetch
        invalidateCache('users');
        invalidateCache('stats');
        fetchUsers(true);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleUpgradeToPremium = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API}/admin/users/${selectedUser.user_id}/premium`, {
        method: "POST",
        headers,
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.extended ? "Premium extendido 1 año más" : "Usuario actualizado a Premium");
        setPremiumDialogOpen(false);
        setSelectedUser(null);
        invalidateCache('users');
        invalidateCache('stats');
        fetchUsers(true);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleRemovePremium = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${API}/admin/users/${selectedUser.user_id}/premium`, {
        method: "DELETE",
        headers,
        credentials: "include"
      });

      if (response.ok) {
        toast.success("Suscripción Premium cancelada");
        setRemovePremiumDialogOpen(false);
        setSelectedUser(null);
        invalidateCache('users');
        invalidateCache('stats');
        fetchUsers(true);
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al cancelar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const isPremium = (user) => {
    if (!user.subscription) return false;
    return user.subscription.is_premium || user.subscription.status === "active";
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-[#0A2540] border-t-[#F2B705] rounded-full animate-spin"></div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === "admin").length;
  const studentCount = users.filter(u => u.role === "student").length;

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors duration-300">
      <Sidebar isAdmin={true} />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
      <main className="p-6 md:p-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Usuarios</h1>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A2540] dark:text-white font-[Poppins] hidden lg:block">
              Gestión de Usuarios
            </h1>
            <p className="text-[#4A5568] dark:text-slate-400 mt-1">
              {users.length} usuarios registrados
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => fetchUsers(true)}
            className="hidden lg:flex"
          >
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#4A5568] dark:text-slate-400">Total Usuarios</p>
            <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#4A5568] dark:text-slate-400">Administradores</p>
            <p className="text-2xl font-bold text-[#F2B705]">{adminCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#4A5568] dark:text-slate-400">Estudiantes</p>
            <p className="text-2xl font-bold text-[#10B981]">{studentCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#4A5568] dark:text-slate-400">Premium</p>
            <p className="text-2xl font-bold text-purple-600">{users.filter(u => isPremium(u)).length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568] dark:text-slate-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="search-users"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isCurrentUser = user.user_id === currentUser?.user_id;
            
            return (
              <div 
                key={user.user_id}
                className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                  isCurrentUser ? "ring-2 ring-[#F2B705]" : ""
                }`}
                data-testid={`user-${user.user_id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      user.role === "admin" ? "bg-[#F2B705] text-[#0A2540]" : "bg-[#0A2540]"
                    }`}>
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#0A2540] dark:text-white">{user.name}</h3>
                        {isCurrentUser && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-[#0A2540] dark:text-amber-300 px-2 py-0.5 rounded">
                            Tú
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          user.role === "admin" 
                            ? "bg-amber-100 text-[#0A2540]" 
                            : "bg-slate-100 dark:bg-slate-700 text-[#4A5568] dark:text-slate-400"
                        }`}>
                          {user.role === "admin" ? "Admin" : "Estudiante"}
                        </span>
                        {isPremium(user) && (
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#4A5568] dark:text-slate-400">{user.email}</p>
                      <p className="text-xs text-[#4A5568] dark:text-slate-400 mt-1">
                        Registrado: {formatDate(user.created_at)} • {user.attempts_count || 0} intentos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCurrentUser && (
                      <>
                        {/* Premium Button */}
                        {isPremium(user) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setRemovePremiumDialogOpen(true);
                            }}
                            className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/30"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Quitar Premium
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setPremiumDialogOpen(true);
                            }}
                            className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-500 dark:hover:bg-purple-900/30"
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Hacer Premium
                          </Button>
                        )}
                        
                        {user.role === "student" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user, "admin")}
                            className="text-[#F2B705] border-[#F2B705] hover:bg-[#F2B705]/10"
                            data-testid={`promote-${user.user_id}`}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Hacer Admin
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user, "student")}
                            className="text-[#4A5568] dark:text-slate-400 border-slate-300 dark:border-slate-600"
                            data-testid={`demote-${user.user_id}`}
                          >
                            <ShieldOff className="w-4 h-4 mr-1" />
                            Quitar Admin
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          data-testid={`delete-user-${user.user_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-[#4A5568]/30 dark:text-slate-500 mb-4" />
            <p className="text-[#4A5568] dark:text-slate-400">No se encontraron usuarios</p>
          </div>
        )}
      </main>

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {targetRole === "admin" ? "¿Promover a administrador?" : "¿Quitar permisos de administrador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {targetRole === "admin" 
                ? `${selectedUser?.name} podrá gestionar preguntas, simulacros y otros usuarios.`
                : `${selectedUser?.name} perderá acceso al panel de administración.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              className={targetRole === "admin" ? "bg-[#F2B705] text-[#0A2540]" : "bg-slate-600"}
              data-testid="confirm-role-change"
            >
              {targetRole === "admin" ? "Promover" : "Quitar Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade to Premium Dialog */}
      <AlertDialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              ¿Convertir a Premium?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedUser?.name}</strong> obtendrá acceso ilimitado a todos los simulacros y características premium por 1 año.
              <br /><br />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Si ya tiene premium activo, se extenderá 1 año más.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPremiumDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleUpgradeToPremium();
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Hacer Premium
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Premium Dialog */}
      <AlertDialog open={removePremiumDialogOpen} onOpenChange={setRemovePremiumDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              ¿Cancelar Premium?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedUser?.name}</strong> perderá el acceso premium y volverá al plan gratuito.
              <br /><br />
              <span className="text-sm text-red-500">
                Esta acción cancela la suscripción inmediatamente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemovePremiumDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePremium}
              className="bg-red-500 hover:bg-red-600"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar Premium
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a <strong>{selectedUser?.name}</strong> ({selectedUser?.email}) 
              y todos sus datos, incluyendo intentos de exámenes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="confirm-delete-user"
            >
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
};

export default AdminUsers;
