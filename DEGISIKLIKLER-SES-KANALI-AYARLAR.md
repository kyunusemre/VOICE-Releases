# Ses kanalı ve sunucu ayarları güncellemesi

- Ses kanalı seçildiğinde LiveKit ses odasına otomatik bağlanma denenir.
- Kanal başlığındaki ayrı “Sese Katıl” düğmesi kaldırıldı. Bağlantı durumu ve bağlıyken “Ayrıl” kontrolü gösterilir.
- Sunucu başlığının yanına küçük bir dişli ayar düğmesi eklendi.
- Dişli düğmesi Discord benzeri ayrı bir sunucu ayarları penceresi açar (Genel Görünüm, İzinler, Davetler, Entegrasyonlar ve Sunucuyu Sil).

Not: Ses bağlantısının çalışması için Supabase oturumu, `livekit-token` Edge Function ve LiveKit sunucu ayarları gereklidir. Sunucu adı düzenleme ve ayrıntılı izin yönetimi, mevcut veritabanı şeması desteklemediği için bu ekranda salt okunur/açıklama olarak bırakılmıştır.


## Sunucu ayarları düzeltmesi
- Küçük dişli düğmesi sunucu ayarları penceresini açar.
- Genel Görünüm bölümünde sunucu adı ve emoji simgesi düzenlenip Supabase `servers` tablosuna kaydedilir.
- Davet kodu kopyalanabilir; sunucu silme işlemi onay sorar.
- İzinler ve entegrasyonlar sekmeleri bu sürümde açıklama/yer tutucu olarak kalır; mevcut şemada rol/entegrasyon yönetim tabloları bulunmuyor.
