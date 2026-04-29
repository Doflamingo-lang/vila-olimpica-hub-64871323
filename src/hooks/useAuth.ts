import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin role after auth state change
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately
      setSession(null);
      setUser(null);
      setIsAdmin(false);

      // Sign out from Supabase (global scope = invalidate all sessions)
      await supabase.auth.signOut({ scope: "global" });
    } catch (error) {
      console.error("Error during signOut:", error);
    } finally {
      // Force-clear any persisted Supabase auth tokens from storage
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("sb-") || k.includes("supabase.auth"))
          .forEach((k) => localStorage.removeItem(k));
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith("sb-") || k.includes("supabase.auth"))
          .forEach((k) => sessionStorage.removeItem(k));
      } catch (e) {
        console.warn("Storage cleanup failed:", e);
      }
      // Hard reload to /auth to guarantee a fresh, unauthenticated app state
      window.location.replace("/auth");
    }
  };

  return {
    user,
    session,
    isAdmin,
    isLoading,
    signOut,
  };
};
