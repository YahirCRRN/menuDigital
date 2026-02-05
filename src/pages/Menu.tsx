import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, X, Send, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/CustomerForm";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
  logo: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  whatsapp: string | null;
  primary_color: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

type CheckoutStep = 'cart' | 'customer-info';

type OrderDetails = {
  customerName: string;
  orderType: 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'transfer';
  address?: string;
};

const Menu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    loadMenu();
    const savedCart = localStorage.getItem(`cart-${slug}`);
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [slug]);

  useEffect(() => {
    if (slug) localStorage.setItem(`cart-${slug}`, JSON.stringify(cart));
  }, [cart, slug]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      if (!slug) return;

      // Load company data with all necessary fields
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Set primary color if available (client-side only)
      if (typeof window !== 'undefined' && companyData.primary_color) {
        try {
          let color = companyData.primary_color.trim();
          // Add # if it's a hex color without it
          if (/^[0-9A-Fa-f]{6}$/.test(color)) {
            color = `#${color}`;
          }
          document.documentElement.style.setProperty('--primary', color);
        } catch (error) {
          console.error('Error setting primary color:', error);
        }
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("company_id", companyData.id)
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("company_id", companyData.id);

      if (productsError) throw productsError;
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading menu:", error);
      toast.error("Error al cargar el menú");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success("Agregado al carrito");
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev: CartItem[]) => {
      const newCart = prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          // Prevent negative quantities
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      });
      // Remove items with quantity 0
      return newCart.filter(item => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    setCheckoutStep('customer-info');
  };

  const handleCustomerInfoComplete = (data: OrderDetails) => {
    setOrderDetails(data);
    sendWhatsAppOrder(data);
  };

  const sendWhatsAppOrder = (orderData: OrderDetails) => {
    if (!company?.whatsapp) {
      toast.error("No se encontró el número de WhatsApp del restaurante");
      return;
    }

    const orderItems = cart.map(item =>
      `- ${item.name} x${item.quantity} ($${item.price * item.quantity})`
    ).join("\n");

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderTypeText = orderData.orderType === 'pickup' ? 'Recoger en local' : 'Servicio a domicilio';
    const addressText = orderData.orderType === 'delivery' && orderData.address
      ? `🏠 Dirección: ${orderData.address}\n`
      : '';

    const message = `Hola, quiero hacer un pedido:

🏪 Restaurante: ${company.name}

👤 Cliente: ${orderData.customerName}
📦 Tipo de pedido: ${orderTypeText}
${addressText}💳 Pago: ${orderData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}

🛒 Pedido:
${orderItems}

Total: $${total.toFixed(2)}

Gracias!`;

    const whatsappUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Reset cart and state
    setCart([]);
    localStorage.removeItem(`cart-${slug}`);
    setCheckoutStep('cart');
    setCartOpen(false);

    toast.success("Pedido enviado con éxito. ¡Gracias por tu compra!");
  };

  const renderCartContent = () => {
    if (checkoutStep === 'customer-info') {
      return (
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCheckoutStep('cart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al carrito
          </Button>
          <CustomerForm
            onComplete={handleCustomerInfoComplete}
            onBack={() => setCheckoutStep('cart')}
          />
        </div>
      );
    }

    return (
      <>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tu Pedido</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => {
                      setCart((prev) => prev.filter((i) => i.id !== item.id));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between font-medium mb-4">
              <span>Total:</span>
              <span>${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
<Button
  onClick={handleCheckout}
  className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-colors"
>
  <Send className="w-4 h-4 mr-2" /> Enviar Pedido
</Button>



          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando menú...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Menú no encontrado</h1>
          <p className="text-muted-foreground">El restaurante que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
            )}
            <h1 className="text-xl font-bold">{company?.name || "Menú"}</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => {
              setCartOpen(true);
              setCheckoutStep('cart');
            }}
          >
            <ShoppingCart className="h-5 w-5" />
{cart.length > 0 && (
  <span
    className="absolute -top-2 -right-2 
               bg-white font-bold text-xs 
               rounded-full h-5 w-5 
               flex items-center justify-center 
               shadow"
    style={{ color: "hsl(var(--primary))" }}
  >
    {cart.reduce((sum, item) => sum + item.quantity, 0)}
  </span>
)}


          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-8">
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (product) => product.category_id === category.id
              );

              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  <h2 className="menu-category">{category.name}</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="product-card">
                        {product.image ? (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="product-image"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-muted/30 flex items-center justify-center">
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="product-content">
                          <div className="flex justify-between items-start">
                            <h3 className="product-title">{product.name}</h3>
                            <span className="product-price">${product.price.toFixed(2)}</span>
                          </div>
                          {product.description && (
                            <p className="product-description">
                              {product.description}
                            </p>
                          )}
                          <div className="product-footer">
                            <Button
                              className="add-to-cart-btn"
                              size="sm"
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="w-4 h-4" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-background shadow-lg transform ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="h-full flex flex-col">
          {renderCartContent()}
        </div>
      </div>

      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-10"
          onClick={() => setCartOpen(false)}
        />
      )}
    </div>
  );
};

export default Menu;
