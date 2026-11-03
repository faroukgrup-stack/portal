
        // ============================================================
        // VERİLER – Tüm araçlar ve içerikleri
        // ============================================================
        const tools = [{
            name: "Kapsamlı Finansal Fizibilite Çalışması Aracı",
            icon: "fa-chart-pie",
            content: `
📌 Başlamadan Önce  
Bu araç, herhangi bir proje fikrini dakikalar içinde finansal olarak değerlendirmenize yardımcı olur – karmaşık muhasebe programlarına ihtiyaç duymadan.

1. Bu araçla neler yapabilirsiniz?  
- Projeyi güvenle işletmek için gerekli işletme sermayesini hesaplar.
- Gelecek yıllar için gelir, gider ve kâr tahminleri yapar.
- Net Bugünkü Değer (NPV), İç Verim Oranı (IRR), geri ödeme süresi gibi göstergeler sunar.
- Başabaş noktasına ne zaman ulaşacağınızı (yani ne zaman kâr etmeye başlayacağınızı) gösterir.
- 3 senaryoyu test eder: iyimser, beklenen, kötümser.
- Herhangi bir sayıdaki değişimin (örneğin satışlar veya maliyetler) sonuçlara etkisini test eder.
- Yatırımcılara veya yönetime sunmak üzere profesyonel Word veya Excel raporu dışa aktarır.

2. Veriler nasıl doldurulur (adım adım)

🔹 Adım 1: Para birimini ve kurum adını seçin
- Üst menüden para birimini seçin (ör. Dolar veya Riyal).
- Raporlarda görünecek kurum adını yazın (ör. "Nur Şirketi").

🔹 Adım 2: Sabit ve kuruluş sermayesi
- Sabit sermaye: Makine, bina, araç vb. bedelleri.
- Kuruluş sermayesi: Faaliyet öncesi lisans ve çalışma giderleri.

🔹 Adım 3: Aylık operasyon verileri (gerekli likiditeyi hesaplamak için)
En önemli gruptur, çünkü başlangıçta ne kadar nakde ihtiyacınız olduğunu belirler:
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Aylık nakit satışlar</td><td>Aylık ne kadar nakit satış bekliyorsunuz.</td></tr>
<tr><td>Çalışan sayısı</td><td>Projede kaç kişi çalışacak.</td></tr>
<tr><td>Ortalama aylık maaş (net)</td><td>Çalışanın eline geçen maaş.</td></tr>
<tr><td>Çalışan maliyet oranı</td><td>Net maaşı şirkete toplam maliyete dönüştüren katsayı (ör. bazı ülkelerde 1.61). Emin değilseniz muhasebecinize sorun veya varsayılan değeri bırakın.</td></tr>
<tr><td>Aylık kira (net)</td><td>Vergi öncesi kira bedeli.</td></tr>
<tr><td>Kira KDV oranı</td><td>Vergi oranı (ör. 20).</td></tr>
<tr><td>Değişken maliyet oranı (% satış)</td><td>Her satıştan hammadde ve komisyon için ne kadar düşülür. Örnek: %30 ise 0.3 yazın.</td></tr>
<tr><td>Aylık faaliyet giderleri</td><td>Elektrik, internet, kırtasiye faturaları...</td></tr>
<tr><td>Aylık nakit rezervi</td><td>Aylık acil durumlar için ayırdığınız tutar.</td></tr>
<tr><td>İşletme sermayesi karşılama ayı</td><td>Kaç aylık gideri nakit olarak karşılamak istiyorsunuz (genellikle 3-6 ay).</td></tr></table>

🔹 Adım 4: Büyüme ve iskonto varsayımları
- Yıllık satış büyümesi (%): Satışlarınız her yıl ne kadar artacak (ör. 10).
- Yıllık gider büyümesi (%): Enflasyon nedeniyle maliyetler ne kadar artacak (ör. 5).
- İskonto oranı (%): Yatırımcının beklediği getiri (bilmiyorsanız %10 kullanın).
- Gelir vergisi (%): Devletin kâr üzerinden aldığı oran (ör. 25).
- Ekonomik ömür (yıl): Varlıkların kaç yıl kullanılacağı (genellikle 5-10).

🔹 Adım 5: Başabaş noktası verileri
- Birim satış fiyatı: Ürün veya hizmeti kaça satacaksınız? Fiyatı buraya yazın.

🔹 Adım 6: İsteğe bağlı alanlar
- Yeniden yatırım oranı (MIRR): Genellikle iskonto oranıyla aynı bırakın.
- Yıllık borç servisi: Bir krediniz varsa yıllık toplam taksitleri buraya yazın.

3. "Fizibilite ve Göstergeleri Hesapla" butonuna tıklayın
Verileri girdikten sonra büyük mavi butona tıklayın. Sonuçlar hemen butonun altında görünecektir.

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: NPV (pozitif = kârlı), IRR (iskonto oranından büyük = iyi), geri ödeme süresi, başabaş noktası. Renkler: Yeşil=mükemmel, Sarı=kabul edilebilir, Kırmızı=risk.
📊 Grafikler: Nakit akışları için sütunlar, gelir ve giderler için çizgiler, NPV eğrisi, başabaş grafiği.
📋 Yıllık tablo: Her yıl için detay (gelir, gider, kâr, nakit akışı).
🔮 Senaryolar: Üç kart (iyimser, beklenen, kötümser).
🔍 Duyarlılık analizi: Yüzdeyi değiştirip değişimi anında görün.

5. Nihai raporu dışa aktarın
📄 Word raporu: Tüm detaylarla formatlanmış dosya.
📊 Excel raporu: Birden çok sayfa (girdiler, göstergeler, akışlar, grafikler).

💡 Hızlı ipuçları
- Herhangi bir sayıyı düzenleyip tekrar "Hesapla"ya tıklayabilirsiniz.
- Sabit hesap makinesini kullanın (sol altta).
- Kurum adını yazmayı unutmayın.`
        }, {
            name: "Kapsamlı Restoran Maliyet Hesaplayıcısı",
            icon: "fa-utensils",
            content: `
📌 Bu araç nedir ve size ne sağlar?  
Restoran sahipleri ve gıda sektörü yatırımcıları için özel olarak tasarlanmıştır. Şunları yapmanızı sağlar:
- Aylık gelir ve maliyetlerinizi hassas bir şekilde hesaplama.
- Net kârınızı ve kâr marjınızı öğrenme.
- Başabaş noktasını (ne zaman kâr etmeye başlayacağınızı) belirleme.
- Restoranınızın sağlığını 4 küresel göstergeyle ölçme.
- Senaryoları test etme (iyimser, kötümser).
- Konum analizi ve müşteri sayısına etkisi.
- Risk tahmini için Monte Carlo simülasyonu çalıştırma.
- Restoranınızın piyasa değerini tahmin etme.
- Profesyonel Word veya Excel raporu dışa aktarma.

1. Başlamadan önce – Ana arayüz
Üstte: Para birimi seçimi, kurum adı, ardından ana giriş bölümleri.

2. Veriler nasıl doldurulur (adım adım)
🔹 Bölüm 1: Temel Bilgiler
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Tahmini günlük müşteri sayısı</td><td>Restoranı günde ortalama kaç müşteri ziyaret eder.</td></tr>
<tr><td>Ortalama fiş tutarı</td><td>Bir müşteri yaklaşık ne kadar harcar (seçilen para biriminde).</td></tr>
<tr><td>Aylık çalışma günü</td><td>Restoran ayda kaç gün açık (genellikle 26 veya 30).</td></tr></table>

🔹 Bölüm 2: Aylık sabit maliyetler
<table><tr><th>Alan</th><th>Açıklama</th></tr>
<tr><td>Aylık kira</td><td>Dükkan kira bedeli.</td></tr>
<tr><td>Çalışan maaşları (net)</td><td>Tüm çalışanların eline geçen toplam maaş.</td></tr>
<tr><td>Çalışan maliyet katsayısı (%)</td><td>Maaş üzerine ödenen ek oran (sigorta, ikramiyeler).</td></tr>
<tr><td>Faturalar (elektrik, su, gaz)</td><td>Aylık ortalama.</td></tr>
<tr><td>İnternet ve abonelikler</td><td>İnternet ve kasa programları.</td></tr>
<tr><td>Bakım ve temizlik</td><td>Periyodik bakım + temizlik malzemeleri.</td></tr>
<tr><td>Pazarlama ve reklam</td><td>Aylık reklam harcamaları.</td></tr>
<tr><td>Diğer giderler</td><td>Belirtilmeyen diğer sabit maliyetler.</td></tr></table>

🔹 Bölüm 3: Değişken maliyetler (gelirin yüzdesi)
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Yiyecek maliyeti (%)</td><td>Yiyecek maliyeti yemek fiyatının yüzde kaçı? (ör. 30 = %30)</td></tr>
<tr><td>İçecek maliyeti (%)</td><td>Aynı şekilde içecekler için.</td></tr>
<tr><td>Ambalaj ve sarf (%)</td><td>Poşet ve kutu maliyet oranı.</td></tr>
<tr><td>Teslimat komisyonları (%)</td><td>Teslimat platformlarının aldığı oran (ör. %15).</td></tr>
<tr><td>Teslimat satış oranı (%)</td><td>Toplam satışlarınızın yüzde kaçı teslimat? (ör. %30).</td></tr>
<tr><td>İsraf oranı (%)</td><td>Bozulan veya yanıp satılamayan yiyecek (genellikle %2-5).</td></tr></table>

🔹 Bölüm 4: Vergiler ve ilk yatırım
<table><tr><th>Alan</th><th>Açıklama</th></tr>
<tr><td>Katma Değer Vergisi (KDV) (%)</td><td>Satışlara uygulanan vergi oranı (varsa).</td></tr>
<tr><td>İlk yatırım (donanım)</td><td>Restoranı kurmak için ne kadar harcadınız (ekipman, dekorasyon, lisanslar).</td></tr></table>

🔹 Bölüm 5: Konum analizi (isteğe bağlı ama önemli)
"Konum Analizi"nin yanındaki oka tıklayarak alanları açın: Günlük yaya trafiği, giriş oranı (%), satın alma oranı (%), masa ve sandalye sayısı, oturma süresi ve çalışma saatleri.

3. "Maliyetleri ve Kârları Hesapla" butonuna tıklayın

4. Sonuçlar nasıl okunur?
🟩 Üst gösterge kartları: Aylık gelir, sabit maliyetler, değişken maliyetler, net kâr (yeşil = kâr, kırmızı = zarar), kâr marjı (%).
⚠️ Akıllı uyarılar: Yiyecek maliyeti %35'ten yüksek, maaşlar çok yüksek gibi uyarılar.
📊 Grafikler: Pasta grafiği (gelir dağılımı), çizgi grafik (başabaş noktası).
📋 Aylık maliyet detayları: Her kalemin ve oranının tam tablosu.
⏱️ Yatırım geri ödeme süresi.
🔍 Kârlılık duyarlılık analizi: Üç senaryo.
🩺 Restoran sağlık endeksi: 4 küresel kritere göre 100 üzerinden puan.
💰 Restoranın piyasa değeri tahmini: Sektör çarpanını girin.

5. Gelişmiş analizler (ok tıklanarak açılır): Monte Carlo simülasyonu, operasyonel kapanış noktası, operasyonel kaldıraç, güvenlik marjı, maksimum kapasite ve doluluk analizi.

6. Raporları dışa aktarın: 📄 Word ve 📊 Excel (birden çok sayfa).

💡 Ek ipuçları: Emin değilseniz varsayılan değerleri kullanın ve müşteri sayısını değiştirmeyi deneyin.`
        }, {
            name: "Restoranlar için İleri Teknik Fizibilite Çalışması Aracı",
            icon: "fa-gear",
            content: `
📌 Bu araç nedir ve size ne sunar?  
Restoran sektöründeki girişimciler ve yatırımcılar için özeldir: konumu değerlendirme, tüm mutfak ekipmanlarını girme, üretim kapasitesini hesaplama, gelir, maliyet, kâr ve başabaş noktasını tahmin etme, teknik ve finansal değerlendirme (100 üzerinden puan), yatırım geri ödeme süresini bulma, otomatik uyarıları görme, Word veya Excel raporu dışa aktarma.

1. Başlamadan önce
Para birimini seçin ve kurum adını yazın. Sayfa net bölümlere ayrılmıştır.

2. Girdi açıklamaları – adım adım
🔹 Bölüm 1: Kapsam ve özellikler
<table><tr><th>Alan</th><th>Ne seçer / yazarım?</th></tr>
<tr><td>Mutfak türü</td><td>Listeden seçin (hızlı yemek, lüks, doğu mutfağı...).</td></tr>
<tr><td>Sandalye sayısı</td><td>Toplam oturma kapasitesi.</td></tr>
<tr><td>Hizmet modeli</td><td>Masa servisi, self-servis, sadece teslimat veya karışık.</td></tr>
<tr><td>Günlük çalışma saati</td><td>Restoran günde kaç saat açık.</td></tr>
<tr><td>Çalışma periyotları</td><td>Tek periyot, iki periyot veya daha fazla.</td></tr></table>

🔹 Konum analizi
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Toplam alan</td><td>Mekanın metrekare cinsinden alanı.</td></tr>
<tr><td>Mutfak alan oranı (%)</td><td>Alanın yüzde kaçını mutfağa ayıracaksınız (ör. 35).</td></tr>
<tr><td>Mevcut elektrik kapasitesi (Amper)</td><td>Mevcut elektrik gücü.</td></tr>
<tr><td>Su kaynağı</td><td>Uygun mu, geliştirme gerekiyor mu?</td></tr>
<tr><td>Havalandırma sistemi</td><td>Uygun, geliştirme gerekli veya uygun değil.</td></tr>
<tr><td>Teslimat kolaylığı</td><td>Mükemmel, orta veya zor.</td></tr></table>

🔹 Ekipman bölümü (dinamik): İstediğiniz kadar ekipman ekleyin (isim, kW güç, fiyat, alan). Araç toplamları toplar ve elektrik aşımı durumunda uyarı verir.

🔹 Üretim kapasitesi ve operasyonel verimlilik: Masa devir hızı, yoğun saatler, doluluk oranı, ortalama yemek fiyatı, yiyecek maliyeti, çalışan sayısı, maaşlar, kira, diğer giderler, ekipman ekonomik ömrü.

🔹 Kuruluş maliyetleri: Dekorasyon ve inşaat maliyeti, lisans ve harçlar, işletme sermayesi (3 ay).

3. "Teknik Çalışmayı Hesapla" butonuna tıklayın

4. Sonuçlar nasıl okunur?
🟩 Ana gösterge kartları: Aylık gelir, net kâr, başabaş noktası (gelir), geri ödeme süresi.
⚠️ Akıllı uyarılar: Dar alan, yüksek prime cost gibi uyarılar.
📊 Grafikler: Finansal performans analizi, risk analizi.
🏆 Proje değerlendirmesi (teknik ve finansal) 100 üzerinden.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (4 sayfa).

💡 İpuçları: Ekipman verilerini doğru girin ve elektrik uyarılarını izleyin.`
        }, {
            name: "Kapsamlı Pazarlama Fizibilite Çalışması Aracı",
            icon: "fa-chart-simple",
            content: `
📌 Bu araç size ne sunar?  
Hedef pazar analizi ve büyüklüğü, kitle ve rakip çalışması, pazarlama stratejisi planlama (4P), pazarlama kanallarını, bütçelerini ve beklenen müşterileri girme, hassas pazarlama finansal göstergelerini hesaplama (gelir, CAC, LTV, ROAS...), anlık uyarılar, Word/PDF/Excel dışa aktarma.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma (adım adım)
🟡 Sağ bölüm: Proje tanımı (isim, açıklama, konum, süre), pazar analizi (TAM, SAM, SOM, yıllık büyüme, trendler), hedef kitle (yaş, cinsiyet, bölge, gelir, ilgi alanları, kitle büyüklüğü).
🟡 Sol bölüm: Rakipler (isim, güçlü yön, zayıf yön), pazarlama stratejisi (ürün, yemek fiyatı ve maliyeti, dağıtım, tutundurma, pazarlama ekibi, plan süresi), aylık operasyon giderleri (kira, maaşlar, faturalar, diğer).
🟡 Alt bölümler: Pazarlama kanalları (aylık bütçe, beklenen müşteri), müşteri davranışı (satın alma sıklığı, sadakat süresi, geçici müşteriler).

3. "Çalışmayı Şimdi Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: Aktif müşteriler, yıllık gelir, pazarlama maliyetleri, pazarlama marjı, CAC, LTV, ROAS, başabaş müşterileri.
⚠️ Uyarılar: Varsa kırmızı uyarılar.
📊 Rakip analizi ve pazar çekiciliği: Metin değerlendirmesi ve 10 üzerinden gösterge.
📈 Grafikler: Gelir vs pazarlama maliyetleri, mevcut müşteriler vs başabaş.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (birden çok sayfa).

💡 İpuçları: Satış fiyatının > yemek maliyetinden büyük olduğundan emin olun, LTV/CAC > 3 olsun.`
        }, {
            name: "Gayrimenkul Yatırım Getirisi Hesaplayıcı",
            icon: "fa-building",
            content: `
📌 Bu araç nedir ve size ne sunar?  
Bankacılık finansmanıyla veya finansmansız herhangi bir gayrimenkul yatırım fırsatını doğru değerlendirme. NPV, IRR, MIRR, geri ödeme süresi, Cash on Cash, nakit akışları, duyarlılık analizi, Word veya Excel dışa aktarma.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma (adım adım)
🏢 Mülk ve operasyon verileri: Mülk değeri, birim sayısı, birim başına aylık kira, aylık giderler, doluluk oranı, emlak vergisi, değerleme indirimi, yıllık kira artışı, arazi değer artışı, satın alma komisyonları ve vergiler.
🏦 Mortgage finansmanı (isteğe bağlı): Kredi oranı, faiz oranı, kredi vadesi.
📈 Değerleme kriterleri: İskonto oranı, yeniden yatırım oranı, yıl sayısı.

3. "Getiriyi Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: NPV, IRR, MIRR, geri ödeme süresi, PI, Cash on Cash, ROI.
🏆 Proje değerlendirmesi: 100 üzerinden puan.
📈 Grafik: Akış ve kümülatif.
📊 Nakit akışı tablosu.
🔍 Duyarlılık analizi: Dört buton (kira/doluluk +/-%10).

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (5 sayfa).

💡 İpuçları: Nakit alıyorsanız krediyi %0 yapın, duyarlılık butonlarını deneyin.`
        }, {
            name: "Gelişmiş Risk Analizi Aracı (Monte Carlo)",
            icon: "fa-wave-square",
            content: `
📌 Bu araç nedir ve size ne sağlar?  
İki yönlü duyarlılık analizi ve Monte Carlo simülasyonu (binlerce senaryo). NPV, IRR, geri ödeme süresi, PI, kayıp olasılığı, Word veya Excel dışa aktarma.

1. Başlamadan önce: Para birimini ve kurum adını seçin. Duyarlılık analizi veya Monte Carlo simülasyonu arasında seçim yapın.

2. Verileri doldurma
🟡 Temel durum: İlk yatırım, yıllık gelir ve maliyetler, amortisman, büyüme, iskonto, vergi, süre.
🔵 Duyarlılık analizi: Gelir ve maliyetlerde değişim yüzdesi.
🎲 Monte Carlo: Gelir/maliyet oynaklığı (σ%), tekrar sayısı.

3. "Analizi Çalıştır"a tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: NPV, IRR, Payback, PI.
Duyarlılıkta: 3×3 matris.
Monte Carlo'da: Histogram, istatistikler (VaR, en iyi %5, kayıp olasılığı, CV...).

5. Raporları dışa aktarın: 📊 Excel (5 sayfa) ve 📄 Word.

💡 İpuçları: Doğruluk için tekrar sayısını artırın, >%40 kayıp olasılığı risk anlamına gelir.`
        }, {
            name: "Başabaş Noktası Hesaplayıcı (Break-Even Point)",
            icon: "fa-chart-line",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Maliyetleri karşılamak için gereken birim sayısını ve gelir tutarını, katkı marjını hesaplar ve grafikle gösterir.

1. Araç arayüzü: Para birimi, kurum adı, sadece üç alan.

2. Girdiler – Sadece üç sayı
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Aylık sabit maliyetler</td><td>Satışlarla değişmeyen tüm giderler.</td></tr>
<tr><td>Birim satış fiyatı</td><td>Tek bir ürün veya hizmeti sattığınız fiyat.</td></tr>
<tr><td>Birim değişken maliyet</td><td>Tek bir birimi üretmenin doğrudan maliyeti.</td></tr></table>

3. "Başabaş Noktasını Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: Başabaş miktarı, başabaş geliri, katkı marjı ve oranı.
📊 Grafik: Gelir (yeşil), toplam maliyet (kırmızı), başabaş noktası (altın).
📋 Özet tablo.
✅ Nihai karar.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: Başabaş noktası maksimum kapasitenize yakınsa, maliyetleri düşürün veya fiyatı artırın.`
        }, {
            name: "Gelişmiş Nakit Akışı Hesaplayıcısı",
            icon: "fa-coins",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Operasyonel nakit akışını (OCF) veya serbest nakit akışını (FCFF) hesaplar ve beş gelecek dönem için tahmin yapar.

1. Başlamadan önce: Para birimini, kurum adını, dönemi (aylık/üç aylık/yıllık) ve akış türünü seçin.

2. Verileri doldurma
📊 Gelir verileri: Gelir, operasyon giderleri, amortisman, vergi, CAPEX, işletme sermayesi değişimi.
📈 Tahmin seçenekleri: Her dönem için büyüme oranı.

3. "Nakit Akışını Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: Dönem geliri, EBIT, NOPAT, nihai nakit akışı (yeşil=pozitif, kırmızı=negatif).
📋 Detaylı hesaplama tablosu.
📈 Tahmin grafiği.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (7 sayfa).

💡 İpuçları: FCFF büyük negatifse, CAPEX veya işletme sermayesini gözden geçirin.`
        }, {
            name: "Gelişmiş Amortisman Hesaplayıcısı",
            icon: "fa-chart-simple",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Dört farklı yöntemle sabit varlıkların amortismanını hesaplar, yıllık tablo ve grafik sunar.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Varlık maliyeti</td><td>Varlığı satın almanın toplam fiyatı.</td></tr>
<tr><td>Hurda değeri</td><td>Ömrün sonunda beklenen değer.</td></tr>
<tr><td>Ekonomik ömür (yıl)</td><td>Varlığı kaç yıl kullanmayı bekliyorsunuz?</td></tr>
<tr><td>Amortisman yöntemi</td><td>Doğrusal, azalan, çift azalan veya özel oran.</td></tr>
<tr><td>Satın alma ayı</td><td>Varlığı satın aldığınız ay.</td></tr></table>

3. "Amortismanı Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: Toplam amortisman, nihai defter değeri, fiili yıl sayısı, ortalama yıllık amortisman.
📉 Grafik: Defter değerindeki düşüş.
📋 Yıllık amortisman tablosu (amortisman, birikmiş, defter değeri).

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: Çift azalan bakiye yöntemi genellikle hurda değeri sıfır bırakır ve otomatik olarak durur.`
        }, {
            name: "WACC Hesaplayıcı",
            icon: "fa-scale-balanced",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Ağırlıklı ortalama sermaye maliyetini hesaplar. Manuel giriş veya CAPM kullanılabilir. Sermaye yapısı grafiği.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma
🟢 Öz sermaye: Değer, Re hesaplama yöntemi (manuel veya CAPM: Rf, Beta, risk primi).
🔴 Borç: Değer, maliyet, vergi oranı.

3. "WACC'i Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 WACC kartı ve sınıflandırma (düşük/orta/yüksek).
📊 Pasta grafik: Sermaye yapısı.
📋 Hesaplama detay tablosu.
💡 Sonuç yorumu.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: WACC, projeler için gereken minimum getiri oranıdır.`
        }, {
            name: "Yatırım Getirisi Hesaplayıcı (ROI)",
            icon: "fa-chart-line",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
ROI ve geri ödeme süresini hesaplar, kümülatif akış grafiği gösterir.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma
<table><tr><th>Alan</th><th>Ne yazmalıyım?</th></tr>
<tr><td>Toplam yatırım maliyeti</td><td>Projeyi başlatmak için toplam tutar.</td></tr>
<tr><td>Beklenen net kâr</td><td>Belirlenen dönemdeki net kâr.</td></tr>
<tr><td>Kâr dönemi</td><td>Yıllık, altı aylık, üç aylık, aylık.</td></tr>
<tr><td>Gösterilecek yıl sayısı</td><td>20 yıla kadar.</td></tr></table>

3. "ROI'i Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: ROI (yeşil=kârlı), geri ödeme süresi, yıllık net kâr.
📈 Kümülatif akış grafiği.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (5 sayfa).

💡 İpuçları: 5 yıldan uzun geri ödeme süresi yüksek risk anlamına gelir.`
        }, {
            name: "Gelişmiş Kredi Planlama Hesaplayıcısı",
            icon: "fa-hand-holding-usd",
            content: `
📌 Bu araç size ne sunar?  
Periyodik taksit, toplam faiz, peşinat, ek ödemeler, ödemesiz dönem, tam geri ödeme tablosu ve grafikler hesaplar.

1. Araç arayüzü: Para birimi, kurum adı, temel alanlar, gelişmiş ayarlar.

2. Verileri doldurma
🟡 Temel alanlar: Kredi tutarı, yıllık faiz, vade, ödeme sıklığı.
🔧 Gelişmiş ayarlar: Peşinat, periyodik ek ödeme, ödemesiz dönem.

3. "Ödeme Tablosunu Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Gösterge kartları: Periyodik ödeme, toplam faiz, toplam ödeme, ödeme sayısı.
⚠️ Özet ve uyarılar.
📊 Grafikler: Pasta (faiz/anapara), yığılmış sütunlar.
📋 Tam geri ödeme tablosu.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: Küçük bir ek ödemenin ne kadar tasarruf sağladığını görmek için deneyin.`
        }, {
            name: "İdeal İşgücü Maliyet Hesaplayıcısı",
            icon: "fa-users",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
İşgücü maliyetini, satışlara oranını, çalışan verimliliğini hesaplar, vardiya ve izinler için iyileştirme önerileri sunar.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma
🟡 Temel girdiler: Aylık satışlar, ortalama fiş tutarı, ortalama aylık ücret, çalışma günleri, hedef oran, günlük vardiya sayısı.
🕒 Vardiya bölümü (dinamik): Çalışan sayısı ve vardiya saatleri.
📅 İzin dağılımı: Aynı tatil mi yoksa kademeli mi.

3. "İdeal Maliyeti Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 9 kart: Toplam çalışan, işgücü maliyeti, işgücü oranı, çalışan başına satış...
⚠️ Uyarı mesajı (yeşil/sarı/kırmızı).
💡 Verimlilik iyileştirme önerileri.
📊 Grafik: İki sütun (satış/işgücü).

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: Restoranlar için ideal işgücü oranı %20-30'dur.`
        }, {
            name: "Gelişmiş HACCP Denetim Sistemi",
            icon: "fa-exclamation-triangle",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
10 ana başlıkta günlük kontrol listesi, anında düzeltici öneriler, uyum oranı, Word ve Excel dışa aktarma.

1. Başlamadan önce: Tarihi ve sorumlu kişiyi doldurun.

2. Kontrol listesi nasıl kullanılır?  
10 bölüm (teslim alma, depolama, hazırlama, pişirme, soğutma, kişisel hijyen, temizlik, haşere kontrolü, dokümantasyon, eğitim). Uygulanan maddelere ✅ işareti koyun. Uygulanmayan maddeler risk seviyesiyle (🔴🟡🟢) öneri gösterir.

3. "Sonucu ve Önerileri Hesapla"ya tıklayın

4. Sonuçlar: Uyum oranı, genel risk seviyesi.

5. Raporları dışa aktarın: 📊 Excel (3 sayfa) ve 📄 Word.

💡 İpuçları: Yüksek riskli (kırmızı) maddelere odaklanın.`
        }, {
            name: "Standart Çalışma Prosedürleri (SOP) Denetim Sistemi",
            icon: "fa-clipboard-list",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
10 operasyonel bölümde kapsamlı günlük kontrol listesi (66 madde), anında öneriler, uyum oranı, Word dışa aktarma.

1. Başlamadan önce: Tarihi ve sorumlu kişiyi doldurun.

2. Kontrol listesi nasıl kullanılır? 10 bölüm (teslim alma, depolama... vb.). Uygulanan maddelere ✅ işareti koyun. Uygulanmayan maddeler düzeltici öneriler gösterir.

3. "Sonucu ve Önerileri Hesapla"ya tıklayın: Uyum oranı, genel risk seviyesi.

4. Word raporu dışa aktarın: Tüm maddeler ve öneriler, yazdırmaya hazır.

💡 İpuçları: Yüksek riskli maddelerle başlayın.`
        }, {
            name: "Finansal ve Danışmanlık Hesap Makinesi",
            icon: "fa-calculator",
            content: `
📌 Bu araç nedir ve size ne sunar?  
Bilimsel ve finansal hesap makinesi (vergi, indirim, ROI, faiz) hafıza, işlem geçmişi ve CSV dışa aktarma ile.

1. Arayüze genel bakış: Hesap makinesi (sağda), geçmiş paneli (solda), üstte tarih ve saat.

2. Hızlı finansal araçlar
<table><tr><th>Buton</th><th>Ne yapar?</th></tr>
<tr><td>Vergi</td><td>Tutara vergi oranı ekler.</td></tr>
<tr><td>İndirim</td><td>Tutardan indirim oranı düşer.</td></tr>
<tr><td>ROI</td><td>Yatırım getirisini hesaplar.</td></tr>
<tr><td>Faiz</td><td>Basit faiz hesaplar.</td></tr></table>

3. İşlem geçmişi paneli: Filtreleme, CSV dışa aktarma, temizleme.

💡 İpuçları: Klavyeyi doğrudan kullanın, M+ ile sayıları hafızaya toplayın.`
        }, {
            name: "Çoklu Ürün Başabaş Analizi",
            icon: "fa-chart-line",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Satış karışımına, katkı marjına ve her ürünün başabaş birimlerine dayalı çoklu ürün başabaş noktasını hesaplar.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma
🍽️ Ürün bölümü: Ürün ekleyin (isim, fiyat, maliyet, karışım oranı).
💰 Aylık sabit maliyetler.
📈 Gerçek satışlar (isteğe bağlı).

3. "Başabaş Noktasını Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Kartlar: Ağırlıklı ortalama fiyat, ağırlıklı katkı marjı oranı, başabaş geliri, toplam başabaş birimleri.
📋 Ürün detay tablosu.
📊 Grafikler: Pasta ve sütun.
🛡️ Güvenlik marjı.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: En yüksek katkı marjına sahip ürünlere odaklanın.`
        }, {
            name: "Kapsamlı Finansal Oran Hesaplayıcısı",
            icon: "fa-percentage",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
18 finansal oran hesaplar (likidite, kârlılık, ödeme gücü, faaliyet) anında değerlendirme ve önerilerle.

1. Başlamadan önce: Para birimini ve şirket adını seçin.

2. Verileri doldurma
🏦 Bilanço sütunu: Nakit, stok, diğer dönen varlıklar, duran varlıklar, kısa ve uzun vadeli yükümlülükler.
📈 Gelir tablosu ve akış sütunu: Gelir, satış maliyeti, operasyon giderleri, faiz, vergi, vadeli satışlar, alacaklılar ve borçlular.

3. "Finansal Oranları Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 10 hızlı kart.
📋 Tam detay tablosu: 18 oran ve değerlendirme.
📊 Grafikler: Radar ve sütun.
💡 Akıllı öneriler.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (5 sayfa).

💡 İpuçları: Cari oran < 1 uyarı işaretidir, ROE > %15 olmalıdır.`
        }, {
            name: "İleri Finansal Tahmin Aracı",
            icon: "fa-arrow-trend-up",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Birkaç yıl için finansal tahminler oluşturur, NPV, IRR, Payback, Terminal Değer hesaplar.

1. Başlamadan önce: Para birimini ve şirket adını seçin.

2. Verileri doldurma
📊 Tarihsel veri sütunu: Gelir, satış maliyeti %, operasyon giderleri %, vergi, amortisman, CAPEX, DSO, DIO, DPO.
📈 Büyüme ve değerleme varsayımları sütunu: Gelir büyümesi, tahmin yıl sayısı, WACC, başlangıç işletme sermayesi, ilk yatırım, nihai değer %.

3. "Finansal Tahmini Çalıştır"a tıklayın

4. Sonuçlar nasıl okunur?
🟩 Kartlar: NPV, IRR, Payback, TV.
📋 Tahmini gelir tablosu.
💵 Serbest nakit akışları.
📈 Grafikler.
💰 Proje değerlemesi.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (7 sayfa).

💡 İpuçları: NPV negatifse varsayımları gözden geçirin.`
        }, {
            name: "Çalışan Değerlendirme Modeli",
            icon: "fa-user-check",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
7 alanda 40 kriterle çalışan performansını değerlendirir, 200 üzerinden puan, gelişim önerileri, Word ve Excel dışa aktarma.

1. Araç arayüzü: Çalışan verileri, ilerleme çubuğu, 7 soru bölümü.

2. Kullanım yöntemi: Çalışan verilerini doldurun, her kriteri 1'den 5'e kadar değerlendirin.

3. İlerleme çubuğu: Cevaplanan kriter sayısını gösterir.

4. Sonucu ve önerileri göster: Toplam puan (200 üzerinden), genel derece, detaylı öneriler.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel.

💡 İpuçları: Önerileri bireysel gelişim planı olarak kullanın.`
        }, {
            name: "Yönetici Değerlendirme Ölçeği (Yetenekleri Elde Tutma Zihniyeti)",
            icon: "fa-user-check",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Liderler için yetenekleri elde tutma zihniyetini ölçen 26 ifadeli öz değerlendirme.

1. Araç arayüzü: Kişisel veri gerektirmez, ilerleme çubuğu, her ifade için 4 seçenek.

2. Değerlendirme yöntemi: Cevabı seçin (Her zaman/Çoğunlukla/Bazen/Asla). Yüksek puan = yetenek kaybetme riski.

3. İlerleme çubuğu: 26 ifade.

4. Sonucu ve önerileri göster: 104 üzerinden puan, sınıflandırma (mükemmel/orta/düşük/kritik), detaylı öneriler.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel.

💡 İpuçları: Dürüst olun, turuncu veya kırmızı bölgedeyseniz önerilerle hemen başlayın.`
        }, {
            name: "Menü Mühendisliği (Menu Engineering)",
            icon: "fa-object-group",
            content: `
📌 Bu araç nedir ve size ne sunar?  
BCG matrisini (yıldızlar, nakit inekler, soru işaretleri, köpekler) kullanarak menü analizi.

1. Başlamadan önce: Para birimini ve kurum adını seçin.

2. Verileri doldurma
🟡 Manuel yemek ekleme: İsim, fiyat, maliyet, satış adedi.
🟢 Excel'den içe aktarma: Hazır şablon.

3. "Menüyü Analiz Et ve Önerileri Al"a tıklayın

4. Sonuçlar nasıl okunur?
🟩 Özet kartları: Yemek sayısı, sınıflandırmalar, gelir, net kâr.
📈 Etkileşimli grafik (BCG matrisi).
📋 Öneri tablosu: Her yemek için (devam et, iyileştir, fiyatı yükselt, sil).

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel.

💡 İpuçları: Pazarlamayla soru işaretlerini yıldızlara dönüştürün, stratejik olmayan köpekleri silin.`
        }, {
            name: "CAC ve CLV Hesaplayıcı",
            icon: "fas fa-users",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Müşteri edinme maliyetini (CAC) müşteri yaşam boyu değeriyle (CLV) karşılaştırır.

1. Araç arayüzü: Para birimi, kurum adı, 6 alan.

2. Verileri doldurma: Aylık pazarlama giderleri, yeni müşteriler, ortalama sipariş, yıllık ziyaret sayısı, kalma süresi (yıl), kâr marjı.

3. "CAC ve CLV Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Kartlar: CAC, CLV, CLV/CAC oranı (>3 mükemmel), sınıflandırma.
📈 Grafik.
💡 Stratejik öneriler.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel.

💡 İpuçları: >3 oranı hedefleyin.`
        }, {
            name: "Analiz ve Akıllı İçerik Oluşturma Aracı",
            icon: "fas fa-robot",
            content: `
📌 Bu araç nedir ve size ne sunar?  
Yapay zeka ile içerik oluşturma (rapor analizi, haftalık planlar, viral fikirler, makale yazma, soru cevaplama, video metinleri).

1. Başlamadan önce: Para birimi veya kurum adı gerekmez.

2. Kullanım yöntemi
Adım 1: Hizmet türünü seçin (rapor analizi, haftalık plan, içerik oluşturma, soru cevaplama...).
Adım 2: Talebinizi yazın veya raporunuzu yapıştırın.
Adım 3: "Analiz / Oluşturmayı Başlat"a tıklayın.

3. Sonuçları anlama: Hızlı istatistik kartları, kartlar halinde oluşturulan içerik.

4. İçeriği dışa aktarın: 📄 "Word Olarak Dışa Aktar" butonu.

💡 İpuçları: Açıklamada spesifik olun.`
        }, {
            name: "Nakit Açığı Hesaplayıcı (CCC)",
            icon: "fas fa-money-bill-wave",
            content: `
📌 Bu araç nedir ve neyi ölçer?  
Nakit dönüşüm döngüsü (DIO + DSO - DPO).

1. Başlamadan önce: Para birimi, kurum adı, dönem süresi.

2. Verileri doldurma
🟡 Bilanço: Stok, alacaklar, borçlar (dönem başı ve sonu).
📈 Gelir tablosu: Satılan mal maliyeti, net kredili satışlar.

3. "Nakit Açığını Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Kartlar: DIO, DSO, DPO, CCC ve sınıflandırma (30 günden az mükemmel).
📊 Grafikler.
📋 Hesaplama detayları.
💡 Öneriler.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (6 sayfa).

💡 İpuçları: Negatif CCC, tedarikçilerden mükemmel finansman anlamına gelir.`
        }, {
            name: "Yatırım Analizi (NPV / IRR / Payback)",
            icon: "fa-wave-square",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
NPV, IRR, Payback kullanarak herhangi bir yatırım projesinin fizibilitesini değerlendirir.

1. Araç arayüzü: Para birimi, kurum adı, 3 temel alan, yıllık akış konteyneri.

2. Verileri doldurma: İlk yatırım, iskonto oranı, süre, her yıl için nakit akışları.

3. "Yatırım Göstergelerini Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Kartlar: NPV (pozitif=kârlı), IRR (iskontodan büyük=kabul edilebilir), Payback, iskontolu Payback, nihai karar.
📋 Akış tablosu.
📊 Grafik.
💡 Öneriler.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel (2 sayfa).

💡 İpuçları: NPV ne kadar yüksekse o kadar iyi, IRR > iskonto oranı olmalıdır.`
        }, {
            name: "Yazılım Girişimi Değerlemesi",
            icon: "fa-rocket",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?
Bir yazılım girişiminin (SaaS) finansal ve operasyonel metriklerinden değer tahmini yapar. Sermaye toplamaya hazırlanırken, yatırımcılarla pazarlık ederken veya bir satın alma teklifini değerlendirirken kullanın.

1. Bu araçla neler yapabilirsiniz?
- ARR (Yıllık Yinelenen Gelir) çarpanlarına dayalı gösterge niteliğinde bir değerleme aralığı hesaplar.
- Büyüme, marjlar, müşteri kaybı (churn) ve elde tutma (NRR) üzerinden işletmenin kalitesini değerlendirir.
- Müşteri ekonomisini karşılaştırır: CAC ile LTV ve LTV/CAC oranı.
- Aylık net nakit tükenimi ve eldeki nakitten nakit dayanma süresini ölçer.
- Beklenen çıkış değeri, hedef ROI kat sayısı ve çıkış yılına göre çıkış değerini projelendirir.
- Niteliksel faktörleri (fikir ve çözüm kalitesi, ekip, pazar) puanlayarak değerlemeyi rafine eder.

2. Veriler nasıl doldurulur (adım adım)

🔹 Adım 1: Temel veriler
- Para birimini seçin ve şirket adını yazın.

🔹 Adım 2: Finansal metrikler
- ARR, yıllık büyüme oranı (%), brüt marj (%) ve faaliyet kârı marjı (%) girin.
- Aylık müşteri kayb oranı (%) ve net gelir elde tutma NRR (%) girin.

🔹 Adım 3: Müşteri metrikleri
- Mevcut müşteri sayısı, müşteri edinme maliyeti (CAC) ve müşteri yaşam boyu değeri (LTV) girin.

🔹 Adım 4: Nakit durumu
- Aylık net tükenim ve eldeki nakiti girerek dayanma süresini ölçün.

🔹 Adım 5: Büyüme ve çıkış
- Bu çeyrek ve önceki çeyrek ARR ile önceki çeyrek satış-pazarlama harcamasını girin.
- Beklenen çıkış değeri, hedef ROI kat sayısı ve çıkış yılını girin.

🔹 Adım 6: Niteliksel puan
- Fikir ve çözüm kalitesi, ekip ve pazarı puanlayarak nihai değerlemeyi ayarlayın.

3. Sonuçları okuma
- Değerleme aralığı, yatırımcıların bugün makul olarak ödeyeceği tutarı gösterir.
- LTV/CAC oranının 3'ün üzerinde olması genel olarak sağlıklı kabul edilir.
- Dayanma süresi, yeni finansmana ihtiyaç duymadan kaç ay çalışabileceğinizi gösterir.
`
        }, {
            name: "Senaryo Analizi (What-If Analysis)",
            icon: "fas fa-lightbulb",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Satışlar, maaşlar ve hammadde değişimlerinin net kâr ve kâr marjına etkisini simüle eder.

1. Araç arayüzü: Para birimi, kurum adı, 4 temel alan, 3 değişim oranı alanı.

2. Verileri doldurma
🟡 Mevcut durum: Aylık gelir, maaşlar, hammaddeler, diğer giderler.
⚡ Senaryo değişimleri: Gelir, maaşlar, hammaddelerde değişim yüzdesi.

3. "Simülasyonu Çalıştır"a tıklayın

4. Sonuçlar nasıl okunur?
🟩 4 karşılaştırma kartı (mevcut/senaryo).
📈 Grafikler.
📋 Detaylı karşılaştırma tablosu.
💡 Öneriler ve analiz.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel.

💡 İpuçları: Her seferinde tek bir faktörü değiştirmeyi deneyin.`
        }, {
            name: "Bilgi ve Beceri Değerlendirmesi",
            icon: "fa-award",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
Bilgi, yetenekler, yönelimler ve davranışlarda hızlı öz değerlendirme (16 kriter), gelişim önerileriyle.

1. Araç arayüzü: Kişisel veriler, ilerleme çubuğu, 16 kriter.

2. Değerlendirme yöntemi: 0 (farkında değil) ile 5 (uzman) arası ölçek. Renk kodlaması: kırmızı (0-1), turuncu (2).

3. Sonucu ve önerileri göster: 80 üzerinden toplam puan, genel seviye, kırmızı ve turuncu alanlar için öneriler.

4. Raporları dışa aktarın: 📄 Word ve 📊 Excel (puan renklendirmeli).

💡 İpuçları: Önce kırmızı alanlara odaklanın.`
        }, {
            name: "Restoran Değerleme Hesaplayıcısı",
            icon: "fa-ranking-star",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?  
EBITDA ve çarpana dayalı restoranın piyasa değerini, kira sözleşmesi etkisi ve payınızla birlikte tahmin eder.

1. Başlamadan önce: Para birimini ve restoran adını seçin.

2. Girdi açıklamaları
🟡 Temel veriler: Kuruluş yılı, kira bitiş yılı.
💰 Finansal veriler: Gelir, COGS, OPEX, D&A, faizler, vergiler, borçlar, varlık değeri, piyasa çarpanı.
💉 Ek sermaye enjeksiyonu (isteğe bağlı).
👤 Payınız (%).

3. "Değerlemeyi Hesapla"ya tıklayın

4. Sonuçlar nasıl okunur?
🟩 Kartlar: EBITDA, işletme değeri, adil değer, payınızın fiyatı, geri ödeme süresi, verimlilik endeksi.
⚠️ Kira uyarısı.
📈 Duyarlılık analizi.

5. Raporları dışa aktarın: 📄 Word ve 📊 Excel.

💡 İpuçları: Normal çarpan 2.5 – 3.5 arasındadır.`
        },
                {
            name: "13 Haftalık Nakit Akışı Tahmini",
            icon: "fa-calendar-week",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?
Tam bir çeyrek (13 hafta) boyunca hafta hafta nakit akışı tahmini oluşturur. Restoran, perakende ve müteahhitlik gibi haftalık ödeme döngüsüne sahip işletmelerde likidite yönetimi için vazgeçilmezdir.

1. Bu araçla neler yapabilirsiniz?
- Haftalık nakit satışları, kart satışları ve alacak tahsilatını tahmin eder.
- Haftalık ödemeleri planlar: tedarikçiler, maaşlar, kira, kamu giderleri, vergiler ve krediler.
- Her hafta için açılış bakiyesi, toplam girişler, toplam çıkışlar, net değişim ve kapanış bakiyesini izler.
- Minimum nakit rezervi belirler ve bakiye ona yaklaşınca uyarı verir.
- 13 haftalık nakit bakiyesi grafiğini görüntüler.
- Tahmin tablosu ve grafik içeren profesyonel bir Excel raporu dışa aktarır.

2. Veriler nasıl doldurulur (adım adım)

🔹 Adım 1: Kurum ve para birimi
- Para birimini seçin ve faydalanan kurum adını yazın.

🔹 Adım 2: Açılış durumu
- Açılış nakit bakiyesini ve minimum nakit rezervi eşiğini girin.

🔹 Adım 3: Haftalık girişler
- Her hafta için beklenen nakit satışları, kart satışları ve alacak tahsilatını girin.

🔹 Adım 4: Haftalık çıkışlar
- Her hafta için tedarikçi ödemeleri, maaşlar, kira, kamu giderleri, vergiler ve kredi taksitlerini girin.

3. Sonuçları okuma
- Kapanış bakiyesi = açılış + girişler − çıkışlar, haftadan haftaya aktarılır.
- Bakiyenin minimum rezerve yaklaştığı haftalar vurgulanır — bu haftaları karşılamak için önceden plan yapın.
- En sıkışık haftaları olmadan önce görmek için grafiği kullanın.
`
        },,

        {
            name: "CAGR Hesaplayıcı (Nominal ve Reel)",
            icon: "fa-chart-line",
            content: `
📌 Bu araç nedir ve ne zaman kullanılır?
Bir veya iki yatırımın Bileşik Yıllık Büyüme Oranını (CAGR) hesaplar ve nominal ile reel (enflasyona göre düzeltilmiş) getirileri karşılaştırır. Yatırım performansını değerlendirmek, iki seçeneği karşılaştırmak veya işletme büyümesini ölçmek için kullanın.

1. Bu araçla neler yapabilirsiniz?
- Başlangıç değeri, son değer ve yıl sayısından nominal CAGR hesaplar.
- Yıllık enflasyonu düşerek reel CAGR hesaplar.
- İki yatırımı (A ve B) yan yana karşılaştırır, berabere göstergesiyle.
- Büyüme eğrisi grafiğini görüntüler (nominal, reel ve basit büyüme).
- Girdiler, sonuçlar ve büyüme eğrisi içeren profesyonel bir Excel raporu dışa aktarır.

2. Veriler nasıl doldurulur (adım adım)

🔹 Adım 1: Kurum ve para birimi
- Para birimini seçin ve rapor faydalanan adını yazın.

🔹 Adım 2: Yatırım A
- Başlangıç değeri, son değer, yıl sayısı ve yıllık enflasyonu girin.

🔹 Adım 3: Yatırım B (isteğe bağlı)
- İkinci yatırım için aynı girdileri girerek Yatırım A ile karşılaştırın.
- Veri girilmezse yalnızca Yatırım A analiz edilir.

3. Sonuçları okuma
- Nominal CAGR, enflasyon öncesi yıllık büyümeyi gösterir.
- Reel CAGR, enflasyon düşüldükten sonra gerçek satın alma gücü büyümesini gösterir.
- ⚖️ göstergesi, hangi yatırımın daha yüksek büyüme elde ettiğini veya berabere kaldığını gösterir.
`
        }];

        // ============================================================
        // Araçları katlanabilir özellikle göster
        // ============================================================
        const container = document.getElementById('toolsContainer');
        const searchInput = document.getElementById('searchInput');
        const noResults = document.getElementById('noResults');

        function renderTools(filter = '') {
            const filtered = tools.filter(tool =>
                tool.name.includes(filter) || filter === ''
            );
            container.innerHTML = '';
            if (filtered.length === 0) {
                noResults.style.display = 'block';
                return;
            }
            noResults.style.display = 'none';

            filtered.forEach((tool, index) => {
                const card = document.createElement('div');
                card.className = 'tool-card';

                const header = document.createElement('div');
                header.className = 'collapsible-header';
                header.innerHTML = `
                    <h2><i class="fas ${tool.icon}"></i> ${tool.name}</h2>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                `;

                const content = document.createElement('div');
                content.className = 'tool-content';
                content.innerHTML = tool.content;

                header.addEventListener('click', function() {
                    const isOpen = content.classList.contains('open');
                    content.classList.toggle('open');
                    const icon = this.querySelector('.toggle-icon');
                    if (icon) {
                        icon.classList.toggle('open');
                    }
                });

                if (index === 0 && filter === '') {
                    content.classList.add('open');
                    header.querySelector('.toggle-icon').classList.add('open');
                }

                card.appendChild(header);
                card.appendChild(content);
                container.appendChild(card);
            });
        }

        searchInput.addEventListener('input', function(e) {
            const val = e.target.value.trim();
            renderTools(val);
        });

        renderTools();
    