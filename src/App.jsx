import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { Room, RoomEvent } from "livekit-client";
import {
  CalendarDays, Headphones, Mic, MicOff, Settings, Plus, ChevronDown,
  Volume2, Users, Radio, Wifi, LogOut, Shield, Search,
  UserPlus, Check, X, Copy, RefreshCw, Send, Paperclip,
  FileText, Image as ImageIcon, Download, MessageCircle,
  Hash, UserCircle, Palette, Bell, Lock, Keyboard, SlidersHorizontal,
  AudioWaveform, ImagePlus, Sun, Moon, Trash2, MonitorUp, MonitorOff, Phone, PhoneOff, Pin
} from "lucide-react";

import { supabase } from "./lib/supabase";
import "./App.css";

function getSavedUserName() {
  try {
    return localStorage.getItem("voiceUserName") || "Mito";
  } catch {
    return "Mito";
  }
}

function getSavedMicMode() {
  try {
    return localStorage.getItem("voiceMicMode") || "voice";
  } catch {
    return "voice";
  }
}

function getSavedPttKey() {
  try {
    return localStorage.getItem("voicePttKey") || "V";
  } catch {
    return "V";
  }
}

function FriendPerson({ profile, children }) {
  if (!profile) return null;

  return (
    <div className="friend-person">
      <div className="friend-avatar">
        {profile.username?.charAt(0).toUpperCase() || "?"}
      </div>
      <div className="friend-person-info">
        <strong>{profile.username || "Kullanıcı"}</strong>
        <span>{profile.friend_code || ""}</span>
      </div>
      {children}
    </div>
  );
}

const STORE_PACKS = [
  {id:"aurora",name:"Aurora Işıltısı",icon:"🌌",tone:"aurora",desc:"Kutup ışıkları temalı avatar çerçevesi ve parıltı rozeti."},
  {id:"dragon",name:"Ejderha Ateşi",icon:"🐉",tone:"dragon",desc:"Alevli ejderha halkası ve kızıl profil parıltısı."},
  {id:"cyber",name:"Siber Neon",icon:"🤖",tone:"cyber",desc:"Neon devre çerçevesi ve siber profil efekti."},
  {id:"galaxy",name:"Galaksi Gezgini",icon:"🪐",tone:"galaxy",desc:"Yıldızlı uzay halkası ve gezegen rozeti."},
  {id:"royal",name:"Kraliyet Tacı",icon:"👑",tone:"royal",desc:"Altın taçlı avatar çerçevesi ve asil parıltı."},
  {id:"frost",name:"Buz Kristali",icon:"❄️",tone:"frost",desc:"Buz kristali halkası ve soğuk mavi efekt."},
  {id:"toxic",name:"Zehirli Yeşil",icon:"☢️",tone:"toxic",desc:"Asit yeşili çerçeve ve toksik işaret."},
  {id:"ocean",name:"Derin Okyanus",icon:"🌊",tone:"ocean",desc:"Dalga desenli çerçeve ve deniz kabuğu rozeti."},
  {id:"sakura",name:"Sakura Baharı",icon:"🌸",tone:"sakura",desc:"Pembe çiçek halkası ve sakura parçacıkları."},
  {id:"shadow",name:"Gölge Avcısı",icon:"🦇",tone:"shadow",desc:"Karanlık mor çerçeve ve yarasa rozeti."},
  {id:"sun",name:"Güneş Patlaması",icon:"☀️",tone:"sun",desc:"Altın güneş halkası ve sıcak ışık efekti."},
  {id:"pixel",name:"Piksel Dünyası",icon:"👾",tone:"pixel",desc:"Retro piksel çerçeve ve oyun rozeti."},
  {id:"emerald",name:"Zümrüt Muhafızı",icon:"💎",tone:"emerald",desc:"Zümrüt taşlı avatar çerçevesi."},
  {id:"vampire",name:"Gece Kontu",icon:"🧛",tone:"vampire",desc:"Bordo gotik halka ve gece rozeti."},
  {id:"rainbow",name:"Gökkuşağı",icon:"🌈",tone:"rainbow",desc:"Renk geçişli hareketli görünümlü halka."},
  {id:"storm",name:"Fırtına",icon:"⚡",tone:"storm",desc:"Elektrik desenli çerçeve ve yıldırım rozeti."},
  {id:"desert",name:"Çöl Kaşifi",icon:"🏜️",tone:"desert",desc:"Kum rengi halka ve keşif rozeti."},
  {id:"holo",name:"Hologram",icon:"🔮",tone:"holo",desc:"Holografik mor-mavi avatar çerçevesi."},
  {id:"samurai",name:"Samuray Ruhu",icon:"⚔️",tone:"samurai",desc:"Kırmızı-siyah savaşçı halkası."},
  {id:"comet",name:"Kuyruklu Yıldız",icon:"☄️",tone:"comet",desc:"Kuyruklu yıldız izi ve kozmik çerçeve."}
];

function StorePage() {
  const [owned, setOwned] = useState(() => { try { return JSON.parse(localStorage.getItem("voiceStoreOwned") || "[]"); } catch { return []; } });
  const [balance, setBalance] = useState(() => { const v = Number(localStorage.getItem("voiceStoreCredits")); return Number.isFinite(v) && v >= 0 ? v : 2000; });
  const [equipped, setEquipped] = useState(() => localStorage.getItem("voiceStoreEquipped") || "");
  const [notice, setNotice] = useState("");
  const buy = item => {
    if (owned.includes(item.id)) { setNotice("Bu paket zaten kütüphanende."); return; }
    if (balance < 100) { setNotice("Yetersiz bakiye. Her paket 100 kredi."); return; }
    const next = [...owned, item.id]; const amount = balance - 100;
    setOwned(next); setBalance(amount);
    localStorage.setItem("voiceStoreOwned", JSON.stringify(next));
    localStorage.setItem("voiceStoreCredits", String(amount));
    setNotice(`${item.name} paketi satın alındı.`);
  };
  const equip = item => {
    if (!owned.includes(item.id)) return;
    setEquipped(item.id); localStorage.setItem("voiceStoreEquipped", item.id);
    localStorage.setItem("voiceProfileDecoration", item.id);
    setNotice(`${item.name} profil dekorasyonun olarak takıldı.`);
  };
  return <div className="voice-store-page">
    <div className="voice-store-heading"><div><span className="voice-store-eyebrow">VOICE KOZMETİK MAĞAZASI</span><h1>Tarzını ortaya koy.</h1><p>Avatar çerçeveleri ve profil dekorasyon paketleri.</p></div><div className="voice-store-wallet"><span>◈</span><strong>{balance.toLocaleString("tr-TR")}</strong><small>Kredi</small></div></div>
    <div className="voice-store-banner"><div><span>20 ÖZEL PAKET</span><h2>Profiline kendi imzanı bırak</h2><p>Her paket birbirinden farklı avatar dekorasyonu ve profil rozeti içerir.</p></div><div className="voice-store-banner-art">✦　◉　✧</div></div>
    <div className="voice-store-toolbar"><div><h2>Avatar dekorasyon paketleri</h2><p>Her biri yalnızca <b>100 kredi</b></p></div><span>{owned.length}/20 satın alındı</span></div>
    {notice && <div className="voice-store-notice" role="status">{notice}</div>}
    <div className="voice-store-grid">{STORE_PACKS.map(item => <article className={`voice-store-card tone-${item.tone}`} key={item.id}>
      <div className="voice-store-preview"><div className={`voice-store-ring ring-${item.tone}`}><span>{item.icon}</span></div><span className="voice-store-preview-label">ÖNİZLEME</span></div>
      <div className="voice-store-card-copy"><div className="voice-store-card-title"><h3>{item.name}</h3><span>100 kredi</span></div><p>{item.desc}</p>
      {owned.includes(item.id) ? <button className={equipped === item.id ? "equipped" : "owned"} onClick={() => equip(item)}>{equipped === item.id ? "✓ Kullanımda" : "Dekorasyonu Tak"}</button> : <button className="buy" onClick={() => buy(item)}>100 ◈　Satın Al</button>}
      </div></article>)}</div>
    <p className="voice-store-footnote">Satın alınan paketler bu cihazdaki VOICE profiline kaydedilir. Kredi bakiyesi ve koleksiyon yerel olarak saklanır.</p>
  </div>;
}

function NitroPlansPage() {
  const [cycle, setCycle] = useState("monthly");
  const [notice, setNotice] = useState("");
  const price = cycle === "monthly" ? "99,99" : "999,90";
  const period = cycle === "monthly" ? "ay" : "yıl";
  return <section className="nitro-plans-page">
    <div className="nitro-plans-intro"><span className="nitro-plan-eyebrow">VOICE PREMIUM ÜYELİĞİ</span><h1>VOICE Nitro ile sınırları kaldır.</h1><p>Profilini kişiselleştir, ses deneyimini geliştir ve Nitro topluluğuna katıl.</p></div>
    <div className="nitro-cycle-switch" role="group" aria-label="Abonelik dönemi">
      <button className={cycle === "monthly" ? "selected" : ""} onClick={() => {setCycle("monthly");setNotice("");}}>Aylık</button>
      <button className={cycle === "yearly" ? "selected" : ""} onClick={() => {setCycle("yearly");setNotice("");}}>Yıllık <span>2 ay avantajlı</span></button>
    </div>
    <article className="nitro-plan-card">
      <div className="nitro-plan-card-head"><div><span className="nitro-plan-diamond">◆</span><h2>VOICE NITRO</h2><p>Tüm ayrıcalıklar tek üyelikte.</p></div><span className="nitro-plan-badge">PREMIUM</span></div>
      <div className="nitro-plan-price"><strong>₺{price}</strong><span> / {period}</span></div>
      <p className="nitro-plan-note">{cycle === "monthly" ? "Aylık yenilenir. İstediğin zaman iptal edebilirsin." : "Yıllık ödeme. Aylık plana göre 2 ay avantajlı."}</p>
      <button className="nitro-plan-buy" onClick={() => setNotice("Nitro planı seçildi. Gerçek ödeme ve abonelik aktivasyonu için ödeme sağlayıcısı entegrasyonu gerekiyor; henüz ücret alınmadı ve üyelik başlatılmadı.")}>Nitro'yu seç</button>
      {notice && <div className="nitro-checkout-notice" role="status">{notice}</div>}
      <div className="nitro-plan-includes"><h3>Nitro ayrıcalıkları</h3><div className="nitro-perk-grid">
        <div><b>✦ Profilini özelleştir</b><span>Hareketli avatar çerçeveleri, banner ve özel profil efektleri.</span></div>
        <div><b>☺ Özel emoji ve GIF</b><span>Kişisel emoji yükleme ve Nitro ifadeleri.</span></div>
        <div><b>♫ Gelişmiş ses</b><span>Desteklenen sunucularda yüksek kaliteli ses ve mikrofon efektleri.</span></div>
        <div><b>◈ Nitro temaları</b><span>Özel renk paletleri, tema ve mesaj görünümleri.</span></div>
        <div><b>◆ VIP rozeti</b><span>Profilinde ve arkadaş listende Nitro rozeti.</span></div>
        <div><b>♛ Özel mağaza</b><span>Nitro üyelerine özel dekorasyon ve koleksiyon ürünleri.</span></div>
      </div></div>
      <p className="nitro-plan-footnote">Fiyatlar taslak fiyatlardır. Satın alma ve otomatik yenileme, ödeme altyapısı bağlandıktan sonra etkinleştirilecektir.</p>
    </article>
    <div className="nitro-free-note"><strong>Nitro olmadan da VOICE senin.</strong><span>Temel sohbet ve sesli görüşme özellikleri tüm kullanıcılara açık kalır.</span></div>
  </section>;
}

function App() {
 
  const [servers, setServers] = useState([]);
  const [server, setServer] = useState(null);
  const [groups, setGroups] = useState([]);
  const [channelId, setChannelId] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [serverBusy, setServerBusy] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [screenShareError, setScreenShareError] = useState("");
  const [screenShareTracks, setScreenShareTracks] = useState([]);

  const [channelModal, setChannelModal] = useState(false);
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
  const [activeServerSettingsTab, setActiveServerSettingsTab] = useState("general");
  const [serverNameDraft, setServerNameDraft] = useState("");
  const [serverIconDraft, setServerIconDraft] = useState("🎮");
  const [serverSettingsMessage, setServerSettingsMessage] = useState("");
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false);
  const [channelSettingsItem, setChannelSettingsItem] = useState(null);
  const [channelSettingsDraft, setChannelSettingsDraft] = useState({ name: "", topic: "", slowmode: "0", visibility: "default", hideInactive: "3" });
  const [channelSettingsMessage, setChannelSettingsMessage] = useState("");
  const [channelNameInput, setChannelNameInput] = useState("");
  const [channelTypeInput, setChannelTypeInput] = useState("voice");
  const [channelModalMessage, setChannelModalMessage] = useState("");

  const [serverModal, setServerModal] = useState("");
  const [serverModalInput, setServerModalInput] = useState("");
  const [serverModalMessage, setServerModalMessage] = useState("");
  const [serverModalSuccess, setServerModalSuccess] = useState(false);

  const [userName, setUserName] = useState(getSavedUserName);
  const [nameInput, setNameInput] = useState(getSavedUserName);

  const [muted, setMuted] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [micError, setMicError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("account");

  // Kapsamlı ayarlar: tercihlerin tamamı bu cihazda saklanır.
  const readSetting = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch { return fallback; }
  };
  const [profileAvatar, setProfileAvatar] = useState(() => localStorage.getItem("voiceProfileAvatar") || "");
  const [noiseSettings, setNoiseSettings] = useState(() => readSetting("voiceNoiseSettings", {
    enabled: true, echoCancellation: true, autoGainControl: true
  }));
  const [notificationSettings, setNotificationSettings] = useState(() => readSetting("voiceNotificationSettings", {
    desktop: true, messages: true, friendRequests: true, sounds: true
  }));
  const [appearance, setAppearance] = useState(() => localStorage.getItem("voiceAppearance") || "dark");
  const [privacySettings, setPrivacySettings] = useState(() => readSetting("voicePrivacySettings", {
    showOnline: true, showActivity: true
  }));
  const [shortcutSettings, setShortcutSettings] = useState(() => readSetting("voiceShortcutSettings", {
    mute: "M", deafen: "D", settings: "O"
  }));
  const [settingsNotice, setSettingsNotice] = useState("");

  // Ses aygıtı tercihleri
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState(
    () => localStorage.getItem("voiceAudioInput") || ""
  );
  const [selectedOutput, setSelectedOutput] = useState(
    () => localStorage.getItem("voiceAudioOutput") || ""
  );
  const [deviceError, setDeviceError] = useState("");

  // Bas-konuş ayarları
  const [micMode, setMicMode] = useState(getSavedMicMode);
  const [pttKey, setPttKey] = useState(getSavedPttKey);
  const [capturingPttKey, setCapturingPttKey] = useState(false);

  const pttPressedRef = useRef(false);
  const pttOperationRef = useRef(Promise.resolve());
  // Global klavye aboneliği tek sefer kurulur; React renderlarında keyup dinleyicisi
  // sökülüp takılmadığı için basılı tuşun bırakma olayı kaybolmaz.
  const pttRuntimeRef = useRef({});
  pttRuntimeRef.current = { micMode, connected, room, deafened, noiseSettings, selectedInput };

  const [showFriends, setShowFriends] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [taskProgress, setTaskProgress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("voiceTaskProgress") || "{}");
      const today = new Date().toISOString().slice(0, 10);
      return saved.date === today ? saved : { date: today, messages: 0, voiceJoins: 0, claimed: [] };
    } catch { return { date: new Date().toISOString().slice(0, 10), messages: 0, voiceJoins: 0, claimed: [] }; }
  });
  const taskDefinitions = [
    { id: "first-message", title: "İlk mesajını gönder", description: "Bir metin kanalında mesaj paylaş.", target: 1, key: "messages", badge: "💬", badgeName: "Sohbet Başlatıcısı" },
    { id: "chat-five", title: "Sohbeti canlandır", description: "Toplam 5 mesaj gönder.", target: 5, key: "messages", badge: "🔥", badgeName: "Aktif Sohbetçi" },
    { id: "voice-first", title: "Ses kanalına katıl", description: "Bir ses kanalına bağlan.", target: 1, key: "voiceJoins", badge: "🎧", badgeName: "Ses Yolcusu" },
    { id: "voice-three", title: "Sesli sohbete devam et", description: "3 kez ses kanalına bağlan.", target: 3, key: "voiceJoins", badge: "🎙️", badgeName: "Ses Ustası" }
  ];
  function updateTaskProgress(key) {
    setTaskProgress(previous => {
      const today = new Date().toISOString().slice(0, 10);
      const base = previous.date === today ? previous : { date: today, messages: 0, voiceJoins: 0, claimed: [] };
      const next = { ...base, [key]: (base[key] || 0) + 1 };
      localStorage.setItem("voiceTaskProgress", JSON.stringify(next));
      return next;
    });
  }
  function claimTaskBadge(task) {
    setTaskProgress(previous => {
      const today = new Date().toISOString().slice(0, 10);
      const base = previous.date === today ? previous : { date: today, messages: 0, voiceJoins: 0, claimed: [] };
      if ((base[task.key] || 0) < task.target || base.claimed.includes(task.id)) return base;
      const next = { ...base, claimed: [...base.claimed, task.id] };
      localStorage.setItem("voiceTaskProgress", JSON.stringify(next));
      const earned = JSON.parse(localStorage.getItem("voiceEarnedBadges") || "[]");
      if (!earned.some(item => item.id === task.id)) localStorage.setItem("voiceEarnedBadges", JSON.stringify([...earned, { id: task.id, name: task.badgeName, icon: task.badge, earnedAt: new Date().toISOString() }]));
      return next;
    });
  }
  const [selectedDMFriend, setSelectedDMFriend] = useState(null);
  const [myCode, setMyCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsBusy, setFriendsBusy] = useState(false);
  const [friendsMessage, setFriendsMessage] = useState("");
  const [userId, setUserId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const audioContainerRef = useRef(null);
  const audioElementsRef = useRef(new Set());
  const screenShareContainerRef = useRef(null);
  const screenShareElementsRef = useRef(new Map());
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const allChannels = groups.flatMap(group => group.channels);
  const channel = allChannels.find(item => item.id === channelId) || null;

  function disconnectRoom() {
    pttPressedRef.current = false;
    window.voiceAPI?.resetPushToTalk();
    window.voiceAPI?.setPushToTalkEnabled(false);

    if (room) {
      room.disconnect();
      setRoom(null);
    }

    setConnected(false);
    setMuted(true);
    setParticipants([]);
    setScreenShareEnabled(false);
    setScreenShareTracks([]);
  }

  // Oturum kontrolü
  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;
        if (error) throw error;

        if (data.session?.user) {
          setUserId(data.session.user.id);
        } else {
          setUserId(null);
          setChatError("Supabase oturumu bulunamadı. Tekrar giriş yapmalısın.");
        }
      } catch (error) {
        console.error("Oturum kontrol hatası:", error);
        if (active) {
          setChatError("Oturum kontrolü başarısız: " + error.message);
        }
      }
    }

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user?.id || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Ses oynatma alanı
  useEffect(() => {
    const host = document.createElement("div");
    host.id = "voice-audio-host";
    host.style.display = "none";

    document.body.appendChild(host);
    audioContainerRef.current = host;

    return () => {
      audioElementsRef.current.forEach(element => {
        try {
          element.pause();
          element.srcObject = null;
          element.remove();
        } catch (error) {
          console.warn("Ses elementi temizleme hatası:", error);
        }
      });

      audioElementsRef.current.clear();
      host.remove();
      audioContainerRef.current = null;
    };
  }, []);

  // Sunucuları yükle
  const loadServers = useCallback(async (
    preferredId = null,
    currentUserId = userId
  ) => {
    if (!currentUserId) {
      setServers([]);
      setServer(null);
      setGroups([]);
      setChannelId(null);
      setServerLoading(false);
      return;
    }

    setServerLoading(true);

    try {
      const { data, error } = await supabase
        .from("servers")
        .select("id,name,icon,invite_code,created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const list = data || [];
      setServers(list);

      if (list.length === 0) {
        setServer(null);
        setGroups([]);
        setChannelId(null);
        return;
      }

      const selected =
        list.find(item => item.id === preferredId) ||
        list.find(item => item.id === server?.id) ||
        list[0];

      setServer(selected);
    } catch (error) {
      console.error("Sunucular yüklenemedi:", error);
      setChatError("Sunucular yüklenemedi: " + error.message);
    } finally {
      setServerLoading(false);
    }
  }, [userId, server?.id]);

  useEffect(() => {
    if (userId) {
      loadServers();
    } else {
      setServerLoading(false);
    }
  }, [userId, loadServers]);

  // Kanalları yükle
  const loadChannels = useCallback(async () => {
    if (!server?.id) {
      setGroups([]);
      setChannelId(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("server_channels")
        .select("id,server_id,name,type,category,room,created_at")
        .eq("server_id", server.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const rows = (data || []).map(item => ({
        ...item,
        room:
          item.room ||
          `${item.type === "voice" ? "voice" : "text"}-${item.id}`
      }));

      const categoryNames = [...new Set(
        rows.map(item => item.category || "GENEL")
      )];

      const nextGroups = categoryNames.map(name => ({
        name,
        channels: rows.filter(
          item => (item.category || "GENEL") === name
        )
      }));

      setGroups(nextGroups);

      setChannelId(previous => {
        const exists = rows.some(item => item.id === previous);
        return exists ? previous : rows[0]?.id || null;
      });
    } catch (error) {
      console.error("Kanallar yüklenemedi:", error);
      setChatError("Kanallar yüklenemedi: " + error.message);
    }
  }, [server?.id]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // Kullanıcı oturumunu doğrula
  async function getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    const currentUser = data.session?.user;

    if (!currentUser) {
      setUserId(null);
      throw new Error("Oturum bulunamadı. Tekrar giriş yapmalısın.");
    }

    setUserId(currentUser.id);
    return currentUser;
  }

  // Hesaptan çıkış yap
  async function handleSignOut() {
    try {
      disconnectRoom();

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUserId(null);
      setMessages([]);
      setFriends([]);
      setRequests([]);
      setOutgoing([]);
      setServers([]);
      setServer(null);
      setGroups([]);
      setChannelId(null);
      setShowFriends(false);
      setShowSettings(false);
      setSelectedFile(null);
      setMessageInput("");

      setChatError("Oturum kapatıldı.");
      setMicError("");
    } catch (error) {
      console.error("Çıkış hatası:", error);
      setChatError("Çıkış yapılamadı: " + error.message);
    }
  }

  // Sunucu penceresi
  function openServerModal(type) {
    if (serverBusy) return;

    setServerModal(type);
    setServerModalInput("");
    setServerModalMessage("");
    setServerModalSuccess(false);
  }

  function closeServerModal() {
    if (serverBusy) return;

    setServerModal("");
    setServerModalInput("");
    setServerModalMessage("");
    setServerModalSuccess(false);
  }

  async function createServer() {
    if (serverBusy || serverModalSuccess) return;

    const cleanName = serverModalInput.trim();

    if (cleanName.length < 2 || cleanName.length > 32) {
      setServerModalMessage("Sunucu adı 2-32 karakter arasında olmalı.");
      return;
    }

    setServerBusy(true);
    setServerModalMessage("");

    try {
      const currentUser = await getCurrentUser();

      const { data, error } = await supabase.rpc(
        "create_voice_server",
        {
          server_name: cleanName,
          server_icon: "🎮"
        }
      );

      if (error) throw error;

      await loadServers(data, currentUser.id);

      setServerModalSuccess(true);
      setServerModalMessage("Sunucu başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Sunucu oluşturma hatası:", error);
      setServerModalMessage("Sunucu oluşturulamadı: " + error.message);
    } finally {
      setServerBusy(false);
    }
  }

  async function joinServer() {
    if (serverBusy || serverModalSuccess) return;

    const code = serverModalInput.trim().toUpperCase();

    if (!code) {
      setServerModalMessage("Davet kodunu girmelisin.");
      return;
    }

    setServerBusy(true);
    setServerModalMessage("");

    try {
      const currentUser = await getCurrentUser();

      const { data, error } = await supabase.rpc(
        "join_voice_server",
        { code }
      );

      if (error) throw error;

      await loadServers(data, currentUser.id);

      setServerModalSuccess(true);
      setServerModalMessage("Sunucuya başarıyla katıldın!");
    } catch (error) {
      console.error("Sunucuya katılma hatası:", error);
      setServerModalMessage("Sunucuya katılınamadı: " + error.message);
    } finally {
      setServerBusy(false);
    }
  }

  async function saveServerSettings() {
    if (!server?.id || serverBusy) return;
    const cleanName = serverNameDraft.trim();
    if (cleanName.length < 2 || cleanName.length > 32) {
      setServerSettingsMessage("Sunucu adı 2-32 karakter arasında olmalı.");
      return;
    }
    setServerBusy(true);
    setServerSettingsMessage("");
    try {
      await getCurrentUser();
      const { data, error } = await supabase.from("servers")
        .update({ name: cleanName, icon: serverIconDraft.trim() || "🎮" })
        .eq("id", server.id)
        .select("id,name,icon,invite_code,created_at");
      if (error) throw error;
      if (!data?.length) throw new Error("Bu sunucuyu düzenleme yetkin yok. Sunucu sahibi olmalısın.");
      const updated = data[0];
      setServer(updated);
      setServers(current => current.map(item => item.id === updated.id ? updated : item));
      setServerNameDraft(updated.name);
      setServerIconDraft(updated.icon || "🎮");
      setServerSettingsMessage("Sunucu ayarları kaydedildi.");
    } catch (error) {
      setServerSettingsMessage("Kaydedilemedi: " + (error.message || "Bir hata oluştu."));
    } finally {
      setServerBusy(false);
    }
  }

  async function copyServerCode() {
    if (!server?.invite_code) return;

    try {
      await navigator.clipboard.writeText(server.invite_code);
      setChatError("Davet kodu kopyalandı: " + server.invite_code);
    } catch {
      setChatError("Sunucu davet kodu: " + server.invite_code);
    }
  }

  // Kanal penceresi
  function openChannelModal() {
    if (!server || serverBusy) return;

    setChannelNameInput("");
    setChannelTypeInput("voice");
    setChannelModalMessage("");
    setChannelModal(true);
  }

  function closeChannelModal() {
    if (serverBusy) return;

    setChannelModal(false);
    setChannelNameInput("");
    setChannelModalMessage("");
  }

  async function createChannel() {
    if (!server?.id || serverBusy) return;

    const cleanName = channelNameInput.trim();

    if (cleanName.length < 2 || cleanName.length > 40) {
      setChannelModalMessage("Kanal adı 2-40 karakter arasında olmalı.");
      return;
    }

    setServerBusy(true);
    setChannelModalMessage("");

    try {
      await getCurrentUser();

      const roomName = `${channelTypeInput}-${crypto.randomUUID()}`;

      const { error } = await supabase
        .from("server_channels")
        .insert({
          server_id: server.id,
          name: cleanName,
          type: channelTypeInput,
          category: "GENEL",
          room: roomName
        });

      if (error) throw error;

      await loadChannels();

      setChannelModal(false);
      setChannelNameInput("");
      setChannelModalMessage("");
    } catch (error) {
      console.error("Kanal oluşturma hatası:", error);
      setChannelModalMessage(
        "Kanal oluşturulamadı: " + error.message
      );
    } finally {
      setServerBusy(false);
    }
  }

  function openChannelSettings(item) {
    if (!item) return;
    setChannelSettingsItem(item);
    setChannelSettingsDraft({
      name: item.name || "",
      topic: item.topic || "",
      slowmode: String(item.slowmode_seconds ?? 0),
      visibility: item.visibility || "default",
      hideInactive: String(item.hide_inactive_days ?? 3)
    });
    setChannelSettingsMessage("");
    setChannelSettingsOpen(true);
  }

  async function saveChannelSettings() {
    if (!channelSettingsItem || serverBusy) return;
    const cleanName = channelSettingsDraft.name.trim();
    if (cleanName.length < 2 || cleanName.length > 40) {
      setChannelSettingsMessage("Kanal adı 2-40 karakter arasında olmalı.");
      return;
    }
    setServerBusy(true);
    setChannelSettingsMessage("");
    try {
      const { data, error } = await supabase.from("server_channels").update({
        name: cleanName,
        topic: channelSettingsDraft.topic.trim(),
        slowmode_seconds: Number(channelSettingsDraft.slowmode) || 0,
        visibility: channelSettingsDraft.visibility,
        hide_inactive_days: Number(channelSettingsDraft.hideInactive) || 0
      }).eq("id", channelSettingsItem.id).eq("server_id", server.id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("Kanalı düzenleme izni yok.");
      await loadChannels();
      setChannelSettingsItem({ ...channelSettingsItem, name: cleanName });
      setChannelSettingsMessage("Kanal ayarları kaydedildi.");
    } catch (error) {
      setChannelSettingsMessage("Kaydedilemedi: " + (error.message || "Veritabanı hatası"));
    } finally { setServerBusy(false); }
  }

  async function deleteChannel(item) {
    if (!item?.id || serverBusy) return;
    if (!window.confirm(`"${item.name}" kanalını kalıcı olarak silmek istiyor musun?`)) return;
    setServerBusy(true);
    setChatError("");
    try {
      await getCurrentUser();
      const { data: deletedRows, error } = await supabase.from("server_channels").delete()
        .eq("id", item.id).eq("server_id", server.id).select("id");
      if (error) throw error;
      if (!deletedRows?.length) throw new Error("Silme izni yok. Yalnızca sunucu sahibi veya yetkili silebilir.");
      await loadChannels();
      setChatError(`"${item.name}" kanalı silindi.`);
    } catch (error) {
      console.error("Kanal silme hatası:", error);
      setChatError("Kanal silinemedi: " + (error.message || "Silme yetkin olmayabilir."));
    } finally { setServerBusy(false); }
  }

  async function deleteServer() {
    if (!server?.id || serverBusy) return;
    if (!window.confirm(`"${server.name}" sunucusunu ve içindeki kanalları kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`)) return;
    setServerBusy(true);
    setChatError("");
    try {
      const currentUser = await getCurrentUser();
      const deletingId = server.id;
      const { data: deletedRows, error } = await supabase.from("servers").delete().eq("id", deletingId).select("id");
      if (error) throw error;
      if (!deletedRows?.length) throw new Error("Sunucuyu silme izni yok. Yalnızca sunucu sahibi silebilir.");
      setServer(null); setGroups([]); setChannelId(null); setMessages([]);
      await loadServers(null, currentUser.id);
      setChatError("Sunucu silindi.");
    } catch (error) {
      console.error("Sunucu silme hatası:", error);
      setChatError("Sunucu silinemedi: " + (error.message || "Sunucu sahibi olmayabilir veya veritabanı silme izni vermiyor."));
    } finally { setServerBusy(false); }
  }

  async function toggleScreenShare() {
    if (!room || !connected) { setScreenShareError("Ekran paylaşmak için önce ses kanalına bağlan."); return; }
    try {
      setScreenShareError("");
      const nextEnabled = !screenShareEnabled;
      if (nextEnabled) {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error("Bu Electron/Chromium sürümünde getDisplayMedia desteklenmiyor. Electron sürümünü kontrol et.");
        }
        await room.localParticipant.setScreenShareEnabled(true, {
          audio: false,
          video: { displaySurface: "monitor" }
        });
      } else {
        await room.localParticipant.setScreenShareEnabled(false);
      }
      setScreenShareEnabled(nextEnabled);
    } catch (error) {
      console.error("Ekran paylaşımı hatası:", error);
      const detail = error?.message || String(error || "Bilinmeyen hata");
      const errorName = error?.name || "Error";
      setScreenShareError(
        errorName === "NotAllowedError" || errorName === "AbortError"
          ? "Ekran seçimi iptal edildi veya izin verilmedi. Tekrar deneyebilirsin."
          : `Ekran paylaşımı başlatılamadı (${errorName}): ${detail}`
      );
      setScreenShareEnabled(false);
    }
  }

  function attachScreenShareTrack(track, participantName = "Kullanıcı") {
    if (!screenShareContainerRef.current || !track || track.kind !== "video") return;
    const trackId = track.sid || `${participantName}-${Date.now()}`;
    if (screenShareElementsRef.current.has(trackId)) return;
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "min-width:0;background:#111722;border:1px solid #303b4b;border-radius:10px;padding:8px;overflow:hidden";
    const title = document.createElement("div");
    title.textContent = `${participantName} ekranını paylaşıyor`;
    title.style.cssText = "font-size:13px;font-weight:600;margin-bottom:7px;color:#e7edf7";
    const video = document.createElement("video");
    video.autoplay = true; video.playsInline = true; video.controls = true;
    video.style.cssText = "display:block;width:100%;max-height:420px;object-fit:contain;background:#05070a;border-radius:7px";
    track.attach(video); wrapper.append(title, video);
    screenShareContainerRef.current.appendChild(wrapper);
    screenShareElementsRef.current.set(trackId, { track, wrapper, video });
    setScreenShareTracks(previous => [...previous.filter(item => item.id !== trackId), { id: trackId, name: participantName }]);
    video.play().catch(error => console.warn("Ekran videosu oynatılamadı:", error));
  }

  function detachScreenShareTrack(track) {
    if (!track) return;
    const found = [...screenShareElementsRef.current.entries()].find(([, item]) => item.track === track);
    if (!found) return;
    const [trackId, item] = found;
    try { track.detach(item.video); } catch {}
    item.video.pause(); item.video.srcObject = null; item.wrapper.remove();
    screenShareElementsRef.current.delete(trackId);
    setScreenShareTracks(previous => previous.filter(entry => entry.id !== trackId));
  }

  
  // Kullanıcı adı
function saveUserName() {
  const cleanName = nameInput.trim();

  if (!cleanName) {
    setMicError("Kullanıcı adı boş olamaz.");
    return;
  }

  if (cleanName.length > 32) {
    setMicError("Kullanıcı adı en fazla 32 karakter olabilir.");
    return;
  }

  try {
    localStorage.setItem("voiceUserName", cleanName);
  } catch {
    setMicError("Kullanıcı adı kaydedilemedi.");
    return;
  }

  setUserName(cleanName);
  setNameInput(cleanName);
  setMicError("");

  // Ses bağlantısı korunur.
  setShowSettings(false);
}

  function persistSetting(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { setSettingsNotice("Ayar kaydedilemedi: " + error.message); }
  }

  function updateNoiseSettings(patch) {
    const next = { ...noiseSettings, ...patch };
    setNoiseSettings(next);
    persistSetting("voiceNoiseSettings", next);
    // LiveKit bağlantısı kapanmaz. Mikrofon açıksa yeni capture filtreleri uygulanır.
    if (room?.localParticipant?.isMicrophoneEnabled) {
      (async () => {
        try {
          await room.localParticipant.setMicrophoneEnabled(false);
          await room.localParticipant.setMicrophoneEnabled(true, {
            noiseSuppression: !!next.enabled,
            voiceIsolation: !!next.enabled,
            echoCancellation: !!next.echoCancellation,
            autoGainControl: !!next.autoGainControl,
            ...(selectedInput ? { deviceId: selectedInput } : {})
          });
          setMuted(false);
          setSettingsNotice("Mikrofon filtreleri uygulandı.");
        } catch (error) {
          setSettingsNotice("Mikrofon filtresi uygulanamadı: " + error.message);
        }
      })();
    }
  }

  function updateNotificationSettings(patch) {
    setNotificationSettings(previous => {
      const next = { ...previous, ...patch };
      persistSetting("voiceNotificationSettings", next);
      return next;
    });
  }

  function updatePrivacySettings(patch) {
    setPrivacySettings(previous => {
      const next = { ...previous, ...patch };
      persistSetting("voicePrivacySettings", next);
      return next;
    });
  }

  function updateShortcut(action, key) {
    const clean = key.trim().toUpperCase();
    if (!clean || clean.length > 12) return;
    setShortcutSettings(previous => {
      const next = { ...previous, [action]: clean };
      persistSetting("voiceShortcutSettings", next);
      return next;
    });
  }

  async function enableDesktopNotifications() {
    if (!("Notification" in window)) {
      setSettingsNotice("Bu uygulama ortamı masaüstü bildirimlerini desteklemiyor.");
      return;
    }
    const permission = await Notification.requestPermission();
    setSettingsNotice(permission === "granted" ? "Masaüstü bildirim izni verildi." : "Bildirim izni verilmedi.");
  }

  function notifyVoice(title, body) {
    if (notificationSettings.desktop && "Notification" in window && Notification.permission === "granted") {
      try { new Notification(title, { body, silent: true }); } catch (error) { console.warn("Bildirim gösterilemedi:", error); }
    }
    if (notificationSettings.sounds) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass();
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.frequency.value = 740;
          gain.gain.setValueAtTime(0.045, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.start(); oscillator.stop(context.currentTime + 0.16);
          oscillator.onended = () => context.close();
        }
      } catch (error) { console.warn("Bildirim sesi çalınamadı:", error); }
    }
  }

  function changeAppearance(value) {
    setAppearance(value);
    localStorage.setItem("voiceAppearance", value);
    document.body.classList.toggle("voice-light-theme", value === "light");
  }

  function handleAvatarSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setSettingsNotice("Lütfen bir resim dosyası seç."); return; }
    if (file.size > 1024 * 1024) { setSettingsNotice("Profil fotoğrafı en fazla 1 MB olabilir."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      try {
        localStorage.setItem("voiceProfileAvatar", value);
        setProfileAvatar(value);
        setSettingsNotice("Profil fotoğrafı bu cihaza kaydedildi.");
      } catch { setSettingsNotice("Fotoğraf tarayıcı depolama sınırını aşıyor."); }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  // Kısayollar ana süreçte dinlenir; uygulama arka plandayken de çalışır.
  useEffect(() => {
    const api = window.voiceAPI;
    if (!api) return;
    api.setGlobalShortcuts?.(shortcutSettings);
    const unsubscribe = api.onGlobalShortcut?.((action) => {
      if (action === "mute" && connected && micMode === "voice") {
        toggleMicrophone();
      } else if (action === "deafen" && connected) {
        setDeafened(value => !value);
      } else if (action === "settings") {
        setShowSettings(value => !value);
      }
    });
    return () => unsubscribe?.();
  }, [shortcutSettings, connected, micMode, room, noiseSettings, selectedInput]);

  useEffect(() => {
    document.body.classList.toggle("voice-light-theme", appearance === "light");
    return () => document.body.classList.remove("voice-light-theme");
  }, [appearance]);

  // Kullanılabilir mikrofon ve hoparlörleri listele
  async function loadAudioDevices() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error("Bu sistem ses aygıtlarını listelemeyi desteklemiyor.");
      }

      // Etiketlerin görünmesi için tarayıcı/Electron izin isteyebilir.
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(device => device.kind === "audioinput");
      const outputs = devices.filter(device => device.kind === "audiooutput");

      setAudioInputs(inputs);
      setAudioOutputs(outputs);
      setDeviceError("");
    } catch (error) {
      console.error("Ses aygıtları yüklenemedi:", error);
      setDeviceError("Ses aygıtları yüklenemedi: " + error.message);
    }
  }

  async function changeAudioInput(deviceId) {
    try {
      if (room && deviceId) {
        const result = await room.switchActiveDevice("audioinput", deviceId);
        if (result === false) throw new Error("Mikrofon değiştirilemedi.");
      }

      localStorage.setItem("voiceAudioInput", deviceId || "");
      setSelectedInput(deviceId);
      setDeviceError("");
    } catch (error) {
      console.error("Mikrofon değiştirme hatası:", error);
      setDeviceError("Mikrofon değiştirilemedi: " + error.message);
    }
  }

  async function changeAudioOutput(deviceId) {
    try {
      if (deviceId) {
        const elements = Array.from(audioElementsRef.current);
        const unsupported = elements.some(
          element => typeof element.setSinkId !== "function"
        );

        if (unsupported && elements.length) {
          throw new Error("Bu sistem hoparlör seçimini desteklemiyor.");
        }

        await Promise.all(elements.map(element => element.setSinkId(deviceId)));
      }

      localStorage.setItem("voiceAudioOutput", deviceId || "");
      setSelectedOutput(deviceId);
      setDeviceError("");
    } catch (error) {
      console.error("Hoparlör değiştirme hatası:", error);
      setDeviceError("Hoparlör değiştirilemedi: " + error.message);
    }
  }

  // Ayarlar açıkken aygıt listesini güncel tut
  useEffect(() => {
    if (!showSettings) return;

    loadAudioDevices();
    const mediaDevices = navigator.mediaDevices;
    mediaDevices?.addEventListener?.("devicechange", loadAudioDevices);

    return () => {
      mediaDevices?.removeEventListener?.("devicechange", loadAudioDevices);
    };
  }, [showSettings]);

  // Bas-konuş tuşunu kaydet
  function savePttKey(key) {
    if (!key) return;

    try {
      localStorage.setItem("voicePttKey", key);
      setPttKey(key);

      window.voiceAPI?.setPushToTalkKey(key);

      setCapturingPttKey(false);
      setMicError(`Bas-konuş tuşu ${key} olarak ayarlandı.`);
    } catch (error) {
      setMicError("Tuş kaydedilemedi: " + error.message);
    }
  }

  // Yeni bas-konuş tuşu seç
  function capturePttKey(event) {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.key === "Control" ||
      event.key === "Alt" ||
      event.key === "Shift" ||
      event.key === "Meta"
    ) {
      return;
    }

    const code = event.code;
    let key = null;

    if (/^Key[A-Z]$/.test(code)) {
      key = code.replace("Key", "");
    } else if (/^Digit[0-9]$/.test(code)) {
      key = code.replace("Digit", "");
    } else if (/^F([1-9]|1[0-2])$/.test(code)) {
      key = code;
    } else {
      const specialKeys = {
        Space: "SPACE",
        Enter: "ENTER",
        Escape: "ESC",
        Tab: "TAB",
        Backspace: "BACKSPACE",
        CapsLock: "CAPS_LOCK",
        ShiftLeft: "SHIFT",
        ShiftRight: "SHIFT",
        ControlLeft: "CTRL",
        ControlRight: "CTRL",
        AltLeft: "ALT",
        AltRight: "ALT"
      };

      key = specialKeys[code] || null;
    }

    if (!key) {
      setMicError("Bu tuş desteklenmiyor. Başka bir tuş dene.");
      return;
    }

    savePttKey(key);
  }

  // Bas-konuş global klavye olayları: abonelik sabit, güncel durum ref üzerinden okunur.
  useEffect(() => {
    const api = window.voiceAPI;
    if (!api) {
      console.error("VOICE klavye API'si bulunamadı.");
      return;
    }

    api.setPushToTalkKey(pttKey);

    const unsubscribeDown = api.onPushToTalkDown(() => {
      const cfg = pttRuntimeRef.current;
      if (cfg.micMode !== "ptt" || !cfg.connected || !cfg.room || cfg.deafened || pttPressedRef.current) return;

      pttPressedRef.current = true;
      pttOperationRef.current = pttOperationRef.current.then(async () => {
        const current = pttRuntimeRef.current;
        // Tuş bırakılmış veya bağlantı değişmişse açma işlemini başlatma.
        if (!pttPressedRef.current || current.micMode !== "ptt" || !current.connected || !current.room || current.deafened) return;
        await current.room.localParticipant.setMicrophoneEnabled(true, {
          noiseSuppression: !!current.noiseSettings.enabled,
          voiceIsolation: !!current.noiseSettings.enabled,
          echoCancellation: !!current.noiseSettings.echoCancellation,
          autoGainControl: !!current.noiseSettings.autoGainControl,
          ...(current.selectedInput ? { deviceId: current.selectedInput } : {})
        });
        setMuted(false);
        setMicError("");
      }).catch(error => {
        pttPressedRef.current = false;
        setMuted(true);
        setMicError("Bas-konuş mikrofon hatası: " + error.message);
      });
    });

    const unsubscribeUp = api.onPushToTalkUp(() => {
      if (!pttPressedRef.current) return;
      pttPressedRef.current = false;
      pttOperationRef.current = pttOperationRef.current.then(async () => {
        const current = pttRuntimeRef.current;
        if (current.room) await current.room.localParticipant.setMicrophoneEnabled(false);
        setMuted(true);
      }).catch(error => setMicError("Mikrofon kapatılamadı: " + error.message));
    });

    const unsubscribeError = api.onPushToTalkKeyError?.(message => {
      pttPressedRef.current = false;
      setMicError("Arka plan klavye dinleyicisi başlatılamadı: " + message);
    });

    return () => {
      // Abonelik kapanırken mikrofonun açık kalmasına izin verme.
      if (pttPressedRef.current) {
        pttPressedRef.current = false;
        pttOperationRef.current = pttOperationRef.current.then(async () => {
          const current = pttRuntimeRef.current;
          if (current.room) await current.room.localParticipant.setMicrophoneEnabled(false);
          setMuted(true);
        }).catch(() => {});
      }
      unsubscribeDown?.();
      unsubscribeUp?.();
      unsubscribeError?.();
    };
  // Bilerek tek sefer: güncel React değerleri pttRuntimeRef üzerinden okunur.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bas-konuş moduna geçince mikrofonu kapat ve global dinlemeyi ayarla
  useEffect(() => {
    const enabled = micMode === "ptt" && connected && !!room;

    window.voiceAPI?.setPushToTalkEnabled(enabled);

    if (!enabled) {
      pttPressedRef.current = false;
      window.voiceAPI?.resetPushToTalk();
    }

    if (micMode === "ptt" && room) {
      room.localParticipant.setMicrophoneEnabled(false)
        .then(() => setMuted(true))
        .catch(error => {
          console.error("Bas-konuş modunda mikrofon kapatılamadı:", error);
        });
    }

    return () => {
      window.voiceAPI?.setPushToTalkEnabled(false);
      window.voiceAPI?.resetPushToTalk();
    };
  }, [micMode, connected, room]);

  // Arkadaşları yükle
  const loadFriends = useCallback(async () => {
    setFriendsLoading(true);
    setFriendsMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Oturum bulunamadı.");

      setUserId(user.id);

      const { data: profile, error: profileError } =
        await supabase
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

      if (friendIds.length > 0) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id,username,friend_code")
          .in("id", friendIds);

        if (error) throw error;
        setFriends(data || []);
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
        const ids = incoming.map(item => item.sender_id);

        const { data: senders, error } = await supabase
          .from("profiles")
          .select("id,username,friend_code")
          .in("id", ids);

        if (error) throw error;

        setRequests(incoming.map(item => ({
          ...item,
          profile: senders.find(p => p.id === item.sender_id)
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
        const ids = sent.map(item => item.receiver_id);

        const { data: receivers, error } = await supabase
          .from("profiles")
          .select("id,username,friend_code")
          .in("id", ids);

        if (error) throw error;

        setOutgoing(sent.map(item => ({
          ...item,
          profile: receivers.find(p => p.id === item.receiver_id)
        })));
      } else {
        setOutgoing([]);
      }
    } catch (error) {
      console.error("Arkadaşlar yüklenemedi:", error);
      setFriendsMessage(error.message || "Arkadaşlar yüklenemedi.");
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) loadFriends();
  }, [userId, loadFriends]);

  async function searchFriend(event) {
    event.preventDefault();
    setFriendsMessage("");
    setSearchResult(null);

    const code = searchCode.trim().toUpperCase();

    if (!code) {
      setFriendsMessage("Arkadaş kodunu yazmalısın.");
      return;
    }

    setFriendsBusy(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,friend_code")
        .eq("friend_code", code)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setFriendsMessage("Bu kodla kullanıcı bulunamadı.");
      } else if (data.id === userId) {
        setFriendsMessage("Kendini ekleyemezsin.");
      } else if (friends.some(friend => friend.id === data.id)) {
        setFriendsMessage("Bu kullanıcı zaten arkadaşın.");
      } else {
        setSearchResult(data);
      }
    } catch (error) {
      setFriendsMessage(error.message || "Arama başarısız.");
    } finally {
      setFriendsBusy(false);
    }
  }

  async function sendFriendRequest() {
    if (!searchResult || !userId) return;

    setFriendsBusy(true);
    setFriendsMessage("");

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
        throw new Error("Bekleyen bir istek zaten var.");
      }

      const { error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: userId,
          receiver_id: targetId,
          status: "pending"
        });

      if (error) throw error;

      setFriendsMessage("Arkadaşlık isteği gönderildi!");
      setSearchResult(null);
      setSearchCode("");
      await loadFriends();
    } catch (error) {
      setFriendsMessage(error.message || "İstek gönderilemedi.");
    } finally {
      setFriendsBusy(false);
    }
  }

  async function acceptRequest(requestId) {
    setFriendsBusy(true);
    setFriendsMessage("");

    try {
      const { error } = await supabase.rpc(
        "accept_friend_request",
        { request_id: requestId }
      );

      if (error) throw error;

      setFriendsMessage("Arkadaşlık isteği kabul edildi.");
      await loadFriends();
    } catch (error) {
      setFriendsMessage(error.message || "İstek kabul edilemedi.");
    } finally {
      setFriendsBusy(false);
    }
  }

  async function rejectRequest(requestId) {
    setFriendsBusy(true);
    setFriendsMessage("");

    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId)
        .eq("receiver_id", userId);

      if (error) throw error;

      setFriendsMessage("Arkadaşlık isteği reddedildi.");
      await loadFriends();
    } catch (error) {
      setFriendsMessage(error.message || "İstek reddedilemedi.");
    } finally {
      setFriendsBusy(false);
    }
  }

  async function copyFriendCode() {
    try {
      await navigator.clipboard.writeText(myCode);
      setFriendsMessage("Arkadaş kodun kopyalandı!");
    } catch {
      setFriendsMessage("Kodun: " + myCode);
    }
  }

  async function prepareMessage(message) {
    if (!message.attachment_path) {
      return { ...message, fileUrl: null };
    }

    const { data, error } = await supabase.storage
      .from("voice-chat-files")
      .createSignedUrl(message.attachment_path, 3600);

    return {
      ...message,
      fileUrl: error ? null : data?.signedUrl
    };
  }

  // Mesajları yükle ve gerçek zamanlı dinle
  useEffect(() => {
    if (!userId || !channel?.room || showFriends) return;

    let active = true;

    async function loadMessages() {
      setChatLoading(true);
      setChatError("");
      setMessages([]);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channel.room)
        .order("created_at", { ascending: true });

      if (!active) return;

      if (error) {
        setChatError("Mesajlar yüklenemedi: " + error.message);
        setChatLoading(false);
        return;
      }

      const prepared = await Promise.all(
        (data || []).map(prepareMessage)
      );

      if (active) {
        setMessages(prepared);
        setChatLoading(false);
      }
    }

    loadMessages();

    const subscription = supabase
      .channel("chat-" + channel.room)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channel.room}`
        },
        async payload => {
          const prepared = await prepareMessage(payload.new);
          if (!active) return;
          if (payload.new.user_id !== userId && notificationSettings.messages) {
            notifyVoice(prepared.username || "Yeni mesaj", prepared.content || "Bir dosya gönderdi.");
          }

          setMessages(previous => {
            if (previous.some(item => item.id === prepared.id)) {
              return previous;
            }
            return [...previous, prepared];
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(subscription);
    };
  }, [channel?.room, userId, showFriends, notificationSettings]);

  useEffect(() => {
    if (!userId || !notificationSettings.friendRequests) return;
    const subscription = supabase
      .channel("friend-request-notifications-" + userId)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "friend_requests",
        filter: `receiver_id=eq.${userId}`
      }, () => notifyVoice("Arkadaşlık isteği", "Yeni bir arkadaşlık isteğin var."))
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [userId, notificationSettings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages]);

  // Mesaj gönder
  async function sendMessage(event) {
    event.preventDefault();
    if (chatSending) return;

    const content = messageInput.trim();
    const file = selectedFile;

    if (!content && !file) return;

    if (!userId) {
      setChatError("Önce hesabına giriş yapmalısın.");
      return;
    }

    if (!channel?.room) {
      setChatError("Önce bir kanal seçmelisin.");
      return;
    }

    if (file && file.size > 50 * 1024 * 1024) {
      setChatError("Dosya boyutu en fazla 50 MB olabilir.");
      return;
    }

    const slowmodeSeconds = Number(channel.slowmode_seconds || 0);
    const slowmodeKey = `voiceSlowmode:${userId}:${channel.id}`;
    const lastSentAt = Number(localStorage.getItem(slowmodeKey) || 0);
    const waitMs = slowmodeSeconds * 1000 - (Date.now() - lastSentAt);
    if (slowmodeSeconds > 0 && waitMs > 0) {
      setChatError(`Yavaş mod açık. ${Math.ceil(waitMs / 1000)} saniye sonra tekrar mesaj gönderebilirsin.`);
      return;
    }

    setChatSending(true);
    setChatError("");

    try {
      let attachmentPath = null;
      let attachmentName = null;
      let attachmentType = null;

      if (file) {
        const safeName = file.name.replace(/[^\w.\-() ]/g, "_");
        const path =
          `${userId}/${channel.room}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("voice-chat-files")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) throw uploadError;

        attachmentPath = path;
        attachmentName = file.name;
        attachmentType = file.type || "application/octet-stream";
      }

      const { data, error } = await supabase
        .from("messages")
        .insert({
          channel_id: channel.room,
          user_id: userId,
          username: userName,
          content: content || null,
          attachment_path: attachmentPath,
          attachment_name: attachmentName,
          attachment_type: attachmentType
        })
        .select()
        .single();

      if (error) throw error;
      updateTaskProgress("messages");
      if (slowmodeSeconds > 0) localStorage.setItem(slowmodeKey, String(Date.now()));

      const prepared = await prepareMessage(data);

      setMessages(previous => {
        if (previous.some(item => item.id === prepared.id)) {
          return previous;
        }
        return [...previous, prepared];
      });

      setMessageInput("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      setChatError("Mesaj gönderilemedi: " + error.message);
    } finally {
      setChatSending(false);
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setChatError("Dosya boyutu en fazla 50 MB olabilir.");
      event.target.value = "";
      return;
    }

    setChatError("");
    setSelectedFile(file);
  }

  // LiveKit ses elementleri
  function attachAudioTrack(track) {
    if (!audioContainerRef.current || track.kind !== "audio") return;

    const audioElement = document.createElement("audio");
    audioElement.autoplay = true;
    audioElement.muted = deafened;
    audioElement.volume = 1;

    track.attach(audioElement);
    audioContainerRef.current.appendChild(audioElement);
    audioElementsRef.current.add(audioElement);

    if (selectedOutput && typeof audioElement.setSinkId === "function") {
      audioElement.setSinkId(selectedOutput).catch(error => {
        console.warn("Ses çıkış aygıtı uygulanamadı:", error);
      });
    }

    audioElement.play().catch(error => {
      console.warn("Ses oynatma bekliyor:", error);
    });
  }

  function detachAudioTrack(track) {
    try {
      const elements = track.detach();
      const list = Array.isArray(elements) ? elements : [elements];

      list.forEach(element => {
        if (!element) return;

        element.pause();
        element.srcObject = null;
        element.remove();

        audioElementsRef.current.delete(element);
      });
    } catch (error) {
      console.warn("Ses temizleme uyarısı:", error);
    }
  }

  useEffect(() => {
    audioElementsRef.current.forEach(element => {
      element.muted = deafened;
    });
  }, [deafened]);

  // LiveKit oda olayları
  useEffect(() => {
    if (!room) {
      setParticipants([]);
      return;
    }

    const updateParticipants = () => {
      const users = [
        {
          identity: room.localParticipant.identity,
          name: room.localParticipant.name || userName,
          local: true,
          muted: !room.localParticipant.isMicrophoneEnabled
        },
        ...Array.from(room.remoteParticipants.values()).map(user => ({
          identity: user.identity,
          name: user.name || user.identity,
          local: false,
          muted: !Array.from(
            user.audioTrackPublications.values()
          ).some(publication =>
            publication.isSubscribed &&
            publication.track &&
            !publication.track.isMuted
          )
        }))
      ];

      setParticipants(users);
    };

    const handleTrackSubscribed = (track, publication, participant) => {
      if (track.source === "screen_share" && track.kind === "video") attachScreenShareTrack(track, participant?.name || participant?.identity || "Kullanıcı");
      else attachAudioTrack(track);
      updateParticipants();
    };

    const handleTrackUnsubscribed = track => {
      if (track.kind === "video") detachScreenShareTrack(track);
      else detachAudioTrack(track);
      updateParticipants();
    };

    const handleLocalTrackPublished = publication => {
      if (publication?.source === "screen_share" && publication.track) {
        setScreenShareEnabled(true);
        attachScreenShareTrack(publication.track, "Sen");
      }
      updateParticipants();
    };

    const handleLocalTrackUnpublished = publication => {
      if (publication?.source === "screen_share") {
        if (publication.track) detachScreenShareTrack(publication.track);
        setScreenShareEnabled(false);
      }
      updateParticipants();
    };

    const events = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished
    ];

    events.forEach(event => room.on(event, updateParticipants));
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);

    room.remoteParticipants.forEach(participant => {
      participant.audioTrackPublications.forEach(publication => {
        if (publication.isSubscribed && publication.track) attachAudioTrack(publication.track);
      });
      participant.videoTrackPublications.forEach(publication => {
        if (publication.isSubscribed && publication.track && publication.source === "screen_share") attachScreenShareTrack(publication.track, participant.name || participant.identity);
      });
    });
    room.localParticipant.videoTrackPublications.forEach(publication => {
      if (publication.source === "screen_share" && publication.track) {
        setScreenShareEnabled(true);
        attachScreenShareTrack(publication.track, "Sen");
      }
    });

    updateParticipants();

    return () => {
      events.forEach(event => room.off(event, updateParticipants));

      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
      room.off(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);
      screenShareElementsRef.current.forEach(item => {
        try { item.track.detach(item.video); } catch {}
        item.video.pause(); item.video.srcObject = null; item.wrapper.remove();
      });
      screenShareElementsRef.current.clear();
      setScreenShareTracks([]); setScreenShareEnabled(false);

      audioElementsRef.current.forEach(element => {
        element.pause();
        element.srcObject = null;
        element.remove();
      });

      audioElementsRef.current.clear();
    };
  }, [room, userName, selectedOutput]);

  // Ses kanalına bağlan
  async function connectToChannel(channelToJoinId = null) {
    const targetChannel = channelToJoinId ? allChannels.find(item => item.id === channelToJoinId) : channel;
    if (connecting) return;

   if (room && !channelToJoinId) {
  setMicError("");
  return;
}

    if (!targetChannel || targetChannel.type !== "voice") {
      setMicError("Bu bir yazı kanalı. Ses kanalına geçmelisin.");
      return;
    }

    let newRoom = null;

    try {
      setConnecting(true);
      setMicError("");

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error("Oturum bulunamadı. Tekrar giriş yap.");
      }

      const { data: result, error: tokenError } =
        await supabase.functions.invoke("livekit-token", {
          body: {
            roomName: targetChannel.room,
            participantName: userName
          }
        });

      if (tokenError) throw new Error(tokenError.message);

      if (!result?.success || !result?.url || !result?.token) {
        throw new Error(result?.error || "LiveKit token alınamadı.");
      }

      newRoom = new Room({
        adaptiveStream: true,
        dynacast: true
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        pttPressedRef.current = false;
        window.voiceAPI?.resetPushToTalk();
        window.voiceAPI?.setPushToTalkEnabled(false);

        setRoom(null);
        setConnected(false);
        setMuted(true);
        setParticipants([]);
      });

      await newRoom.connect(result.url, result.token);

      // Kaydedilmiş mikrofon ve gürültü filtrelerini bağlantı kurulduğunda uygula.
      if (selectedInput) await newRoom.switchActiveDevice("audioinput", selectedInput);

      setRoom(newRoom);
      updateTaskProgress("voiceJoins");
      setConnected(true);
      setMuted(true);
      setDeafened(false);
      setMicError("");
    } catch (error) {
      console.error("LiveKit bağlantı hatası:", error);
      newRoom?.disconnect();

      setMicError(
        "Bağlantı kurulamadı: " +
        (error?.message || "Bilinmeyen hata")
      );
    } finally {
      setConnecting(false);
    }
  }

  // Normal mikrofon kontrolü
  async function toggleMicrophone() {
    if (!room || !connected) {
      setMicError("Önce ses kanalına bağlanmalısın.");
      return;
    }

    if (micMode === "ptt") {
      setMicError(
        `Bas-konuş modunda mikrofonu açmak için ${pttKey} tuşuna basılı tut.`
      );
      return;
    }

    try {
      const enabled = !room.localParticipant.isMicrophoneEnabled;

      await room.localParticipant.setMicrophoneEnabled(enabled, enabled ? {
        noiseSuppression: !!noiseSettings.enabled,
        voiceIsolation: !!noiseSettings.enabled,
        echoCancellation: !!noiseSettings.echoCancellation,
        autoGainControl: !!noiseSettings.autoGainControl,
        ...(selectedInput ? { deviceId: selectedInput } : {})
      } : undefined);

      setMuted(!enabled);
      setMicError("");
    } catch (error) {
      setMicError("Mikrofon hatası: " + error.message);
    }
  }

  function toggleDeafened() {
    setDeafened(previous => !previous);
  }

 function changeChannel(id) {
  const nextChannel = allChannels.find(item => item.id === id);
  setChannelId(id);
  setMicError("");
  setChatError("");
  setSelectedFile(null);
  if (nextChannel?.type === "voice") {
    if (room) disconnectRoom();
    // Kanal seçildiğinde ayrı bir "Sese Katıl" düğmesi gerektirmeden bağlan.
    window.setTimeout(() => connectToChannel(id), 0);
  } else if (room) {
    disconnectRoom();
  }
}

  
function changeServer(item) {
  // Nitro Mağaza sunucusu seçildiğinde ayar penceresi değil mağaza vitrini açılır.
  setServer(item);
  setChannelId(null);
  setGroups([]);
  setMessages([]);
  setMicError("");
  setChatError("");
  const serverLabel = `${item?.name || ""} ${item?.slug || ""}`.toLocaleLowerCase("tr-TR");
  if (serverLabel.includes("nitro") || serverLabel.includes("mağaza") || serverLabel.includes("magaza")) {
    setServerSettingsOpen(false);
    setActivePage("store");
    setShowFriends(false);
  } else {
    setActivePage("chat");
  }
}


  // Arkadaşlar ekranı
  function FriendsView() {
    return (
      <section className="friends-page">
        <div className="friends-heading">
          <div>
            <h1>Arkadaşlar</h1>
            <p>Arkadaşlarını bul ve VOICE üzerinde bağlantıda kal.</p>
          </div>

          <button
            className="friends-refresh"
            onClick={loadFriends}
            disabled={friendsLoading || friendsBusy}
          >
            <RefreshCw size={16} />
            Yenile
          </button>
        </div>

        <div className="friends-card">
          <h3>Senin arkadaş kodun</h3>
          <p>Arkadaşların seni bu kodla bulabilir.</p>

          <div className="friend-code-row">
            <div className="friend-code-value">
              {myCode || (friendsLoading ? "Yükleniyor..." : "Kod bulunamadı")}
            </div>

            <button
              onClick={copyFriendCode}
              disabled={!myCode}
              className="friends-primary"
            >
              <Copy size={16} />
              Kopyala
            </button>
          </div>
        </div>

        <div className="friends-card">
          <h3><UserPlus size={18} /> Arkadaş ekle</h3>
          <p>Eklemek istediğin kişinin arkadaş kodunu gir.</p>

          <form onSubmit={searchFriend} className="friend-search">
            <input
              value={searchCode}
              onChange={event =>
                setSearchCode(event.target.value.toUpperCase())
              }
              placeholder="Örn: MITO4821"
              maxLength={20}
            />

            <button
              className="friends-primary"
              disabled={friendsBusy}
              type="submit"
            >
              <Search size={16} />
              Bul
            </button>
          </form>

          {searchResult && (
            <FriendPerson profile={searchResult}>
              <button
                className="friends-primary"
                onClick={sendFriendRequest}
                disabled={friendsBusy}
              >
                <UserPlus size={16} />
                Ekle
              </button>
            </FriendPerson>
          )}
        </div>

        {friendsMessage && (
          <div className="friends-message">{friendsMessage}</div>
        )}

        <div className="friends-card">
          <h3>Gelen istekler ({requests.length})</h3>

          {friendsLoading ? (
            <p>Yükleniyor...</p>
          ) : requests.length === 0 ? (
            <p>Bekleyen arkadaşlık isteğin yok.</p>
          ) : (
            requests.map(request => (
              <FriendPerson key={request.id} profile={request.profile}>
                <button
                  className="friend-accept"
                  onClick={() => acceptRequest(request.id)}
                  disabled={friendsBusy}
                  title="Kabul et"
                >
                  <Check size={17} />
                </button>

                <button
                  className="friend-reject"
                  onClick={() => rejectRequest(request.id)}
                  disabled={friendsBusy}
                  title="Reddet"
                >
                  <X size={17} />
                </button>
              </FriendPerson>
            ))
          )}
        </div>

        <div className="friends-card">
          <h3>Arkadaşlarım ({friends.length})</h3>

          {friendsLoading ? (
            <p>Yükleniyor...</p>
          ) : friends.length === 0 ? (
            <p>Henüz arkadaşın yok. Arkadaş koduyla birini ekleyebilirsin.</p>
          ) : (
            friends.map(friend => (
              <FriendPerson key={friend.id} profile={friend}>
                <span className="friend-status">Arkadaş</span>
              </FriendPerson>
            ))
          )}
        </div>

        {outgoing.length > 0 && (
          <div className="friends-card">
            <h3>Gönderilen istekler ({outgoing.length})</h3>
            {outgoing.map(request => (
              <FriendPerson key={request.id} profile={request.profile}>
                <span className="friend-pending">Bekliyor</span>
              </FriendPerson>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="app">
      <style>{`
        .server-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.78);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(6px);
        }

        .server-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 30px;
          border: 1px solid #303541;
          border-radius: 16px;
          background: #191c24;
          color: #fff;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.5);
        }

        .server-modal h2 {
          color: #fff;
          margin: 0 35px 10px 0;
          font-size: 22px;
        }

        .server-modal p {
          color: #9ca3b4;
          margin: 0 0 22px;
          font-size: 14px;
          line-height: 1.5;
        }

        .server-modal input {
          width: 100%;
          padding: 14px;
          border-radius: 9px;
          border: 1px solid #363d4b;
          background: #11141b;
          color: white;
          outline: none;
          font-size: 15px;
          box-sizing: border-box;
        }

        .server-modal input:focus {
          border-color: #6475ff;
        }

        .server-modal-submit {
          width: 100%;
          margin-top: 16px;
          padding: 13px;
          border: none;
          border-radius: 9px;
          background: #5865f2;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }

        .server-modal-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .server-modal-close {
          position: absolute;
          right: 15px;
          top: 15px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #aaa;
          border: none;
          border-radius: 7px;
          cursor: pointer;
        }

        .server-modal-close:hover {
          background: #292e39;
          color: #fff;
        }

        .server-modal-close:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .server-modal-error {
          margin-top: 12px;
          color: #ff7777;
          font-size: 13px;
          line-height: 1.5;
        }

        .server-modal-success {
          margin-top: 12px;
          color: #65d99a;
          font-size: 13px;
          line-height: 1.5;
        }

        .channel-type-options {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .channel-type-options button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 8px;
          border: 1px solid #363d4b;
          border-radius: 9px;
          background: #11141b;
          color: #aaa;
          cursor: pointer;
        }

        .channel-type-options button.selected {
          border-color: #6475ff;
          background: rgba(88, 101, 242, 0.16);
          color: white;
        }

        .channel-type-options button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ptt-mode-option {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 12px;
          color: #c5c9d3;
          font-size: 13px;
          cursor: pointer;
        }

        .ptt-mode-option input {
          width: auto;
          accent-color: #6475ff;
        }

        .ptt-key-settings {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 15px;
          color: #c5c9d3;
          font-size: 13px;
        }

        .ptt-key-button {
          padding: 12px;
          border: 1px solid #5865f2;
          border-radius: 8px;
          background: #252a3b;
          color: white;
          cursor: pointer;
          font-weight: 700;
        }

        .ptt-key-settings small {
          color: #9ca3b4;
        }

        .settings-popup hr {
          border: 0;
          border-top: 1px solid #303541;
          margin: 16px 0;
        }

        .settings-device-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 16px;
        }

        .settings-device-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          color: #c5c9d3;
          font-size: 13px;
        }

        .settings-device-field select {
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #363d4b;
          border-radius: 8px;
          outline: none;
          background: #11141b;
          color: #fff;
          font: inherit;
        }

        .settings-device-field select:focus {
          border-color: #6475ff;
        }

        .settings-device-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          white-space: nowrap;
        }

        @media (max-width: 650px) {
          .settings-device-grid {
            grid-template-columns: 1fr;
          }
        }

        .settings-sidebar { overflow-y: auto; max-height: 100%; }
        .settings-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 13px;
          margin: 5px 0;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #aeb5c4;
          text-align: left;
          font: inherit;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        }

        .settings-nav-item:hover {
          background: #252a36;
          color: #fff;
        }

        .settings-nav-item.active {
          background: rgba(88, 101, 242, 0.16);
          border-color: rgba(100, 117, 255, 0.42);
          color: #fff;
        }

        .settings-nav-item span {
          flex: 1;
        }

        .settings-logout {
          width: 100%;
          margin-top: 14px;
          padding: 10px 12px !important;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 9px;
          border: 1px solid #49343a;
          border-radius: 7px;
          background: #38252b !important;
          color: #ff7777 !important;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .settings-logout:hover {
          background: #573039 !important;
        }

        .voice-profile-editor { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:16px; }
        .voice-profile-preview { width:76px; height:76px; border-radius:50%; display:grid; place-items:center; overflow:hidden; background:#5865f2; color:#fff; font-size:28px; font-weight:800; }
        .voice-profile-preview img { width:100%; height:100%; object-fit:cover; }
        .voice-file-label { display:inline-flex; align-items:center; gap:8px; cursor:pointer; }
        .voice-file-label input { display:none; }
        .settings-help { color:#9ca3b4; font-size:12px; line-height:1.6; margin-top:16px; }
        .voice-settings-notice { margin:12px 0; }
        .voice-theme-options { display:flex; gap:12px; margin-top:18px; flex-wrap:wrap; }
        .voice-theme-options button { display:flex; align-items:center; gap:9px; padding:14px 18px; border:1px solid #363d4b; border-radius:10px; background:#171b25; color:#d9deea; cursor:pointer; }
        .voice-theme-options button.selected { border-color:#6475ff; background:rgba(88,101,242,.18); color:#fff; }
        .voice-shortcut-field { margin-top:14px; }
        .voice-shortcut-field input { padding:11px; border:1px solid #363d4b; border-radius:8px; background:#11141b; color:#fff; font:inherit; }
        body.voice-light-theme { background:#eef1f7 !important; color:#202635 !important; }
        body.voice-light-theme .sidebar, body.voice-light-theme .main-area, body.voice-light-theme .topbar { background:#f8f9fc !important; color:#202635 !important; }
        body.voice-light-theme .settings-modal { background:#f8f9fc !important; color:#202635 !important; }
        body.voice-light-theme .settings-content, body.voice-light-theme .settings-section { color:#202635 !important; }
        body.voice-light-theme .settings-section p, body.voice-light-theme .settings-option-text span, body.voice-light-theme .settings-device-field { color:#596273 !important; }
        body.voice-light-theme .settings-nav-item { color:#4b5565 !important; }
        body.voice-light-theme .settings-device-field select, body.voice-light-theme .voice-shortcut-field input { background:#fff !important; color:#202635 !important; }
      `}</style>

      {channelSettingsOpen && channelSettingsItem && (
        <div className="server-settings-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setChannelSettingsOpen(false); }}>
          <div className="server-settings-window channel-settings-window" role="dialog" aria-modal="true" aria-label="Kanal ayarları">
            <aside className="server-settings-nav">
              <div className="server-settings-nav-title">#{channelSettingsItem.name}<small>{channelSettingsItem.type === "voice" ? "Ses Kanalları" : "Metin Kanalları"}</small></div>
              <div className="server-settings-nav-label">KANAL AYARLARI</div>
              <button className="active" type="button"><span>ⓘ</span><span>Genel Görünüm</span></button>
              <button type="button" onClick={() => setChannelSettingsMessage("Kanal izinleri sunucu rol sistemiyle yönetilir.")}><span>♯</span><span>İzinler</span></button>
              <button type="button" onClick={() => setChannelSettingsMessage("Davet bağlantıları sunucu davet kodundan yönetilir.")}><UserPlus size={15}/><span>Davetler</span></button>
              <button type="button" onClick={() => setChannelSettingsMessage("Bu kanalda henüz entegrasyon yok.")}><span>▣</span><span>Entegrasyonlar</span></button>
              <div className="server-settings-nav-divider"/>
              <button className="danger" type="button" onClick={() => { const item = channelSettingsItem; setChannelSettingsOpen(false); deleteChannel(item); }}><Trash2 size={15}/><span>Kanalı Sil</span></button>
            </aside>
            <main className="server-settings-content channel-settings-content">
              <button className="server-settings-close" onClick={() => setChannelSettingsOpen(false)}><X size={22}/><small>ESC</small></button>
              <h2>Genel Görünüm</h2>
              <label>Kanal Adı</label><input value={channelSettingsDraft.name} maxLength={40} onChange={e => setChannelSettingsDraft(v => ({...v,name:e.target.value}))}/>
              <label>Kanal Başlığı</label><textarea maxLength={1024} value={channelSettingsDraft.topic} onChange={e => setChannelSettingsDraft(v => ({...v,topic:e.target.value}))} placeholder="Bu kanalın nasıl kullanılacağını anlat!" />
              <label>Yavaş Mod</label><select value={channelSettingsDraft.slowmode} onChange={e => setChannelSettingsDraft(v => ({...v,slowmode:e.target.value}))}><option value="0">Kapalı</option><option value="5">5 saniye</option><option value="10">10 saniye</option><option value="15">15 saniye</option><option value="30">30 saniye</option><option value="60">1 dakika</option><option value="300">5 dakika</option><option value="600">10 dakika</option><option value="21600">6 saat</option></select>
              <p className="server-settings-help">Yavaş mod, mesaj gönderme sıklığını belirtilen süreyle sınırlar.</p>
              <label>İçerik Görünürlüğü</label>
              <div className="channel-visibility-options"><label><input type="radio" name="channel-visibility" checked={channelSettingsDraft.visibility === "default"} onChange={() => setChannelSettingsDraft(v => ({...v,visibility:"default"}))}/> <span><b>Varsayılan</b><small>Kanal içeriği her zaman görünür.</small></span></label><label><input type="radio" name="channel-visibility" checked={channelSettingsDraft.visibility === "spoiler"} onChange={() => setChannelSettingsDraft(v => ({...v,visibility:"spoiler"}))}/> <span><b>Spoiler Kanalı</b><small>İçerik, kullanıcı görüntülemeyi seçene kadar gizlenir.</small></span></label><label><input type="radio" name="channel-visibility" checked={channelSettingsDraft.visibility === "age_restricted"} onChange={() => setChannelSettingsDraft(v => ({...v,visibility:"age_restricted"}))}/> <span><b>Yaş Sınırlı Kanal</b><small>Kanal içeriği yaş onayı gerektirir.</small></span></label></div>
              <label>Etkin Olmadığında Gizle</label><select value={channelSettingsDraft.hideInactive} onChange={e => setChannelSettingsDraft(v => ({...v,hideInactive:e.target.value}))}><option value="0">Asla</option><option value="1">1 gün</option><option value="3">3 gün</option><option value="7">1 hafta</option><option value="14">2 hafta</option><option value="30">1 ay</option></select>
              <p className="server-settings-help">Yeni alt başlıklar belirtilen süre boyunca aktif olmazsa kanal listesinde gösterilmeyecek.</p>
              <button className="server-settings-save" disabled={serverBusy} onClick={saveChannelSettings}>{serverBusy ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}</button>
              {channelSettingsMessage && <p className="server-settings-feedback">{channelSettingsMessage}</p>}
            </main>
          </div>
        </div>
      )}

      {serverSettingsOpen && server && (
        <div className="server-settings-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setServerSettingsOpen(false); }}>
          <div className="server-settings-window" role="dialog" aria-modal="true" aria-label="Sunucu ayarları">
            <aside className="server-settings-nav">
              <div className="server-settings-nav-title">{server.name}<small>Sunucu Ayarları</small></div>
              <div className="server-settings-nav-label">{server.name.toLocaleUpperCase("tr-TR")} YÖNETİM</div>
              {[['general','Genel Görünüm'],['permissions','İzinler'],['invites','Davetler'],['integrations','Entegrasyonlar']].map(([key,label]) => <button key={key} className={activeServerSettingsTab===key?"active":""} onClick={()=>{setActiveServerSettingsTab(key);setServerSettingsMessage("");}}>{key==="general"?"●":key==="permissions"?"＃":key==="invites"?"♟":"▣"}<span>{label}</span></button>)}
              <div className="server-settings-nav-divider"/>
              <button className="danger" onClick={()=>{setServerSettingsOpen(false);deleteServer();}}>▣<span>Sunucuyu Sil</span></button>
            </aside>
            <main className="server-settings-content">
              <button className="server-settings-close" onClick={()=>setServerSettingsOpen(false)}><X size={22}/><small>ESC</small></button>
              {activeServerSettingsTab === "general" && <>
                <h2>Genel Görünüm</h2>
                <label>Sunucu Adı</label><input value={serverNameDraft} maxLength={32} onChange={e=>setServerNameDraft(e.target.value)} placeholder="Sunucu adı"/>
                <label>Sunucu Simgesi (emoji)</label><input value={serverIconDraft} maxLength={8} onChange={e=>setServerIconDraft(e.target.value)} placeholder="🎮"/>
                <button className="server-settings-save" disabled={serverBusy} onClick={saveServerSettings}>{serverBusy?"Kaydediliyor…":"Değişiklikleri Kaydet"}</button>
                {serverSettingsMessage && <p className="server-settings-feedback">{serverSettingsMessage}</p>}
                <label>Sunucu Davet Kodu</label><div className="server-settings-code"><input value={server.invite_code || ""} readOnly/><button onClick={copyServerCode}><Copy size={16}/> Kopyala</button></div>
                <label>Kanallar</label><div className="server-settings-info">{allChannels.length} kanal · {allChannels.filter(c=>c.type==="voice").length} ses kanalı · {allChannels.filter(c=>c.type!=="voice").length} metin kanalı</div>
              </>}
              {activeServerSettingsTab === "permissions" && <><h2>İzinler</h2><p>Sunucu erişimi ve yönetim izinleri veritabanındaki sunucu üyeliği politikalarıyla korunur.</p><div className="server-settings-info">Kanal ve sunucu silme/düzenleme işlemleri yalnızca veritabanı politikalarının izin verdiği yetkili hesaplarda çalışır. Bu projede ayrı rol yönetimi tablosu bulunmadığından burada rol atama yapılmaz.</div></>}
              {activeServerSettingsTab === "invites" && <><h2>Davetler</h2><p>Arkadaşlarını bu sunucuya davet etmek için aşağıdaki kodu paylaş.</p><div className="server-settings-code"><input value={server.invite_code || ""} readOnly/><button onClick={copyServerCode}><Copy size={16}/> Kodu Kopyala</button></div></>}
              {activeServerSettingsTab === "integrations" && <><h2>Entegrasyonlar</h2><p>Bu sunucuya bağlı uygulamalar ve botlar.</p><div className="server-settings-info">Henüz entegrasyon yönetimi/verisi uygulamaya eklenmemiş.</div></>}
            </main>
          </div>
        </div>
      )}

      {/* Kanal oluşturma penceresi */}
      {channelModal && (
        <div
          className="server-modal-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              closeChannelModal();
            }
          }}
        >
          <div className="server-modal">
            <button
              className="server-modal-close"
              onClick={closeChannelModal}
              disabled={serverBusy}
              title="Kapat"
            >
              <X size={20} />
            </button>

            <h2>Yeni Kanal Oluştur</h2>
            <p>Sunucun için yeni bir kanal oluştur.</p>

            <input
              autoFocus
              value={channelNameInput}
              onChange={event => {
                setChannelNameInput(event.target.value);
                setChannelModalMessage("");
              }}
              onKeyDown={event => {
                if (event.key === "Enter") { event.preventDefault(); createChannel(); }
                if (event.key === "Escape") closeChannelModal();
              }}
              placeholder="Kanal adı..."
              maxLength={40}
              disabled={serverBusy}
            />

            <div className="channel-type-options">
              <button
                type="button"
                className={channelTypeInput === "text" ? "selected" : ""}
                onClick={() => setChannelTypeInput("text")}
                disabled={serverBusy}
              >
                <Hash size={18} />
                Yazı Kanalı
              </button>

              <button
                type="button"
                className={channelTypeInput === "voice" ? "selected" : ""}
                onClick={() => setChannelTypeInput("voice")}
                disabled={serverBusy}
              >
                <Volume2 size={18} />
                Ses Kanalı
              </button>
            </div>

            {channelModalMessage && (
              <div className="server-modal-error">
                {channelModalMessage}
              </div>
            )}

            <button
              className="server-modal-submit"
              disabled={serverBusy}
              onClick={createChannel}
            >
              {serverBusy ? "Oluşturuluyor..." : "Kanal Oluştur"}
            </button>
          </div>
        </div>
      )}

      {/* Sunucu oluşturma / katılma penceresi */}
      {serverModal && (
        <div
          className="server-modal-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              closeServerModal();
            }
          }}
        >
          <div className="server-modal">
            <button
              className="server-modal-close"
              onClick={closeServerModal}
              disabled={serverBusy}
              title="Kapat"
            >
              <X size={20} />
            </button>

            <h2>
              {serverModal === "create"
                ? "Yeni Sunucu Oluştur"
                : "Davet Koduyla Katıl"}
            </h2>

            <p>
              {serverModal === "create"
                ? "Sunucuna bir isim belirle."
                : "Katılmak istediğin sunucunun davet kodunu gir."}
            </p>

            <input
              autoFocus
              value={serverModalInput}
              onChange={event => {
                setServerModalInput(
                  serverModal === "join"
                    ? event.target.value.toUpperCase()
                    : event.target.value
                );
                setServerModalMessage("");
              }}
              onKeyDown={event => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (serverModalSuccess) {
                    closeServerModal();
                  } else {
                    serverModal === "create"
                      ? createServer()
                      : joinServer();
                  }
                }

                if (event.key === "Escape") {
                  closeServerModal();
                }
              }}
              placeholder={
                serverModal === "create"
                  ? "Sunucu adı..."
                  : "Davet kodu..."
              }
              maxLength={serverModal === "create" ? 32 : 64}
              disabled={serverBusy || serverModalSuccess}
            />

            {serverModalMessage && (
              <div
                className={
                  serverModalSuccess
                    ? "server-modal-success"
                    : "server-modal-error"
                }
              >
                {serverModalMessage}
              </div>
            )}

            <button
              className="server-modal-submit"
              disabled={serverBusy}
              onClick={() => {
                if (serverModalSuccess) {
                  closeServerModal();
                } else if (serverModal === "create") {
                  createServer();
                } else {
                  joinServer();
                }
              }}
            >
              {serverBusy
                ? "İşleniyor..."
                : serverModalSuccess
                  ? "Tamam"
                  : serverModal === "create"
                    ? "Sunucuyu Oluştur"
                    : "Sunucuya Katıl"}
            </button>
          </div>
        </div>
      )}

      <nav className="discord-rail" aria-label="Ana gezinme">
        <button className="rail-home active" title="VOICE Ana Sayfa" onClick={() => { setActivePage("home"); setShowFriends(false); }}><Radio size={23}/></button>
        <div className="rail-divider" />
        {servers.map(item => <button key={item.id} className={`rail-server ${server?.id === item.id ? "selected" : ""}`} title={item.name} onClick={() => { changeServer(item); setShowFriends(false); }}><span>{item.icon || "🎮"}</span></button>)}
        <button className="rail-add" title="Sunucu oluştur" onClick={() => openServerModal("create")}><Plus size={22}/></button>
        <button className="rail-discover" title="Keşfet" onClick={() => setActivePage("discover")}><Search size={20}/></button>
      </nav>

      <aside className={`sidebar ${server && activePage === "chat" ? "server-mode" : ""}`}>
        {server && activePage === "chat" && (
          <div className="server-mode-panel">
            <div className="server-mode-title-row">
              <button className="server-mode-title" onClick={copyServerCode} title="Sunucu davet kodunu kopyala">
                <span>{server.name}</span><ChevronDown size={16}/>
              </button>
              <button className="server-settings-mini" title="Sunucu ayarları" aria-label="Sunucu ayarları" onClick={() => { setServerNameDraft(server.name || ""); setServerIconDraft(server.icon || "🎮"); setServerSettingsMessage(""); setActiveServerSettingsTab("general"); setServerSettingsOpen(true); }}><Settings size={15}/></button>
            </div>
            <button className="server-mode-link" onClick={() => setActivePage("events")}><CalendarDays size={16}/> Etkinlikler</button>
            <button className="server-mode-link" onClick={copyServerCode}><Shield size={16}/> Sunucu Takviyeleri</button>
            <div className="server-mode-divider"/>
            <div className="server-mode-category"><span>Metin Kanalları</span><button onClick={openChannelModal} title="Metin kanalı ekle"><Plus size={16}/></button></div>
            {groups.filter(group => group.channels.some(ch => ch.type !== "voice")).map(group => group.channels.filter(ch => ch.type !== "voice").map(item => (
              <div className={`server-mode-channel-row ${channelId === item.id ? "selected" : ""}`} key={item.id}><button className="server-mode-channel" onClick={() => changeChannel(item.id)}><Hash size={16}/><span>{item.name}</span></button><button className="server-mode-channel-gear" title="Kanal ayarları" aria-label={`${item.name} kanal ayarları`} onClick={() => openChannelSettings(item)}><Settings size={13}/></button></div>
            )))}
            <div className="server-mode-category"><span>Ses Kanalları</span><button onClick={openChannelModal} title="Ses kanalı ekle"><Plus size={16}/></button></div>
            {groups.filter(group => group.channels.some(ch => ch.type === "voice")).map(group => group.channels.filter(ch => ch.type === "voice").map(item => (
              <div className={`server-mode-channel-row ${channelId === item.id ? "selected" : ""}`} key={item.id}><button className="server-mode-channel" onClick={() => changeChannel(item.id)}><Volume2 size={16}/><span>{item.name}</span>{connected && channelId === item.id && <small>{participants.length}</small>}</button><button className="server-mode-channel-gear" title="Kanal ayarları" aria-label={`${item.name} kanal ayarları`} onClick={() => openChannelSettings(item)}><Settings size={13}/></button></div>
            )))}
            {!groups.length && <div className="server-mode-empty">Kanallar yükleniyor...</div>}
          </div>
        )}
        <div className="discord-search"><Search size={15}/><span>Sohbet bul ya da başlat</span></div>
        <div className="discord-nav-links">
          <button onClick={() => { setActivePage("friends"); setShowFriends(true); }} className={activePage === "friends" ? "active" : ""}><Users size={17}/> Arkadaşlar</button>
          <button onClick={() => { setActivePage("home"); setShowFriends(false); }} className={activePage === "home" ? "active" : ""}><span className="nitro-mark">◉</span> Nitro <small>1 AY ÜCRETSİZ</small></button>
          <button onClick={() => setActivePage("store")} className={activePage === "store" ? "active" : ""}><Palette size={17}/> Mağaza</button>
          <button onClick={() => setActivePage("tasks")} className={activePage === "tasks" ? "active" : ""}><Shield size={17}/> Görevler</button>
        </div>
        <div className="discord-dm-heading"><span>Direkt Mesajlar</span><button title="Arkadaş ekle, arkadaş listesi ve istekler" onClick={() => { setActivePage("friends"); setShowFriends(true); loadFriends(); }}><Plus size={16}/></button></div>
        <div className="discord-dm-list">
          {friends.slice(0, 12).map(friend => <button key={friend.id} className={activePage === "dm" && selectedDMFriend?.id === friend.id ? "active" : ""} onClick={() => { setSelectedDMFriend(friend); setActivePage("dm"); setShowFriends(false); }}><span className="dm-avatar">{(friend.username || "?").charAt(0).toUpperCase()}</span><span className="dm-friend-label"><strong>{friend.username || "Kullanıcı"}</strong><small>{friend.friend_code || ""}</small></span></button>)}
          {friends.length === 0 && <span className="dm-empty">Arkadaşların burada görünecek</span>}
        </div>
        <div className="logo legacy-logo">
          <div className="logo-icon"><Radio size={24} /></div>
          <span>VOICE</span>
        </div>

        <div className="sidebar-title">SUNUCULAR</div>

        <div className="server-list">
          {servers.map(item => (
            <button
              key={item.id}
              className={`server-button ${
                server?.id === item.id ? "active" : ""
              }`}
              onClick={() => changeServer(item)}
            >
              <span className="server-emoji">{item.icon || "🎮"}</span>
              <span className="server-name">{item.name}</span>
            </button>
          ))}

          {serverLoading && <p className="sidebar-title">Yükleniyor...</p>}
        </div>

        <button
          className="add-server"
          onClick={() => openServerModal("create")}
          disabled={serverBusy}
        >
          <Plus size={18} />
          {serverBusy ? "İşleniyor..." : "Sunucu Oluştur"}
        </button>

        <button
          className="add-server"
          onClick={() => openServerModal("join")}
          disabled={serverBusy}
        >
          <UserPlus size={18} />
          Davet Koduyla Katıl
        </button>

        {!userId && (
          <p className="sidebar-title">
            Oturum bulunamadı. Tekrar giriş yap.
          </p>
        )}

        <div className="sidebar-bottom">
          {connected && <div className="left-voice-dock">
            <div className="left-voice-status"><span className="status-dot connected"/><div><strong>Ses Bağlantısı Kuruldu</strong><small>{channel?.name || "Ses kanalında"}</small></div><button type="button" className="dock-disconnect" onClick={disconnectRoom} title="Ses kanalından ayrıl"><PhoneOff size={15}/></button></div>
            <div className="dock-audio-controls" aria-label="Ses kontrolleri">
              <button type="button" className={`control-button ${muted ? "muted" : ""}`} onClick={toggleMicrophone} title={micMode === "ptt" ? `Bas-konuş: ${pttKey} tuşuna basılı tut` : muted ? "Mikrofonu aç" : "Mikrofonu kapat"}>{muted ? <MicOff size={18}/> : <Mic size={18}/>}</button>
              <button type="button" className={`control-button ${deafened ? "muted" : ""}`} onClick={toggleDeafened} title={deafened ? "Sesi aç" : "Kulaklığı sustur"}><Headphones size={18}/></button>
              <button type="button" className="control-button settings-control" onClick={() => { setNameInput(userName); setMicError(""); setShowSettings(!showSettings); }} title="Ses ayarları"><Settings size={18}/></button>
            </div>
          </div>}
          <div className="profile">
            <div className="avatar">{profileAvatar ? <img src={profileAvatar} alt="Profil" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}} /> : userName.charAt(0).toUpperCase()}</div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <span className="profile-friend-code">{myCode ? `Arkadaş kodu: ${myCode}` : (privacySettings.showOnline ? "Çevrimiçi" : "Durum gizli")}</span>
            </div>

            <button
              className="icon-button"
              onClick={() => {
                setNameInput(userName);
                setMicError("");
                setShowSettings(!showSettings);
              }}
              title="Hesap ayarları"
            >
              <Settings size={19} />
            </button>
          </div>

         
{showSettings && (
  <div
    className="settings-overlay"
    onMouseDown={event => {
      if (event.target === event.currentTarget) {
        setShowSettings(false);
      }
    }}
  >
    <div className="settings-modal">
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">VOICE CONTROL PANEL</span>
          <h2>{({account:"Hesap Ayarları",profile:"Profil Ayarları",microphone:"Mikrofon Ayarları",noise:"Gürültü Engelleme",sound:"Ses Çıkışı Ayarları",notifications:"Bildirim Ayarları",appearance:"Görünüm Ayarları",privacy:"Gizlilik Ayarları",shortcuts:"Klavye Kısayolları",app:"Uygulama Ayarları"})[activeSettingsTab]}</h2>
          <p>
            {activeSettingsTab === "account" ? "Hesabını ve oturumunu yönet."
              : activeSettingsTab === "noise" ? "Mikrofonunun arka plan seslerini azalt."
              : activeSettingsTab === "microphone" ? "Mikrofon cihazını ve konuşma biçimini ayarla."
              : activeSettingsTab === "sound" ? "Hoparlör ve kulaklık gibi ses çıkışlarını yönet."
              : "VOICE tercihlerini bu bölümden düzenle."}
          </p>
        </div>

        <button
          type="button"
          className="settings-close"
          onClick={() => setShowSettings(false)}
          aria-label="Ayarları kapat"
        >
          ×
        </button>
      </div>

      <div className="settings-body">
        <aside className="settings-sidebar">
          <div className="settings-sidebar-title">AYAR KATEGORİLERİ</div>
          {[
            ["account", "Hesabım", Settings], ["profile", "Profil", UserCircle],
            ["microphone", "Mikrofon", Mic], ["noise", "Gürültü Engelleme", AudioWaveform],
            ["sound", "Ses Çıkışı", Volume2], ["notifications", "Bildirimler", Bell],
            ["appearance", "Görünüm", Palette], ["privacy", "Gizlilik", Lock],
            ["shortcuts", "Kısayollar", Keyboard], ["app", "Uygulama", SlidersHorizontal]
          ].map(([id, label, Icon]) => (
            <button key={id} type="button"
              className={`settings-nav-item ${activeSettingsTab === id ? "active" : ""}`}
              onClick={() => { setActiveSettingsTab(id); setSettingsNotice(""); }}>
              <Icon size={17} /><span>{label}</span>
            </button>
          ))}
          <div className="settings-sidebar-note">
            {activeSettingsTab === "noise" ? "Mikrofonun arka plan seslerini azaltan gerçek ses yakalama filtreleri." : "Tercihlerin bu cihazda saklanır. Ses kanalına bağlı kalmaya devam edersin."}
          </div>
        </aside>

        <main className="settings-content">
          {activeSettingsTab === "account" && (
            <>
              <section className="settings-section">
                <div className="settings-section-heading">
                  <div>
                    <h3>Hesap Bilgileri</h3>
                    <p>Uygulamada görünen kullanıcı adını değiştir.</p>
                  </div>
                </div>

                <label htmlFor="voice-user-name">Kullanıcı adı</label>
                <div className="settings-input-row">
                  <input
                    id="voice-user-name"
                    type="text"
                    value={nameInput}
                    maxLength={32}
                    onChange={event => setNameInput(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Enter") saveUserName();
                    }}
                    placeholder="İsmini yaz..."
                  />

                  <button
                    type="button"
                    className="settings-save"
                    onClick={saveUserName}
                  >
                    İsmi Kaydet
                  </button>
                </div>

                {micError && (
                  <div className="settings-error">{micError}</div>
                )}
              </section>

              <div className="settings-divider" />

              <section className="settings-section settings-account-actions">
                <div>
                  <h3>Hesap İşlemleri</h3>
                  <p>VOICE hesabından güvenli şekilde çıkış yap.</p>
                </div>

                <button
                  type="button"
                  className="settings-logout"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  Çıkış Yap
                </button>
              </section>
            </>
          )}

          {activeSettingsTab === "microphone" && (
            <>
              <section className="settings-section">
                <div className="settings-section-heading">
                  <div>
                    <h3>Konuşma Modu</h3>
                    <p>Mikrofonunun nasıl çalışacağını belirle.</p>
                  </div>
                </div>

                <label className="settings-option">
                  <div className="settings-option-text">
                    <strong>Normal mikrofon</strong>
                    <span>Mikrofonu kontrol çubuğundan açıp kapatabilirsin.</span>
                  </div>
                  <input
                    type="radio"
                    name="voice-mic-mode"
                    checked={micMode === "voice"}
                    onChange={() => {
                      localStorage.setItem("voiceMicMode", "voice");
                      setMicMode("voice");
                      setCapturingPttKey(false);
                      setMuted(true);
                      if (room) room.localParticipant.setMicrophoneEnabled(false).catch(error => console.error(error));
                    }}
                  />
                </label>

                <label className="settings-option">
                  <div className="settings-option-text">
                    <strong>Bas-Konuş</strong>
                    <span>Yalnızca belirlediğin tuşa bastığında konuşursun.</span>
                  </div>
                  <input
                    type="radio"
                    name="voice-mic-mode"
                    checked={micMode === "ptt"}
                    onChange={() => {
                      localStorage.setItem("voiceMicMode", "ptt");
                      setMicMode("ptt");
                      setCapturingPttKey(false);
                      setMuted(true);
                      if (room) room.localParticipant.setMicrophoneEnabled(false).catch(error => console.error(error));
                    }}
                  />
                </label>

                {micMode === "ptt" && (
                  <div className="settings-ptt-box">
                    <div>
                      <strong>Bas-Konuş tuşu</strong>
                      <p>Konuşmak için kullanacağın klavye tuşunu seç.</p>
                    </div>
                    <button
                      type="button"
                      className="ptt-key-button"
                      onClick={() => { setMicError(""); setCapturingPttKey(true); }}
                      onKeyDown={capturingPttKey ? capturePttKey : undefined}
                    >
                      {capturingPttKey ? "Bir tuşa bas..." : `${pttKey} tuşu`}
                    </button>
                    {capturingPttKey && <small>Yeni tuşu seçmek için klavyeden bir tuşa bas.</small>}
                  </div>
                )}
              </section>

              <div className="settings-divider" />

              <section className="settings-section">
                <div className="settings-section-heading">
                  <div>
                    <h3>Mikrofon Cihazı</h3>
                    <p>Kullanmak istediğin mikrofonu seç.</p>
                  </div>
                  <button type="button" className="ptt-key-button settings-device-refresh" onClick={loadAudioDevices}>
                    <RefreshCw size={15} /> Yenile
                  </button>
                </div>
                <div className="settings-device-grid">
                  <label className="settings-device-field">
                    <span>Giriş aygıtı</span>
                    <select value={selectedInput} onChange={event => changeAudioInput(event.target.value)}>
                      <option value="">Varsayılan mikrofon</option>
                      {audioInputs.map((device, index) => (
                        <option key={device.deviceId || index} value={device.deviceId}>
                          {device.label || `Mikrofon ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {deviceError && <div className="settings-error">{deviceError}</div>}
              </section>
            </>
          )}

          {activeSettingsTab === "sound" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <div>
                  <h3>Ses Çıkış Aygıtı</h3>
                  <p>Diğer kullanıcıların sesini hangi cihazdan duyacağını seç.</p>
                </div>
                <button type="button" className="ptt-key-button settings-device-refresh" onClick={loadAudioDevices}>
                  <RefreshCw size={15} /> Yenile
                </button>
              </div>
              <div className="settings-device-grid">
                <label className="settings-device-field">
                  <span>Hoparlör / Kulaklık</span>
                  <select value={selectedOutput} onChange={event => changeAudioOutput(event.target.value)}>
                    <option value="">Varsayılan ses çıkışı</option>
                    {audioOutputs.map((device, index) => (
                      <option key={device.deviceId || index} value={device.deviceId}>
                        {device.label || `Ses çıkışı ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {deviceError && <div className="settings-error">{deviceError}</div>}
              <p className="settings-sidebar-note">Ses çıkışını değiştirmek mevcut ses bağlantını kapatmaz.</p>
            </section>
          )}

          {activeSettingsTab === "profile" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Profil Fotoğrafı</h3><p>Bu cihazda görünen profil resmini değiştir.</p></div></div>
              <div className="voice-profile-editor">
                <div className="voice-profile-preview">{profileAvatar ? <img src={profileAvatar} alt="Profil fotoğrafı" /> : userName.charAt(0).toUpperCase()}</div>
                <label className="settings-save voice-file-label"><ImagePlus size={16}/> Fotoğraf Seç<input type="file" accept="image/*" onChange={handleAvatarSelect} /></label>
                {profileAvatar && <button type="button" className="ptt-key-button" onClick={() => { localStorage.removeItem("voiceProfileAvatar"); setProfileAvatar(""); setSettingsNotice("Profil fotoğrafı kaldırıldı."); }}>Fotoğrafı Kaldır</button>}
              </div>
              <p className="settings-help">PNG, JPG veya WEBP • En fazla 1 MB. Fotoğraf şu anda yalnızca bu cihazda saklanır.</p>
            </section>
          )}

          {activeSettingsTab === "noise" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Mikrofon Gürültü Engelleme</h3><p>Tarayıcının/işletim sisteminin desteklediği gerçek ses yakalama filtrelerini kullanır.</p></div></div>
              <label className="settings-option"><div className="settings-option-text"><strong>Gürültü engelleme</strong><span>Fan, klavye ve sabit arka plan seslerini azaltmaya yardımcı olur.</span></div><input type="checkbox" checked={!!noiseSettings.enabled} onChange={e => updateNoiseSettings({enabled:e.target.checked})}/></label>
              <label className="settings-option"><div className="settings-option-text"><strong>Yankı engelleme</strong><span>Hoparlörden mikrofona geri dönen sesi azaltır.</span></div><input type="checkbox" checked={!!noiseSettings.echoCancellation} onChange={e => updateNoiseSettings({echoCancellation:e.target.checked})}/></label>
              <label className="settings-option"><div className="settings-option-text"><strong>Otomatik mikrofon seviyesi</strong><span>Konuşma sesini otomatik dengelemeye çalışır.</span></div><input type="checkbox" checked={!!noiseSettings.autoGainControl} onChange={e => updateNoiseSettings({autoGainControl:e.target.checked})}/></label>
              <p className="settings-help">Not: Bu ayarlar cihazın desteklediği WebRTC filtreleridir. RNNoise/AI tabanlı ayrı bir gürültü temizleme motoru bu dosyada bulunmuyor; hassasiyet seviyesi de standart mikrofon API'siyle ayarlanamaz.</p>
            </section>
          )}

          {activeSettingsTab === "notifications" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Bildirim Tercihleri</h3><p>Masaüstü bildirim iznini ve tercihlerini yönet.</p></div></div>
              <button type="button" className="ptt-key-button" onClick={enableDesktopNotifications}>Masaüstü Bildirim İzni Ver</button>
              <label className="settings-option"><div className="settings-option-text"><strong>Masaüstü bildirimleri</strong><span>Uygulama içi bildirim özelliği etkinleştirildiğinde kullanılır.</span></div><input type="checkbox" checked={!!notificationSettings.desktop} onChange={e => updateNotificationSettings({desktop:e.target.checked})}/></label>
              <label className="settings-option"><div className="settings-option-text"><strong>Mesaj bildirimleri</strong><span>Yeni mesaj bildirim tercihi.</span></div><input type="checkbox" checked={!!notificationSettings.messages} onChange={e => updateNotificationSettings({messages:e.target.checked})}/></label>
              <label className="settings-option"><div className="settings-option-text"><strong>Arkadaşlık isteği bildirimleri</strong><span>Yeni arkadaşlık isteği bildirim tercihi.</span></div><input type="checkbox" checked={!!notificationSettings.friendRequests} onChange={e => updateNotificationSettings({friendRequests:e.target.checked})}/></label>
              <label className="settings-option"><div className="settings-option-text"><strong>Bildirim sesleri</strong><span>Bildirim sesi tercihi.</span></div><input type="checkbox" checked={!!notificationSettings.sounds} onChange={e => updateNotificationSettings({sounds:e.target.checked})}/></label>
              <p className="settings-help">Bildirim tercihleri kaydedilir. Mesaj/arkadaşlık olaylarına bildirim göndermek için uygulamanın ilgili olay akışlarına ayrıca bildirim tetikleyicisi bağlanmalıdır.</p>
            </section>
          )}

          {activeSettingsTab === "appearance" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Görünüm Teması</h3><p>Uygulamanın arayüz temasını seç.</p></div></div>
              <div className="voice-theme-options">
                <button type="button" className={appearance === "dark" ? "selected" : ""} onClick={() => changeAppearance("dark")}><Moon size={20}/> Koyu Tema</button>
                <button type="button" className={appearance === "light" ? "selected" : ""} onClick={() => changeAppearance("light")}><Sun size={20}/> Açık Tema</button>
              </div>
              <p className="settings-help">Tema tercihi kaydedilir ve uygulama yeniden açıldığında korunur.</p>
            </section>
          )}

          {activeSettingsTab === "privacy" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Gizlilik Tercihleri</h3><p>Yerel arayüzde gösterilecek durum bilgilerini seç.</p></div></div>
              <label className="settings-option"><div className="settings-option-text"><strong>Çevrimiçi durum etiketini göster</strong><span>Profil alanındaki çevrimiçi metnini kontrol eder.</span></div><input type="checkbox" checked={!!privacySettings.showOnline} onChange={e => updatePrivacySettings({showOnline:e.target.checked})}/></label>
              <label className="settings-option"><div className="settings-option-text"><strong>Etkinlik bilgisini göster</strong><span>Gelecekte eklenecek etkinlik göstergesi için yerel tercih.</span></div><input type="checkbox" checked={!!privacySettings.showActivity} onChange={e => updatePrivacySettings({showActivity:e.target.checked})}/></label>
              <p className="settings-help">Bunlar şu an yalnızca bu cihazdaki arayüz tercihidir; sunucu tarafındaki görünürlüğü veya diğer kullanıcılara veri erişimini değiştirmez.</p>
            </section>
          )}

          {activeSettingsTab === "shortcuts" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Klavye Kısayolları</h3><p>VOICE açık olduğu sürece arka planda da çalışır. Tuşlara başka uygulamalarda da basabilirsin.</p></div></div>
              {[["mute","Mikrofonu aç/kapat"],["deafen","Kulaklığı sustur/aç"],["settings","Ayarları aç/kapat"]].map(([id,label]) => <label className="settings-device-field voice-shortcut-field" key={id}><span>{label}</span><input value={shortcutSettings[id]} maxLength={12} onChange={e => updateShortcut(id,e.target.value)} /></label>)}
              <p className="settings-help">Kısayollar sistem genelinde dinlenir. Bas-Konuş modunda mikrofon aç/kapat kısayolu yerine Mikrofon bölümünde seçtiğin Bas-Konuş tuşu kullanılır.</p>
            </section>
          )}

          {activeSettingsTab === "app" && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h3>Uygulama Tercihleri</h3><p>VOICE uygulamasının yerel tercihlerini yönet.</p></div></div>
              <div className="settings-option"><div className="settings-option-text"><strong>Ses bağlantısını koru</strong><span>Ayarlar penceresini açıp kapatmak LiveKit bağlantısını kesmez.</span></div><Shield size={20}/></div>
              <button type="button" className="ptt-key-button" onClick={() => { if (window.confirm("Bu cihazdaki VOICE görünüm, bildirim, gizlilik ve kısayol tercihleri sıfırlansın mı?")) { ["voiceAppearance","voiceNotificationSettings","voicePrivacySettings","voiceShortcutSettings","voiceNoiseSettings"].forEach(key => localStorage.removeItem(key)); setAppearance("dark"); setNotificationSettings({desktop:true,messages:true,friendRequests:true,sounds:true}); setPrivacySettings({showOnline:true,showActivity:true}); setShortcutSettings({mute:"M",deafen:"D",settings:"O"}); setNoiseSettings({enabled:true,echoCancellation:true,autoGainControl:true}); setSettingsNotice("Yerel tercihler varsayılan değerlere döndürüldü."); } }}>Ayarları Varsayılana Döndür</button>
              <p className="settings-help">Windows açılışında otomatik başlatma bu React dosyasından güvenli şekilde değiştirilemez; Electron main/preload tarafına ek destek gerekir.</p>
            </section>
          )}
          {settingsNotice && <div className="settings-error voice-settings-notice">{settingsNotice}</div>}
        </main>
      </div>

      <div className="settings-footer">
        <span>VOICE • {({account:"Hesap",profile:"Profil",microphone:"Mikrofon",noise:"Gürültü Engelleme",sound:"Ses Çıkışı",notifications:"Bildirimler",appearance:"Görünüm",privacy:"Gizlilik",shortcuts:"Kısayollar",app:"Uygulama"})[activeSettingsTab]} Ayarları</span>
        <button
          type="button"
          onClick={() => setShowSettings(false)}
        >
          Tamam
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </aside>

      <main className="main-area">
        {(activePage === "home" || activePage === "news" || activePage === "perks" || activePage === "plans" || activePage === "compare") && <header className="nitro-topbar">
          <div className="nitro-brand"><span>◉</span></div>
          <nav className="nitro-tabs">
            <button className={activePage === "home" ? "active" : ""} onClick={() => { setActivePage("home"); setShowFriends(false); }}>Ana Sayfa</button>
            <button onClick={() => setActivePage("news")}>Yenilikler</button>
            <button onClick={() => setActivePage("perks")}>Nitro'nun En İyileri</button>
            <button onClick={() => setActivePage("plans")}>Planlar</button>
            <button onClick={() => setActivePage("compare")}>Karşılaştır</button>
          </nav>
          <div className="nitro-actions"><button className="nitro-heart" title="Favoriler">♡</button><button className="nitro-gift">♙ Nitro Hediye Et</button></div>
        </header>}

        {activePage === "store" ? (
          <StorePage />
        ) : activePage === "plans" ? (
          <NitroPlansPage />
        ) : activePage === "home" || activePage === "news" || activePage === "perks" || activePage === "compare" ? (
          <div className="nitro-home">
            <section className="nitro-hero">
              <span className="hero-pill">VOICE NITRO • PREMIUM ÜYELİK</span>
              <div className="hero-spark hero-spark-left">✦</div><div className="hero-spark hero-spark-right">ϟ</div>
              <div className="hero-orb">✦</div>
              <div className="hero-copy"><h1>NITRO İLE BİR DÜNYA<br/>DOLUSU AVANTAJIN<br/>KİLİDİNİ AÇ</h1><button onClick={() => setActivePage("plans")} className="hero-cta">◆ Nitro planlarını incele</button><p>Aylık ve yıllık üyelik seçenekleri. Temel VOICE özellikleri herkese açık.</p></div>
              <div className="hero-mascot">🤖</div>
            </section>
            <section className="nitro-updates"><h2>YENİLİKLER</h2><div className="nitro-feature-card"><div className="feature-copy"><span className="feature-label">▶ Premium</span><h3>Premium ile sohbet deneyimini bir üst seviyeye çıkar</h3><p>VOICE ile daha yüksek kaliteli sesli sohbet, daha fazla kişiselleştirme ve topluluğunla bağlantıda kalmanın yeni yolları.</p><button onClick={() => setActivePage("plans")}>Teklifin Kilidini Aç</button></div><div className="feature-art"><div className="feature-device">VOICE</div><div className="feature-preview"><span>● Canlı Ses Kanalı</span><strong>Topluluğunla bağlantıda kal</strong><div className="preview-controls">Ⅱ　◉　♫</div></div></div></div>
              <div className="nitro-mini-grid"><article><span>✦</span><h3>Profilini kişiselleştir</h3><p>VOICE kimliğini kendi tarzına göre düzenle.</p></article><article><span>♫</span><h3>Sesli sohbetin keyfini çıkar</h3><p>Arkadaşlarınla kesintisiz bağlantıda kal.</p></article></div>
            </section>
          </div>
        ) : activePage === "tasks" ? (
          <section className="voice-tasks-page">
            <div className="voice-tasks-heading"><span>VOICE ÖDÜLLERİ</span><h1>Görevler ve Rozetler</h1><p>Görevleri tamamla, rozetleri kazan ve profil koleksiyonuna ekle.</p></div>
            <div className="voice-task-summary"><div><strong>{taskProgress.claimed.length}/{taskDefinitions.length}</strong><span>Kazanılan rozet</span></div><div><strong>{taskProgress.messages}</strong><span>Gönderilen mesaj</span></div><div><strong>{taskProgress.voiceJoins}</strong><span>Ses bağlantısı</span></div></div>
            <h2 className="voice-task-section-title">Günlük görevler</h2>
            <div className="voice-task-grid">{taskDefinitions.map(task => { const progress = Math.min(taskProgress[task.key] || 0, task.target); const complete = progress >= task.target; const claimed = (taskProgress.claimed || []).includes(task.id); return <article className="voice-task-card" key={task.id}><div className="voice-task-badge">{task.badge}</div><div className="voice-task-copy"><h3>{task.title}</h3><p>{task.description}</p><div className="voice-task-progress"><span style={{width:`${progress/task.target*100}%`}}/></div><small>{progress}/{task.target}</small></div><button disabled={!complete || claimed} onClick={() => claimTaskBadge(task)}>{claimed ? "Rozet Kazanıldı ✓" : complete ? "Rozeti Al" : "Devam Et"}</button></article>; })}</div>
            <h2 className="voice-task-section-title">Rozet koleksiyonum</h2>
            <div className="voice-earned-badges">{JSON.parse(localStorage.getItem("voiceEarnedBadges") || "[]").length ? JSON.parse(localStorage.getItem("voiceEarnedBadges") || "[]").map(item => <div className="voice-earned-badge" key={item.id}><span>{item.icon}</span><strong>{item.name}</strong></div>) : <p>Henüz rozet kazanmadın. Görevleri tamamlayarak ilk rozetini alabilirsin.</p>}</div>
          </section>
        ) : activePage === "dm" && selectedDMFriend ? (
          <DirectMessageView friend={selectedDMFriend} userId={userId} />
        ) : activePage === "friends" || showFriends ? (
          <FriendsView />
        ) : (
          <>
        <header className="topbar">
          <div className="server-heading">
            <span className="server-heading-icon">{server?.icon || "🎮"}</span>
            <h2>{server?.name || "Sunucu seç"}</h2>
            <ChevronDown size={18} />
          </div>

        </header>

        {showFriends ? (
          <FriendsView />
        ) : (
          <div className="content">
            <section className="chat-area chat-area-new">
              <div className="chat-panel">
                <div className="chat-panel-header">
                  <div className="chat-channel-info">
                    <div className="chat-hash">#</div>
                    <div>
                      <h2>{channel?.name || "Kanal seç"}</h2>
                      <span>
                        {channel?.type === "voice"
                          ? "Ses ve yazılı sohbet kanalı"
                          : "Yazılı sohbet kanalı"}
                      </span>
                    </div>
                  </div>

                  {channel?.type === "voice" && (
                    <div className="voice-auto-status"><span className={connected ? "status-dot connected" : "status-dot"}/>{connecting ? "Bağlanıyor..." : connected ? "Ses kanalına bağlı" : "Bağlantı bekleniyor"}<button type="button" onClick={disconnectRoom} disabled={!connected}>Ayrıl</button></div>
                  )}
                </div>

                {channel?.type === "voice" && (
                  <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                      <span style={{display:"flex",alignItems:"center",gap:8}}><MonitorUp size={16}/> Ekran Paylaşımı</span>
                      <button type="button" className="friends-nav-button" onClick={toggleScreenShare}
                        disabled={!connected || connecting} style={screenShareEnabled ? {color:"#f07878"} : undefined}>
                        {screenShareEnabled ? <MonitorOff size={16}/> : <MonitorUp size={16}/>}
                        {screenShareEnabled ? "Paylaşımı Durdur" : "Ekranımı Paylaş"}
                      </button>
                    </div>
                    {screenShareError && <div className="server-modal-error">{screenShareError}</div>}
                    <div ref={screenShareContainerRef} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginTop:10}} />
                    {screenShareTracks.length === 0 && <p style={{margin:"8px 0 0",opacity:.6,fontSize:13}}>Henüz ekran paylaşımı yok.</p>}
                  </div>
                )}

                <div className="chat-messages">
                  {!server ? (
                    <div className="chat-empty">
                      <Radio size={38} />
                      <h3>VOICE'a hoş geldin</h3>
                      <p>Başlamak için bir sunucu oluştur veya davet koduyla katıl.</p>
                    </div>
                  ) : !channel ? (
                    <div className="chat-empty">
                      <MessageCircle size={38} />
                      <h3>Kanal seçilmedi</h3>
                      <p>Sol menüden bir kanal seç veya yeni kanal oluştur.</p>
                    </div>
                  ) : !userId ? (
                    <div className="chat-empty">
                      <MessageCircle size={38} />
                      <h3>Oturum bekleniyor</h3>
                      <p>Sohbeti kullanmak için hesabına giriş yapmalısın.</p>
                    </div>
                  ) : chatLoading ? (
                    <div className="chat-empty">Mesajlar yükleniyor...</div>
                  ) : messages.length === 0 ? (
                    <div className="chat-empty">
                      <MessageCircle size={38} />
                      <h3>Henüz mesaj yok</h3>
                      <p>Bu kanalda ilk mesajı sen gönder!</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div className="chat-message" key={message.id}>
                        <div className="chat-message-avatar">
                          {(message.username || "?").charAt(0).toUpperCase()}
                        </div>

                        <div className="chat-message-body">
                          <div className="chat-message-heading">
                            <strong>{message.username || "Kullanıcı"}</strong>
                            <span>
                              {new Date(message.created_at).toLocaleString(
                                "tr-TR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }
                              )}
                            </span>
                          </div>

                          {message.content && (
                            <p className="chat-message-text">{message.content}</p>
                          )}

                          {message.attachment_path && (
                            <div className="chat-attachment">
                              {message.attachment_type?.startsWith("image/") ? (
                                message.fileUrl ? (
                                  <a href={message.fileUrl} target="_blank" rel="noreferrer">
                                    <img
                                      src={message.fileUrl}
                                      alt={message.attachment_name || "Gönderilen resim"}
                                      className="chat-image"
                                    />
                                  </a>
                                ) : (
                                  <span>Resim bağlantısı oluşturulamadı.</span>
                                )
                              ) : (
                                <div className="chat-file">
                                  <FileText size={24} />
                                  <span>{message.attachment_name}</span>

                                  {message.fileUrl && (
                                    <a
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      download={message.attachment_name}
                                    >
                                      <Download size={18} />
                                      Aç
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {chatError && <div className="chat-error">{chatError}</div>}
                {micError && <div className="chat-error">{micError}</div>}

                {selectedFile && (
                  <div className="chat-selected-file">
                    <FileText size={17} />
                    <span>{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                <form className="chat-composer" onSubmit={sendMessage}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.zip"
                    onChange={handleFileSelect}
                  />

                  <button
                    type="button"
                    className="chat-attach-button"
                    title="Resim veya belge ekle"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    className="chat-message-input"
                    value={messageInput}
                    onChange={event => setMessageInput(event.target.value)}
                    placeholder={`# ${channel?.name || "Sohbet"} kanalına mesaj gönder...`}
                    maxLength={4000}
                    disabled={!channel}
                  />

                  <button
                    type="submit"
                    className="chat-send-button"
                    disabled={
                      chatSending ||
                      (!messageInput.trim() && !selectedFile) ||
                      !userId ||
                      !channel
                    }
                    title="Gönder"
                  >
                    <Send size={19} />
                  </button>
                </form>

                <div className="chat-file-hint">
                  <ImageIcon size={13} />
                  Resim ve belge gönderebilirsin. Maksimum dosya boyutu: 50 MB.
                </div>
              </div>
            </section>


          </div>
        )}


          </>
        )}
      </main>
    </div>
  );
}

export default App;

function DirectMessageView({ friend, userId }) {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [callState, setCallState] = useState("idle");
  const [callRoom, setCallRoom] = useState(null);
  const [callMuted, setCallMuted] = useState(false);
  const [callDeafened, setCallDeafened] = useState(false);
  const [callError, setCallError] = useState("");
  const [incomingCall, setIncomingCall] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const endRef = useRef(null);
  const callRoomRef = useRef(null);
  const callChannelRef = useRef(null);
  const audioNodesRef = useRef(new Set());
  const pairKey = [userId, friend?.id].sort().join("-").replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    if (!userId || !friend?.id) return;
    let active = true;
    setLoading(true); setError(""); setItems([]);
    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("direct_messages").select("id,sender_id,receiver_id,content,created_at")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setItems(data || []);
      setLoading(false);
    };
    load();
    const channel = supabase.channel(`dm-${pairKey}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, payload => {
        const m = payload.new;
        if (![userId, friend.id].includes(m.sender_id) || ![userId, friend.id].includes(m.receiver_id)) return;
        setItems(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
      }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [userId, friend?.id, pairKey]);

  // Arama sinyalleşmesi: arkadaşın aradığında bu ekranda gelen arama görünür.
  useEffect(() => {
    if (!userId || !friend?.id) return;
    const channel = supabase.channel(`dm-call-${pairKey}`)
      .on("broadcast", { event: "incoming-call" }, ({ payload }) => {
        if (payload?.from !== userId) setIncomingCall(true);
      })
      .on("broadcast", { event: "call-ended" }, () => {
        setIncomingCall(false);
        if (callRoomRef.current) callRoomRef.current.disconnect();
      })
      .subscribe();
    callChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      callChannelRef.current = null;
    };
  }, [userId, friend?.id, pairKey]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [items]);

  async function send(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true); setError("");
    const { data, error: insertError } = await supabase.from("direct_messages")
      .insert({ sender_id: userId, receiver_id: friend.id, content })
      .select("id,sender_id,receiver_id,content,created_at").single();
    if (insertError) setError(insertError.message);
    else { setItems(prev => prev.some(x => x.id === data.id) ? prev : [...prev, data]); setDraft(""); }
    setSending(false);
  }

  async function joinCall(announce = false) {
    if (callRoomRef.current || !userId) return;
    setCallError("");
    setCallState("connecting");
    setIncomingCall(false);
    const roomName = `dm-${pairKey}`;
    let nextRoom;
    try {
      const { data: result, error: tokenError } = await supabase.functions.invoke("livekit-token", {
        body: { roomName, participantName: `dm-${userId}` }
      });
      if (tokenError) throw new Error(tokenError.message);
      if (!result?.success || !result?.url || !result?.token) {
        throw new Error(result?.error || "Arama bağlantısı için LiveKit token alınamadı.");
      }
      nextRoom = new Room({ adaptiveStream: true, dynacast: true });
      nextRoom.on(RoomEvent.ParticipantConnected, () => {
        setRemoteParticipants([...nextRoom.remoteParticipants.values()]);
      });
      nextRoom.on(RoomEvent.ParticipantDisconnected, () => {
        setRemoteParticipants([...nextRoom.remoteParticipants.values()]);
      });
      nextRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === "audio") {
          const node = track.attach();
          node.autoplay = true;
          document.body.appendChild(node);
          audioNodesRef.current.add(node);
        }
      });
      nextRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach(node => {
          audioNodesRef.current.delete(node);
          node.remove();
        });
      });
      nextRoom.on(RoomEvent.Disconnected, () => {
        callRoomRef.current = null;
        setCallRoom(null);
        setCallState("idle");
        setRemoteParticipants([]);
      });
      await nextRoom.connect(result.url, result.token);
      await nextRoom.localParticipant.setMicrophoneEnabled(true);
      callRoomRef.current = nextRoom;
      setCallRoom(nextRoom);
      setCallMuted(false);
      setCallDeafened(false);
      setRemoteParticipants([...nextRoom.remoteParticipants.values()]);
      setCallState("active");
      if (announce) {
        await callChannelRef.current?.send({
          type: "broadcast", event: "incoming-call",
          payload: { from: userId, roomName }
        });
      }
    } catch (err) {
      nextRoom?.disconnect();
      callRoomRef.current = null;
      setCallRoom(null);
      setCallState("idle");
      setCallError(err?.message || "Arama başlatılamadı.");
    }
  }

  async function toggleCallMic() {
    if (!callRoomRef.current) return;
    try {
      const next = !callMuted;
      await callRoomRef.current.localParticipant.setMicrophoneEnabled(!next);
      setCallMuted(next);
    } catch (err) { setCallError(err.message || "Mikrofon değiştirilemedi."); }
  }

  async function toggleCallDeafen() {
    if (!callRoomRef.current) return;
    const next = !callDeafened;
    audioNodesRef.current.forEach(node => { node.muted = next; });
    setCallDeafened(next);
  }

  async function toggleCallScreen() {
    if (!callRoomRef.current) return;
    try {
      const enabled = callRoomRef.current.localParticipant.isScreenShareEnabled;
      await callRoomRef.current.localParticipant.setScreenShareEnabled(!enabled);
    } catch (err) { setCallError(err.message || "Ekran paylaşımı başlatılamadı."); }
  }

  async function hangup() {
    try {
      await callChannelRef.current?.send({ type: "broadcast", event: "call-ended", payload: { from: userId } });
      callRoomRef.current?.disconnect();
    } finally {
      audioNodesRef.current.forEach(node => { node.pause(); node.remove(); });
      audioNodesRef.current.clear();
      callRoomRef.current = null;
      setCallRoom(null);
      setCallState("idle");
      setIncomingCall(false);
      setRemoteParticipants([]);
      setCallMuted(false);
      setCallDeafened(false);
    }
  }

  return (
    <section className="dm-chat-page">
      <header className="dm-chat-header">
        <div className="dm-header-identity">
          <div className="dm-avatar large">{(friend.username || "?").charAt(0).toUpperCase()}</div>
          <div className="dm-header-person"><h2>{friend.username || "Kullanıcı"}</h2></div>
        </div>
        <div className="dm-header-actions">
          <button title="Sabitle" aria-label="Sabitle"><Pin size={17}/></button>
          <button title="Arkadaş ekle" aria-label="Arkadaş ekle"><UserPlus size={17}/></button>
          <button title="Sesli ara" onClick={() => joinCall(true)} disabled={callState !== "idle"}><Phone size={17}/></button>
          <button title="Kullanıcıda ara" aria-label="Kullanıcıda ara"><Search size={17}/></button>
        </div>
      </header>

      {callState !== "idle" || incomingCall ? (
        <section className={`dm-call-stage ${callState === "active" ? "is-active" : ""}`}>
          <div className="dm-call-people">
            <div className="dm-call-avatar voice-brand">V</div>
            <div className="dm-call-avatar">{(friend.username || "?").charAt(0).toUpperCase()}</div>
          </div>
          {(callState === "connecting" || incomingCall) && <strong>{callState === "connecting" ? "Aranıyor..." : `${friend.username} seni arıyor`}</strong>}
          {callError && <p className="dm-call-error">{callError}</p>}
          <div className="dm-call-controls">
            {incomingCall && callState === "idle" ? (
              <>
                <button className="dm-call-accept" onClick={() => joinCall(false)}><Phone size={18}/> Kabul Et</button>
                <button className="dm-call-hangup" onClick={() => { setIncomingCall(false); }}><PhoneOff size={18}/></button>
              </>
            ) : (
              <>
                <button className={callMuted ? "is-off" : ""} onClick={toggleCallMic} disabled={callState !== "active"} title="Mikrofon"><Mic size={18}/></button>
                <button className={callDeafened ? "is-off" : ""} onClick={toggleCallDeafen} disabled={callState !== "active"} title="Kulaklık"><Headphones size={18}/></button>
                <button onClick={toggleCallScreen} disabled={callState !== "active"} title="Ekran paylaş"><MonitorUp size={18}/></button>
                <button className="dm-call-hangup" onClick={hangup} title="Aramayı bitir"><PhoneOff size={18}/></button>
              </>
            )}
          </div>
        </section>
      ) : null}

      <div className="dm-chat-messages">
        <div className="dm-chat-welcome"><div className="dm-avatar large">{(friend.username || "?").charAt(0).toUpperCase()}</div><h2>{friend.username}</h2><p>{friend.username} ile direkt mesaj geçmişinin başlangıcı.</p></div>
        {loading ? <p className="dm-chat-empty">Mesajlar yükleniyor...</p> : items.length === 0 ? <p className="dm-chat-empty">Henüz mesaj yok. Sohbeti başlatmak için mesaj gönder.</p> : items.map((item, index) => <Fragment key={item.id}>{(index === 0 || new Date(items[index - 1].created_at).toDateString() !== new Date(item.created_at).toDateString()) && <div className="dm-date-divider"><span>{new Date(item.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}</span></div>}<div className={`dm-message-row ${item.sender_id === userId ? "mine" : ""}`}><div className="dm-message-avatar">{item.sender_id === userId ? "S" : (friend.username || "?").charAt(0).toUpperCase()}</div><div className="dm-message-body"><div className="dm-message-meta"><strong>{item.sender_id === userId ? "Sen" : friend.username}</strong><time>{new Date(item.created_at).toLocaleString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric", hour: "2-digit", minute: "2-digit" })}</time></div><div className="dm-message-content">{item.content}</div></div></div></Fragment>)}
        <div ref={endRef} />
      </div>
      {error && <p className="dm-chat-error">{error.includes("direct_messages") || error.includes("relation") ? "Özel mesaj tablosu henüz kurulmamış. Proje klasöründeki direct-messages.sql dosyasını Supabase SQL Editor'da çalıştır." : error}</p>}
      <form className="dm-chat-form" onSubmit={send}>
        <button type="button" className="dm-attach-button" title="Dosya ekleme yakında"><Plus size={21}/></button>
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={`${friend.username} kullanıcısına mesaj gönder`} maxLength={4000}/>
        <button type="submit" disabled={!draft.trim() || sending}><Send size={18}/></button>
      </form>
    </section>
  );
}
