import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Paperclip, Send, Download, Check, CheckCheck, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ChatWindowProps {
  /** ID do usuário atual (logado) */
  currentUserId: string;
  /** ID do outro participante da conversa */
  peerUserId: string;
  /** Nome a exibir do outro participante */
  peerName?: string;
  /** Indica se o usuário atual é admin (define is_from_admin nas mensagens enviadas) */
  isAdmin: boolean;
  /** Altura do painel (default 70vh) */
  height?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  is_from_admin: boolean;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
}

const ChatWindow = ({ currentUserId, peerUserId, peerName, isAdmin, height = "70vh" }: ChatWindowProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!peerUserId) return;
    fetchMessages();
    const channel = supabase
      .channel(`messages-${currentUserId}-${peerUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          const m = (payload.new || payload.old) as Message;
          if (!m) return;
          const involvesPair =
            (m.sender_id === currentUserId && m.recipient_id === peerUserId) ||
            (m.sender_id === peerUserId && m.recipient_id === currentUserId);
          if (involvesPair) fetchMessages();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerUserId, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${peerUserId}),and(sender_id.eq.${peerUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages((data || []) as Message[]);
      // mark received unread as read
      const unreadIds = (data || [])
        .filter((m: Message) => m.recipient_id === currentUserId && !m.read_at)
        .map((m: Message) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
      }
    }
    setLoading(false);
  };

  const uploadAttachment = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${currentUserId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("message-attachments").upload(path, file);
      if (error) throw error;
      const { data: signed } = await supabase.storage
        .from("message-attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      return { url: signed?.signedUrl || path, name: file.name, type: file.type };
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha no upload", variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (file?: File) => {
    if (!text.trim() && !file) return;
    setSending(true);
    let attachment: { url: string; name: string; type: string } | null = null;
    if (file) {
      attachment = await uploadAttachment(file);
      if (!attachment) {
        setSending(false);
        return;
      }
    }
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      recipient_id: peerUserId,
      is_from_admin: isAdmin,
      content: text.trim() || null,
      attachment_url: attachment?.url || null,
      attachment_name: attachment?.name || null,
      attachment_type: attachment?.type || null,
    });
    setSending(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMessages();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleSend(file);
  };

  return (
    <div className="flex flex-col border rounded-lg bg-card overflow-hidden" style={{ height }}>
      <div className="px-4 py-3 border-b bg-muted/30">
        <p className="font-semibold text-foreground">{peerName || "Conversa"}</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda. Envie a primeira!</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                  {m.attachment_url && (
                    <a
                      href={m.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mt-1 flex items-center gap-2 underline text-xs",
                        mine ? "text-primary-foreground/90" : "text-primary"
                      )}
                    >
                      {m.attachment_type?.startsWith("image/") ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span className="truncate max-w-[200px]">{m.attachment_name || "Anexo"}</span>
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                  {m.attachment_url && m.attachment_type?.startsWith("image/") && (
                    <img src={m.attachment_url} alt={m.attachment_name || ""} className="mt-2 rounded max-h-48" />
                  )}
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 text-[10px]",
                      mine ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                    )}
                  >
                    <span>{format(new Date(m.created_at), "dd/MM HH:mm")}</span>
                    {mine && (m.read_at ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t bg-background">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            title="Anexar recibo ou imagem"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </Button>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={() => handleSend()} disabled={sending || (!text.trim())} size="icon">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
