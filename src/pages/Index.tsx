import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Store, ShoppingCart, MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MenuDigital</span>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 text-balance">
            Tu menú digital
            <span className="block gradient-primary bg-clip-text text-transparent">
              profesional en minutos
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Crea tu menú digital, recibe pedidos por WhatsApp y haz crecer tu negocio. 
            Sin complicaciones, sin comisiones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto gradient-primary border-0 text-lg px-8 py-6 shadow-float hover:opacity-90 transition-opacity">
                Comenzar gratis
              </Button>
            </Link>
            <Link to="/menu/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                Ver demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          {[
            { icon: Store, title: "Panel Admin", desc: "Gestiona tu menú fácilmente" },
            { icon: ShoppingCart, title: "Carrito Simple", desc: "Tus clientes arman su pedido" },
            { icon: MessageCircle, title: "WhatsApp", desc: "Recibe pedidos al instante" },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-card rounded-2xl p-6 shadow-card text-center animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
