import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, CreditCard, CheckCircle, Loader2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Fee {
  id: string;
  reference_month: string;
  reference_year: number;
  amount: number;
  due_date: string;
  status: string;
}

interface PaymentDialogProps {
  fee: Fee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

type PaymentMethod = "mpesa" | "emola" | "card" | null;

const PaymentDialog = ({ fee, open, onOpenChange, onPaymentSuccess }: PaymentDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(value);
  };

  const getMonthName = (month: string) => {
    const months: Record<string, string> = {
      "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
      "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
      "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
    };
    return months[month] || month;
  };

  const resetState = () => {
    setSelectedMethod(null);
    setPhoneNumber("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setIsProcessing(false);
    setIsSuccess(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const handlePayment = async () => {
    if (!fee) return;

    if (selectedMethod === "mpesa" || selectedMethod === "emola") {
      if (!phoneNumber || phoneNumber.length < 9) {
        toast({
          title: "Número inválido",
          description: "Introduza um número de telefone válido.",
          variant: "destructive",
        });
        return;
      }
    }

    if (selectedMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os dados do cartão.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    // In production, this would call an edge function to process the payment
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setIsSuccess(true);

    toast({
      title: "Pagamento iniciado!",
      description: selectedMethod === "card" 
        ? "O pagamento foi processado com sucesso."
        : `Um pedido de pagamento foi enviado para o seu telefone. Confirme no seu ${selectedMethod === "mpesa" ? "M-Pesa" : "e-Mola"}.`,
    });

    setTimeout(() => {
      onPaymentSuccess();
      handleClose(false);
    }, 2000);
  };

  const paymentMethods = [
    {
      id: "mpesa" as PaymentMethod,
      name: "M-Pesa",
      description: "Vodacom M-Pesa",
      icon: Smartphone,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      id: "emola" as PaymentMethod,
      name: "e-Mola",
      description: "Movitel e-Mola",
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      id: "card" as PaymentMethod,
      name: "Cartão",
      description: "Visa / Mastercard",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Pagamento Iniciado!</h3>
            <p className="text-muted-foreground text-center text-sm">
              {selectedMethod === "card"
                ? "O pagamento foi processado com sucesso."
                : `Verifique o seu telefone e confirme o pagamento no ${selectedMethod === "mpesa" ? "M-Pesa" : "e-Mola"}.`}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pagar Taxa Condominial</DialogTitle>
              <DialogDescription>
                {getMonthName(fee.reference_month)} de {fee.reference_year} — {formatCurrency(Number(fee.amount))}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Payment Method Selection */}
              {!selectedMethod && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Escolha o método de pagamento:</p>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                          method.bgColor, method.borderColor
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", method.bgColor)}>
                          <Icon className={cn("w-6 h-6", method.color)} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* M-Pesa / e-Mola Form */}
              {(selectedMethod === "mpesa" || selectedMethod === "emola") && (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Alterar método de pagamento
                  </button>

                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(fee.amount))}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Telefone {selectedMethod === "mpesa" ? "(Vodacom)" : "(Movitel)"}</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-secondary rounded-md text-sm text-muted-foreground">+258</span>
                      <Input
                        id="phone"
                        placeholder={selectedMethod === "mpesa" ? "84 xxx xxxx" : "86 xxx xxxx"}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receberá um pedido de pagamento no seu telefone.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing || phoneNumber.length < 9}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      `Pagar ${formatCurrency(Number(fee.amount))}`
                    )}
                  </Button>
                </div>
              )}

              {/* Card Form */}
              {selectedMethod === "card" && (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Alterar método de pagamento
                  </button>

                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(fee.amount))}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="Nome completo"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Validade</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                          setCardExpiry(val);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing || !cardNumber || !cardExpiry || !cardCvv || !cardName}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      `Pagar ${formatCurrency(Number(fee.amount))}`
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
