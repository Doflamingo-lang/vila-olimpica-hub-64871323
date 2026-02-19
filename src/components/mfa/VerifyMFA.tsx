import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, AlertCircle } from "lucide-react";

interface VerifyMFAProps {
  onVerified: () => void;
  onCancel: () => void;
}

const VerifyMFA = ({ onVerified, onCancel }: VerifyMFAProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos");
      return;
    }
    setIsLoading(true);
    setError("");

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError(factorsError.message);
      setIsLoading(false);
      return;
    }

    const totpFactor = factors.totp.find((f) => f.status === "verified");
    if (!totpFactor) {
      setError("Nenhum fator 2FA encontrado.");
      setIsLoading(false);
      return;
    }

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    });
    if (challengeError) {
      setError(challengeError.message);
      setIsLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code,
    });
    if (verifyError) {
      setError("Código inválido. Tente novamente.");
      setCode("");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onVerified();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-elegant">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verificação em Dois Fatores</h1>
          <p className="text-muted-foreground mt-2">
            Digite o código de 6 dígitos do seu aplicativo autenticador.
          </p>
        </div>

          <div className="space-y-6">
            <div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                className="text-center text-3xl tracking-[0.5em] font-mono h-14"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <Button
              onClick={handleVerify}
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>

            <Button variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
              Cancelar e Sair
            </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMFA;
