import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CustomerFormProps {
  onComplete: (data: {
    customerName: string;
    orderType: "pickup" | "delivery";
    paymentMethod: "cash" | "transfer";
    address?: string;
  }) => void;
  onBack: () => void;
}

export const CustomerForm = ({ onComplete, onBack }: CustomerFormProps) => {
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }

    if (orderType === "delivery" && !address.trim()) {
      toast.error("Por favor ingresa tu dirección");
      return;
    }

    onComplete({
      customerName: customerName.trim(),
      orderType,
      paymentMethod,
      address: orderType === "delivery" ? address.trim() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Información del Pedido</h2>
        <p className="text-muted-foreground">
          Completa tus datos para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-container space-y-5">

        {/* NOMBRE */}
        <div>
          <Label className="form-label">Nombre Completo</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Tu nombre completo"
            className="form-input"
          />
        </div>

        {/* TIPO PEDIDO */}
        <div className="space-y-3">
          <Label className="form-label">Tipo de Pedido</Label>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setOrderType("pickup")}
              data-active={orderType === "pickup"}
              className="form-radio-label"
            >
              Recoger en local
            </div>

            <div
              onClick={() => setOrderType("delivery")}
              data-active={orderType === "delivery"}
              className="form-radio-label"
            >
              Servicio a domicilio
            </div>
          </div>
        </div>

        {/* DIRECCIÓN */}
        {orderType === "delivery" && (
          <div className="space-y-2">
            <Label className="form-label">Dirección</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, colonia, ciudad"
              className="form-input"
            />
          </div>
        )}

        {/* MÉTODO DE PAGO */}
        <div className="space-y-3">
          <Label className="form-label">Método de Pago</Label>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentMethod("cash")}
              data-active={paymentMethod === "cash"}
              className="form-radio-label"
            >
              Efectivo
            </div>

            <div
              onClick={() => setPaymentMethod("transfer")}
              data-active={paymentMethod === "transfer"}
              className="form-radio-label"
            >
              Transferencia
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Volver
          </Button>

<Button
  type="submit"
  className="shadow-md hover:brightness-110"
  style={{
    backgroundColor: "#FF6B35",
    color: "white"
  }}
  disabled={loading}
>
  {loading ? "Procesando..." : "Continuar con el pedido"}
</Button>

        </div>
      </form>
    </div>
  );
};
