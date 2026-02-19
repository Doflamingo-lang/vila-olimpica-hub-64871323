import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, CheckCircle, Copy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnrollMFAProps {
  onEnrolled: () => void;
  onCancelled?: () => void;
}

const EnrollMFA = ({ onEnrolled, onCancelled }: EnrollMFAProps) => {
  const [factorId, setFactorId] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    enrollFactor();
  }, []);

  const enrollFactor = async () => {
    setIsEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Vila Olímpica App",
    });
    if (error) {
      setError(error.message);
      setIsEnrolling(false);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setIsEnrolling(false);
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      setError("O código deve ter 6 dígitos");
      return;
    }
    setIsLoading(true);
    setError("");

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setError(challengeError.message);
      setIsLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });
    if (verifyError) {
      setError("Código inválido. Tente novamente.");
      setIsLoading(false);
      return;
    }

    toast({
      title: "2FA Ativado!",
      description: "A verificação de dois fatores foi configurada com sucesso.",
    });
    setIsLoading(false);
    onEnrolled();
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({ title: "Copiado!", description: "Chave secreta copiada." });
  };

  if (isEnrolling) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Configurar Verificação em Dois Fatores
        </CardTitle>
        <CardDescription>
          Use um aplicativo autenticador (Google Authenticator, Authy, etc.) para escanear o QR Code abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <img src={qrCode} alt="QR Code para 2FA" className="w-48 h-48" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Ou insira a chave manualmente:
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono break-all">
                {secret}
              </code>
              <Button variant="ghost" size="icon" onClick={copySecret}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Verify Code */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Digite o código de 6 dígitos do aplicativo:
          </label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={verifyCode}
            onChange={(e) => {
              setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            className="text-center text-2xl tracking-widest font-mono"
          />
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {onCancelled && (
            <Button variant="outline" onClick={onCancelled} className="flex-1" disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleVerify} className="flex-1" disabled={isLoading || verifyCode.length !== 6}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Ativar 2FA
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollMFA;
