import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SettingsPanelProps {
  companyId: string | null;
  onCompanyCreated: (id: string, slug: string) => void;
}

export const SettingsPanel = ({ companyId, onCompanyCreated }: SettingsPanelProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyId) loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();
    
    if (data) {
      setName(data.name);
      setSlug(data.slug);
      setWhatsapp(data.whatsapp || "");
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!companyId) setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      if (companyId) {
        const { error } = await supabase
          .from("companies")
          .update({ name, slug, whatsapp: whatsapp || null })
          .eq("id", companyId);
        if (error) throw error;
        toast.success("Configuración guardada");
      } else {
        // Create new company
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .insert({ name, slug, whatsapp: whatsapp || null })
          .select()
          .single();
        
        if (companyError) throw companyError;

        // Link to profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ company_id: company.id })
          .eq("user_id", user.id);
        
        if (profileError) throw profileError;
        
        onCompanyCreated(company.id, company.slug);
        toast.success("¡Empresa creada!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const menuUrl = slug ? `${window.location.origin}/menu/${slug}` : null;

  return (
    <div className="max-w-xl space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
          <CardDescription>Configura los datos de tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre del negocio</Label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
            </div>
            <div>
              <Label>URL del menú</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-muted rounded-lg px-3 text-sm text-muted-foreground">
                  /menu/
                </div>
                <Input 
                  value={slug} 
                  onChange={(e) => setSlug(generateSlug(e.target.value))} 
                  className="flex-[2]"
                  required 
                />
              </div>
              {menuUrl && (
                <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 mt-2 hover:underline">
                  <ExternalLink className="w-3 h-3" /> {menuUrl}
                </a>
              )}
            </div>
            <Button type="submit" className="gradient-primary border-0" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {companyId ? "Guardar cambios" : "Crear empresa"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-success" />
            WhatsApp
          </CardTitle>
          <CardDescription>Número donde recibirás los pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Número de WhatsApp</Label>
              <Input 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
                placeholder="521234567890"
              />
              <p className="text-xs text-muted-foreground mt-1">Sin espacios ni guiones. Incluye código de país.</p>
            </div>
            <Button type="submit" className="gradient-primary border-0" disabled={loading || !companyId}>
              <Save className="w-4 h-4 mr-2" /> Guardar WhatsApp
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
