import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, LayoutGrid, Package, Eye, Settings, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { RestaurantProfile } from "@/components/admin/RestaurantProfile";
import type { User } from "@supabase/supabase-js";

type TabType = "profile" | "categories" | "products" | "settings";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companySlug, setCompanySlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.company_id) {
      setCompanyId(profile.company_id);
      const { data: company } = await supabase
        .from("companies")
        .select("slug")
        .eq("id", profile.company_id)
        .maybeSingle();
      if (company) setCompanySlug(company.slug);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const tabs = [
    { id: "categories" as const, label: "Categorías", icon: LayoutGrid },
    { id: "products" as const, label: "Productos", icon: Package },
    { id: "settings" as const, label: "Configuración", icon: Settings },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">MenuDigital</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className="w-full justify-start"
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
            
            {companySlug && (
              <a
                href={`/menu/${companySlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver menú
              </a>
            )}
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card px-4 flex items-center gap-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === "profile" && companyId && (
            <RestaurantProfile companyId={companyId} />
          )}
          {activeTab === "categories" && companyId && (
            <CategoriesPanel companyId={companyId} />
          )}
          {activeTab === "products" && companyId && (
            <ProductsPanel companyId={companyId} />
          )}
          {activeTab === "settings" && <SettingsPanel companyId={companyId} onCompanyCreated={(id, slug) => { setCompanyId(id); setCompanySlug(slug); }} />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
