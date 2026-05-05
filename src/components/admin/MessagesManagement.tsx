import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Search } from "lucide-react";
import ChatWindow from "@/components/messaging/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ResidentEntry {
  user_id: string;
  email?: string;
  nome?: string;
  bloco?: number;
  edificio?: number;
  apartamento?: number;
  lastMessageAt?: string;
  unread?: number;
}

const MessagesManagement = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<ResidentEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ResidentEntry | null>(null);

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      // Get auth users via edge function
      const { data: listData } = await supabase.functions.invoke("list-residents");
      const authUsers: { id: string; email: string }[] = listData?.residents || [];

      // Get active (approved) emails
      const { data: activeReqs } = await supabase
        .from("access_requests")
        .select("email")
        .eq("status", "approved");
      const activeEmails = new Set((activeReqs || []).map((r: any) => (r.email || "").toLowerCase()));

      // Get unidades with user_id (FFH + FPD)
      const [{ data: u1 }, { data: u2 }, { data: msgs }] = await Promise.all([
        supabase.from("unidades").select("user_id, nome, bloco, edificio, apartamento").not("user_id", "is", null),
        supabase.from("fpd_unidades").select("user_id, nome, apartamento").not("user_id", "is", null),
        supabase
          .from("messages")
          .select("sender_id, recipient_id, created_at, read_at, is_from_admin")
          .order("created_at", { ascending: false }),
      ]);

      const map = new Map<string, ResidentEntry>();
      for (const au of authUsers) {
        if (!activeEmails.has((au.email || "").toLowerCase())) continue;
        map.set(au.id, { user_id: au.id, email: au.email });
      }
      for (const r of u1 || []) {
        if (!r.user_id || !map.has(r.user_id)) continue;
        const cur = map.get(r.user_id)!;
        map.set(r.user_id, { ...cur, nome: r.nome, bloco: r.bloco, edificio: r.edificio, apartamento: r.apartamento });
      }
      for (const r of u2 || []) {
        if (!r.user_id || !map.has(r.user_id)) continue;
        const cur = map.get(r.user_id)!;
        map.set(r.user_id, { ...cur, nome: cur.nome || r.nome, apartamento: cur.apartamento || r.apartamento });
      }

      // Aggregate last message and unread
      const lastBy = new Map<string, string>();
      const unreadBy = new Map<string, number>();
      const adminId = user?.id;
      for (const m of msgs || []) {
        const peer = m.sender_id === adminId ? m.recipient_id : m.sender_id;
        if (!lastBy.has(peer)) lastBy.set(peer, m.created_at);
        if (m.recipient_id === adminId && !m.read_at) {
          unreadBy.set(peer, (unreadBy.get(peer) || 0) + 1);
        }
        if (!map.has(peer)) map.set(peer, { user_id: peer });
      }

      const list = Array.from(map.values()).map((r) => ({
        ...r,
        lastMessageAt: lastBy.get(r.user_id),
        unread: unreadBy.get(r.user_id) || 0,
      }));
      // Sort: unread first, then last message desc, then name
      list.sort((a, b) => {
        if ((b.unread || 0) !== (a.unread || 0)) return (b.unread || 0) - (a.unread || 0);
        if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
        if (a.lastMessageAt) return -1;
        if (b.lastMessageAt) return 1;
        return (a.nome || a.email || "").localeCompare(b.nome || b.email || "");
      });
      setResidents(list);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/[\s-]+/g, "");
    const q = norm(search);
    if (!q) return residents;
    return residents.filter((r) => {
      const idFmt =
        r.bloco && r.edificio && r.apartamento
          ? `${r.bloco}-${r.edificio}-${r.apartamento}`
          : r.apartamento
          ? `apt${r.apartamento}`
          : "";
      const haystack = norm(
        [r.nome, r.email, idFmt, r.bloco, r.edificio, r.apartamento].filter(Boolean).join(" ")
      );
      return haystack.includes(q);
    });
  }, [residents, search]);

  if (!session) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[70vh]">
          {/* Sidebar */}
          <div className="border-r border-border flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Procurar por nome ou ID (ex: 1-2-3)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-6">Nenhum morador encontrado.</p>
              ) : (
                filtered.map((r) => {
                  const id =
                    r.bloco && r.edificio && r.apartamento
                      ? `${r.bloco}-${r.edificio}-${r.apartamento}`
                      : r.apartamento
                      ? `Apt ${r.apartamento}`
                      : "—";
                  return (
                    <button
                      key={r.user_id}
                      onClick={() => setSelected(r)}
                      className={cn(
                        "w-full text-left px-3 py-3 border-b hover:bg-muted/50 transition-colors flex items-center justify-between gap-2",
                        selected?.user_id === r.user_id && "bg-muted"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.nome || r.email || "Morador"}</p>
                        <p className="text-xs text-muted-foreground truncate">{id} · {r.email}</p>
                      </div>
                      {(r.unread || 0) > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                          {r.unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="md:col-span-2 p-3">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>Selecione um morador para iniciar a conversa</p>
              </div>
            ) : (
              <ChatWindow
                currentUserId={user!.id}
                peerUserId={selected.user_id}
                peerName={selected.nome || selected.email || "Morador"}
                isAdmin={true}
                height="70vh"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesManagement;
