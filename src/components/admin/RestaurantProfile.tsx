import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CompanyProfile {
  id: string;
  name: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  whatsapp: string | null;
}

export const RestaurantProfile = ({ companyId }: { companyId: string }) => {
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [companyId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      setProfile(data);
      if (data.logo) setLogoPreview(data.logo);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile({
            ...profile,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Ubicación obtenida correctamente");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Error al obtener la ubicación");
        }
      );
    } else {
      toast.error("La geolocalización no es soportada por tu navegador");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let logoUrl = profile.logo || null;

      // Upload new logo if selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${companyId}/logo-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Update company profile
      const { error } = await supabase
        .from("companies")
        .update({
          ...profile,
          logo: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId);

      if (error) throw error;

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando perfil...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Perfil del Restaurante</h2>
        <p className="text-muted-foreground">
          Actualiza la información de tu restaurante
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="logo">Logo del Restaurante</Label>
            <div className="mt-2 flex items-center gap-4">
              {logoPreview && (
                <div className="h-20 w-20 rounded-md overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo del restaurante"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Sube una imagen para el logo de tu restaurante
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Restaurante</Label>
              <Input
                id="name"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de Contacto</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (para recibir pedidos)</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={profile.whatsapp || ""}
              onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
              placeholder="+521234567890"
              required
            />
            <p className="text-sm text-muted-foreground">
              Número de teléfono con código de país (ej. +521234567890)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="address">Dirección del Restaurante</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLocationClick}
              >
                Usar mi ubicación actual
              </Button>
            </div>
            <Input
              id="address"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              required
            />
            {(profile.lat && profile.lng) && (
              <p className="text-sm text-muted-foreground">
                Ubicación: {profile.lat?.toFixed(6)}, {profile.lng?.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantProfile;
