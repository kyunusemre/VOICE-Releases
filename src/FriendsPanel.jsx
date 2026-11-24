
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Users,
  Check,
  X,
  Copy,
  RefreshCw
} from "lucide-react";
import { supabase } from "./lib/supabase";

export default function FriendsPanel() {
  const [userId, setUserId] = useState(null);
  const [myCode, setMyCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Oturum bulunamadı. Tekrar giriş yap.");

      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("friend_code")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setMyCode(profile?.friend_code || "");

      const { data: friendshipRows, error: friendshipError } =
        await supabase
          .from("friendships")
          .select("user_one,user_two")
          .or(`user_one.eq.${user.id},user_two.eq.${user.id}`);

      if (friendshipError) throw friendshipError;

      const friendIds = (friendshipRows || []).map(row =>
        row.user_one === user.id ? row.user_two : row.user_one
      );

      if (friendIds.length) {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id,username,friend_code")
          .in("id", friendIds);

        if (error) throw error;
        setFriends(profiles || []);
      } else {
        setFriends([]);
      }

      const { data: incoming, error: incomingError } =
        await supabase
          .from("friend_requests")
          .select("id,sender_id,created_at")
          .eq("receiver_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

      if (incomingError) throw incomingError;

      if (incoming?.length) {
        const senderIds = incoming.map(item => item.sender_id);

        const { data: senders, error } = await supabase
          .from("profiles")
          .select("id,username,friend_code")
          .in("id", senderIds);

        if (error) throw error;

        setRequests(incoming.map(request => ({
          ...request,
          profile: senders.find(p => p.id === request.sender_id)
        })));
      } else {
        setRequests([]);
      }

      const { data: sent, error: sentError } = await supabase
        .from("friend_requests")
        .select("id,receiver_id,created_at")
        .eq("sender_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (sentError) throw sentError;

      if (sent?.length) {
        const receiverIds = sent.map(item => item.receiver_id);

        const { data: receivers, error } = await supabase
          .from("profiles")
          .select("id,username,friend_code")
          .in("id", receiverIds);

        if (error) throw error;

        setOutgoing(sent.map(request => ({
          ...request,
          profile: receivers.find(p => p.id === request.receiver_id)
        })));
      } else {
        setOutgoing([]);
      }
    } catch (error) {
      console.error("Arkadaş listesi:", error);
      setMessage(error.message || "Arkadaşlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  async function searchFriend(event) {
    event.preventDefault();
    setMessage("");
    setSearchResult(null);

    const code = searchCode.trim().toUpperCase();

    if (!code) {
      setMessage("Arkadaş kodunu yazmalısın.");
      return;
    }

    setBusy(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,friend_code")
        .eq("friend_code", code)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setMessage("Bu arkadaş koduyla kullanıcı bulunamadı.");
      } else if (data.id === userId) {
        setMessage("Kendini arkadaş olarak ekleyemezsin.");
      } else if (friends.some(friend => friend.id === data.id)) {
        setMessage("Bu kullanıcı zaten arkadaş listende.");
      } else {
        setSearchResult(data);
      }
    } catch (error) {
      setMessage(error.message || "Arama başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function sendRequest() {
    if (!searchResult || !userId) return;

    setBusy(true);
    setMessage("");

    try {
      const targetId = searchResult.id;

      const { data: existing, error: existingError } = await supabase
        .from("friend_requests")
        .select("id,sender_id,receiver_id,status")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`
        );

      if (existingError) throw existingError;

      if (existing?.some(item => item.status === "pending")) {
        throw new Error("Bu kullanıcıyla zaten bekleyen bir istek var.");
      }

      const { error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: userId,
          receiver_id: targetId,
          status: "pending"
        });

      if (error) throw error;

      setMessage("Arkadaşlık isteği gönderildi!");
      setSearchResult(null);
      setSearchCode("");
      await loadFriends();
    } catch (error) {
      setMessage(error.message || "İstek gönderilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function acceptRequest(requestId) {
    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc(
        "accept_friend_request",
        { request_id: requestId }
      );

      if (error) throw error;

      setMessage("Arkadaşlık isteği kabul edildi.");
      await loadFriends();
    } catch (error) {
      setMessage(error.message || "İstek kabul edilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function rejectRequest(requestId) {
    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId)
        .eq("receiver_id", userId);

      if (error) throw error;

      setMessage("Arkadaşlık isteği reddedildi.");
      await loadFriends();
    } catch (error) {
      setMessage(error.message || "İstek reddedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(myCode);
      setMessage("Arkadaş kodun kopyalandı!");
    } catch {
      setMessage("Kod kopyalanamadı: " + myCode);
    }
  }

  const styles = {
    page: {
      width: "100%",
      height: "100%",
      overflowY: "auto",
      padding: 28,
      boxSizing: "border-box",
      color: "#f1f2f7"
    },
    heading: {
      fontSize: 25,
      fontWeight: 800,
      margin: "0 0 6px"
    },
    muted: {
      color: "#9298a7",
      fontSize: 13
    },
    card: {
      background: "#1b1e26",
      border: "1px solid #303440",
      borderRadius: 13,
      padding: 18,
      marginTop: 20
    },
    input: {
      flex: 1,
      minWidth: 0,
      height: 42,
      padding: "0 12px",
      color: "white",
      background: "#11141b",
      border: "1px solid #383d4b",
      borderRadius: 8,
      outline: "none"
    },
    button: {
      height: 42,
      padding: "0 15px",
      border: 0,
      borderRadius: 8,
      background: "#7657e8",
      color: "white",
      cursor: "pointer",
      fontWeight: 700
    },
    person: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid #303440"
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: "#7657e8",
      display: "grid",
      placeItems: "center",
      fontWeight: 800,
      flexShrink: 0
    }
  };

  function Person({ profile, children }) {
    if (!profile) return null;

    return (
      <div style={styles.person}>
        <div style={styles.avatar}>
          {profile.username?.charAt(0).toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{profile.username}</strong>
          <div style={styles.muted}>{profile.friend_code}</div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}>
        <div>
          <h1 style={styles.heading}>Arkadaşlar</h1>
          <div style={styles.muted}>
            Arkadaşlarını bul ve VOICE üzerinde bağlantıda kal.
          </div>
        </div>

        <button
          style={{ ...styles.button, display: "flex", alignItems: "center", gap: 7 }}
          onClick={loadFriends}
          disabled={loading || busy}
          title="Yenile"
        >
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      <div style={styles.card}>
        <strong>Senin arkadaş kodun</strong>
        <p style={styles.muted}>
          Arkadaşların seni bu kodla bulabilir.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            flex: 1,
            background: "#11141b",
            border: "1px solid #383d4b",
            padding: 12,
            borderRadius: 8,
            fontWeight: 800,
            letterSpacing: 2
          }}>
            {myCode || "Yükleniyor..."}
          </div>

          <button
            style={{ ...styles.button, display: "flex", alignItems: "center", gap: 7 }}
            onClick={copyCode}
            disabled={!myCode}
          >
            <Copy size={16} />
            Kopyala
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <strong>
          <UserPlus size={17} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Arkadaş ekle
        </strong>

        <p style={styles.muted}>
          Eklemek istediğin kişinin arkadaş kodunu gir.
        </p>

        <form
          onSubmit={searchFriend}
          style={{ display: "flex", gap: 9 }}
        >
          <input
            style={styles.input}
            value={searchCode}
            onChange={event => setSearchCode(event.target.value.toUpperCase())}
            placeholder="Örn: MITO4821"
            maxLength={20}
          />
          <button style={styles.button} disabled={busy}>
            <Search size={16} style={{ verticalAlign: "middle", marginRight: 5 }} />
            Bul
          </button>
        </form>

        {searchResult && (
          <Person profile={searchResult}>
            <button
              style={styles.button}
              onClick={sendRequest}
              disabled={busy}
            >
              <UserPlus size={15} style={{ verticalAlign: "middle", marginRight: 5 }} />
              Ekle
            </button>
          </Person>
        )}
      </div>

      {message && (
        <div style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 8,
          background: "#292d38",
          color: "#d8d0ff",
          fontSize: 13
        }}>
          {message}
        </div>
      )}

      <div style={styles.card}>
        <strong>
          <Users size={17} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Gelen istekler ({requests.length})
        </strong>

        {requests.length === 0 ? (
          <p style={styles.muted}>Bekleyen arkadaşlık isteğin yok.</p>
        ) : (
          requests.map(request => (
            <Person key={request.id} profile={request.profile}>
              <button
                style={{ ...styles.button, background: "#23865b", padding: "0 11px" }}
                onClick={() => acceptRequest(request.id)}
                disabled={busy}
                title="Kabul et"
              >
                <Check size={17} />
              </button>
              <button
                style={{ ...styles.button, background: "#a33e4b", padding: "0 11px" }}
                onClick={() => rejectRequest(request.id)}
                disabled={busy}
                title="Reddet"
              >
                <X size={17} />
              </button>
            </Person>
          ))
        )}
      </div>

      <div style={styles.card}>
        <strong>Arkadaşlarım ({friends.length})</strong>

        {loading ? (
          <p style={styles.muted}>Yükleniyor...</p>
        ) : friends.length === 0 ? (
          <p style={styles.muted}>
            Henüz arkadaşın yok. Arkadaş koduyla birini ekleyebilirsin.
          </p>
        ) : (
          friends.map(friend => (
            <Person key={friend.id} profile={friend}>
              <span style={{ color: "#9298a7", fontSize: 12 }}>
                Arkadaş
              </span>
            </Person>
          ))
        )}
      </div>

      {outgoing.length > 0 && (
        <div style={styles.card}>
          <strong>Gönderilen istekler ({outgoing.length})</strong>
          {outgoing.map(request => (
            <Person key={request.id} profile={request.profile}>
              <span style={{ color: "#e5b95c", fontSize: 12 }}>
                Bekliyor
              </span>
            </Person>
          ))}
        </div>
      )}
    </div>
  );
}
