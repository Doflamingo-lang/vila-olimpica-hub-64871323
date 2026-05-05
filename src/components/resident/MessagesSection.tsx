import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import ChatWindow from "@/components/messaging/ChatWindow";
import { useAuth } from "@/hooks/useAuth";

const MessagesSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    setLoading(true);
    let chosen: string | null = null;

    // 1) Prefer admin from most recent conversation
    const { data: convoMsg } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, is_from_admin, created_at")
      .eq("is_from_admin", true)
      .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
      .order("created_at", { ascending: false })
      .limit(1);
    if (convoMsg && convoMsg.length > 0) {
      const m = convoMsg[0];
      chosen = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
    }

    // 2) Fallback: any admin via SECURITY DEFINER RPC (residents can't read user_roles directly)
    if (!chosen) {
      const { data: rpcId } = await supabase.rpc("get_any_admin_id");
      if (rpcId) chosen = rpcId as unknown as string;
    }

    setAdminId(chosen);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminId || !user) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-2" />
          <p>Nenhum administrador disponível no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Mensagens
        </CardTitle>
        <CardDescription>Comunicação direta com a administração do condomínio</CardDescription>
      </CardHeader>
      <CardContent>
        <ChatWindow
          currentUserId={user.id}
          peerUserId={adminId}
          peerName="Administração"
          isAdmin={false}
          height="65vh"
        />
      </CardContent>
    </Card>
  );
};

export default MessagesSection;
