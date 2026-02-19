import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldCheck, ShieldOff, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EnrollMFA from "./EnrollMFA";

const MFASettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      const verifiedFactor = data.totp.find((f) => f.status === "verified");
      setIsEnabled(!!verifiedFactor);
      setFactorId(verifiedFactor?.id || null);
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (!factorId) return;
    setIsDisabling(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desativar o 2FA: " + error.message,
        variant: "destructive",
      });
    } else {
      setIsEnabled(false);
      setFactorId(null);
      toast({
        title: "2FA Desativado",
        description: "A verificação de dois fatores foi removida da sua conta.",
      });
    }
    setIsDisabling(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Segurança — Verificação em Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">2FA está ativo</p>
                  <p className="text-sm text-muted-foreground">
                    Sua conta está protegida com verificação em dois fatores.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={isDisabling}
                className="w-full sm:w-auto"
              >
                {isDisabling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Desativar 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-lg">
                <ShieldOff className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">2FA não está ativo</p>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos ativar para maior segurança da sua conta.
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowEnroll(true)} className="w-full sm:w-auto">
                <Shield className="w-4 h-4 mr-2" />
                Ativar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEnroll} onOpenChange={setShowEnroll}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar 2FA</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para ativar a verificação de dois fatores.
            </DialogDescription>
          </DialogHeader>
          <EnrollMFA
            onEnrolled={() => {
              setShowEnroll(false);
              checkMFAStatus();
            }}
            onCancelled={() => setShowEnroll(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MFASettings;
