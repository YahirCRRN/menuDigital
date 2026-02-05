import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

interface CategoriesPanelProps {
  companyId: string | null;
}

export const CategoriesPanel = ({ companyId }: CategoriesPanelProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (companyId) loadCategories();
    else setLoading(false);
  }, [companyId]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("company_id", companyId)
      .order("display_order");
    
    if (!error && data) setCategories(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Primero configura tu empresa en Configuración");
      return;
    }

    const categoryData = { name, description: description || null, company_id: companyId };

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Categoría actualizada");
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({ ...categoryData, display_order: categories.length });
      if (error) toast.error("Error al crear");
      else toast.success("Categoría creada");
    }

    resetForm();
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("Error al eliminar");
    else { toast.success("Categoría eliminada"); loadCategories(); }
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setDialogOpen(true);
  };

  if (!companyId) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Primero configura tu empresa en la sección de Configuración</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{categories.length} categorías</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 mr-2" /> Nueva categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar" : "Nueva"} categoría</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button type="submit" className="w-full gradient-primary border-0">
                {editingCategory ? "Guardar cambios" : "Crear categoría"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : categories.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay categorías. ¡Crea la primera!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="shadow-card">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{cat.name}</p>
                  {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
