# VOICE – Discord/Nitro referans arayüzü

Bu sürümde VOICE ana ekranı, kullanıcının gönderdiği Discord Nitro ekran görüntüsünün yerleşim ve görsel diline göre yeniden düzenlenmiştir:
- Sol sunucu rayı ve yanında gezinme/DM paneli
- Mor Nitro üst gezinme çubuğu
- Mor geçişli büyük tanıtım alanı
- Alt kısımda koyu tanıtım kartları
- Sunucu seçildiğinde mevcut VOICE sohbet ve ses kanalı arayüzüne geçiş

Mevcut React/LiveKit/Supabase işlev kodları korunmuştur. Bu çalışma gerçek Discord/Nitro markalı görselleri veya ücretli Nitro işlevlerini kopyalamaz; ekran görüntüsündeki yerleşim ve stil VOICE markasıyla yeniden oluşturulmuştur.

Kurulum: `npm ci` ardından `npm run dev` veya `npm run build`.

Güvenlik: `.env`, `node_modules` ve `dist` bu kaynak paketine dahil edilmemiştir. Kendi `.env` dosyanızı koruyun.
