
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";
import App from "./App";

export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile(currentSession) {
      if (!currentSession) {
        if (active) {
          setSession(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setSession(currentSession);
        setLoading(true);
        setError("");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, friend_code")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        setProfile(null);
        setError(
          error?.message ||
          "Kullanıcı profili bulunamadı."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("voiceUserName", data.username);
      localStorage.setItem("voiceFriendCode", data.friend_code);

      setProfile(data);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      loadProfile(data.session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      loadProfile(newSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={screenStyle}>
        VOICE yükleniyor...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!profile) {
    return (
      <div style={screenStyle}>
        <p>{error || "Profil yüklenemedi."}</p>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ padding: 12, cursor: "pointer" }}
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  return <App />;
}

const screenStyle = {
  minHeight: "100vh",
  background: "#111318",
  color: "white",
  display: "grid",
  placeItems: "center",
  fontFamily: "Arial, sans-serif"
};
