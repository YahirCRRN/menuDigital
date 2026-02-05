import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  status: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductsPanelProps {
  companyId: string | null;
}

export const ProductsPanel = ({ companyId }: ProductsPanelProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (companyId) { loadProducts(); loadCategories(); }
    else setLoading(false);
  }, [companyId]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("company_id", companyId)
      .order("display_order");
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Primero configura tu empresa");
      return;
    }

    const productData = {
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      image: image || null,
      category_id: categoryId || null,
      status: isActive ? "active" : "inactive",
      company_id: companyId,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Producto actualizado");
    } else {
      const { error } = await supabase.from("products").insert(productData);
      if (error) toast.error("Error al crear");
      else toast.success("Producto creado");
    }

    resetForm();
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Producto eliminado");
    loadProducts();
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setImage("");
    setCategoryId("");
    setIsActive(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price.toString());
    setImage(p.image || "");
    setCategoryId(p.category_id || "");
    setIsActive(p.status === "active");
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
        <p className="text-sm text-muted-foreground">{products.length} productos</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="w-4 h-4 mr-2" /> Nuevo producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar" : "Nuevo"} producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Precio</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>URL de imagen</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex items-center justify-between">
                <Label>Producto activo</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button type="submit" className="w-full gradient-primary border-0">
                {editingProduct ? "Guardar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : products.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay productos. ¡Crea el primero!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className={`shadow-card overflow-hidden ${p.status === "inactive" ? "opacity-60" : ""}`}>
              {p.image && (
                <div className="aspect-video bg-muted">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-lg font-bold text-primary">${p.price.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
