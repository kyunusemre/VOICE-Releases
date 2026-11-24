
import { useState } from "react";
import { supabase } from "./lib/supabase";
import { Radio, UserPlus, LogIn } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanCode = friendCode.trim().toUpperCase();

    if (!cleanEmail || !password) {
      setMessage("E-posta ve şifre gerekli.");
      return;
    }

    if (password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (mode === "register") {
      if (cleanUsername.length < 1 || cleanUsername.length > 32) {
        setMessage("Kullanıcı adı 1-32 karakter olmalı.");
        return;
      }

      if (!/^[A-Z0-9_-]{3,20}$/.test(cleanCode)) {
        setMessage(
          "Arkadaş kodu 3-20 karakter olmalı. Harf, rakam, tire ve alt çizgi kullan."
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              friend_code: cleanCode
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          setMessage("Hesabın oluşturuldu!");
        } else {
          setMessage(
            "Kayıt başarılı! E-posta adresine gelen doğrulama bağlantısına tıkla."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Hesap işlemi:", error);
      setMessage(error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.logo}>
          <Radio size={30} />
        </div>

        <h1 style={styles.title}>VOICE</h1>
        <p style={styles.subtitle}>
          {mode === "login"
            ? "Hesabına giriş yap"
            : "Yeni bir hesap oluştur"}
        </p>

        {mode === "register" && (
          <>
            <label style={styles.label}>Kullanıcı adı</label>
            <input
              style={styles.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Kullanıcı adın"
              maxLength={32}
              required
            />

            <label style={styles.label}>Arkadaş kodun</label>
            <input
              style={styles.input}
              value={friendCode}
              onChange={e =>
                setFriendCode(e.target.value.toUpperCase())
              }
              placeholder="Örn: MITO4821"
              maxLength={20}
              required
            />
          </>
        )}

        <label style={styles.label}>E-posta</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          required
        />

        <label style={styles.label}>Şifre</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="En az 6 karakter"
          minLength={6}
          required
        />

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <button
          style={styles.submit}
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Lütfen bekle..."
            : mode === "login"
              ? "Giriş Yap"
              : "Hesap Oluştur"}
        </button>

        <button
          type="button"
          style={styles.switch}
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setMessage("");
          }}
        >
          {mode === "login"
            ? "Hesabın yok mu? Kayıt ol"
            : "Zaten hesabın var mı? Giriş yap"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111318",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    color: "#fff",
    fontFamily: "Inter, Arial, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: 390,
    padding: 30,
    background: "#1b1e26",
    border: "1px solid #303440",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box"
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: "#7657e8",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 15px"
  },
  title: {
    textAlign: "center",
    letterSpacing: 4,
    margin: 0,
    fontSize: 28
  },
  subtitle: {
    textAlign: "center",
    color: "#9298a7",
    margin: "8px 0 25px"
  },
  label: {
    color: "#c3c7d1",
    fontSize: 12,
    marginBottom: 7,
    marginTop: 13
  },
  input: {
    height: 43,
    borderRadius: 8,
    border: "1px solid #383d4b",
    background: "#13151b",
    color: "white",
    padding: "0 12px",
    outline: "none",
    fontSize: 13
  },
  submit: {
    height: 44,
    border: 0,
    borderRadius: 8,
    background: "#7657e8",
    color: "white",
    fontWeight: 700,
    marginTop: 22,
    cursor: "pointer"
  },
  switch: {
    border: 0,
    background: "transparent",
    color: "#a995ff",
    marginTop: 18,
    cursor: "pointer"
  },
  message: {
    background: "#292d38",
    color: "#d8d0ff",
    padding: 11,
    borderRadius: 8,
    marginTop: 15,
    fontSize: 12,
    lineHeight: 1.5
  }
};
