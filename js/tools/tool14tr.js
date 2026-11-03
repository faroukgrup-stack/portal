
    AOS.init({ duration: 800, once: true, offset: 100 });

    // Hesap makinesi
    const calcDisplay = document.getElementById('calcDisplay');
    let currentCalcInput = '';
    function handleCalc(v) {
        if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
        if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
        if (v === '=') { try { let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/')); calcDisplay.value = r; currentCalcInput = r.toString(); } catch(e) { calcDisplay.value = 'Hata'; currentCalcInput = ''; } return; }
        currentCalcInput += v; calcDisplay.value = currentCalcInput;
    }
    document.querySelectorAll('.calc-btn').forEach(btn => { btn.addEventListener('click', function(e) { e.stopPropagation(); const v = this.dataset.val; if (v !== undefined) handleCalc(v); }); });
    const modalEl = document.getElementById('calculatorModal');
    document.getElementById('calculatorBtn').addEventListener('click', function(e) { e.stopPropagation(); modalEl.classList.add('active'); calcDisplay.value = currentCalcInput; });
    document.getElementById('modalClose').addEventListener('click', function() { modalEl.classList.remove('active'); });
    modalEl.addEventListener('click', function(e) { if (e.target === modalEl) modalEl.classList.remove('active'); });
    document.addEventListener('keydown', function(e) { if (!modalEl.classList.contains('active')) return; e.preventDefault(); const k = e.key; if (k >= '0' && k <= '9') handleCalc(k); else if (k === '.') handleCalc('.'); else if (k === '+' || k === '-' || k === '*' || k === '/') handleCalc(k); else if (k === 'Enter' || k === '=') handleCalc('='); else if (k === 'Backspace') handleCalc('⌫'); else if (k === 'Escape') modalEl.classList.remove('active'); else if (k.toLowerCase() === 'c') handleCalc('C'); });

    function showLoading(title, msg) { document.getElementById('loadingTitle').textContent = title; document.getElementById('loadingMsg').textContent = msg; document.getElementById('exportLoading').classList.add('show'); }
    function hideLoading() { document.getElementById('exportLoading').classList.remove('show'); }

    // Tüm düzeltici öneriler
    const correctiveActions = {
        rec1: { risk: "Yüksek", action: "Sıcaklık yüksekse ürünler reddedilmelidir.", recommendation: "Kalibrasyonu yapılmış termometre kullanın." },
        rec2: { risk: "Orta", action: "Hasar görmüş ambalajlar ayrılmalıdır.", recommendation: "Ambalajları teslim alırken kontrol edin." },
        rec3: { risk: "Yüksek", action: "Son kullanma tarihi geçmiş ürünler kabul edilmemeli.", recommendation: "Teslim almadan önce tarihleri kontrol edin." },
        rec4: { risk: "Orta", action: "Yüksek riskli ürünler için sağlık sertifikası gereklidir.", recommendation: "Sertifikaları talep edin ve dosyada saklayın." },
        rec5: { risk: "Orta", action: "Çiğ ve pişmiş ürünler ayrı taşınmalıdır.", recommendation: "Taşıma sırasında ayrı alanlar kullanın." },
        sto1: { risk: "Yüksek", action: "Soğutucu sıcaklığı 4°C'yi geçmemeli.", recommendation: "Sıcaklığı günde iki kez kontrol edin." },
        sto2: { risk: "Yüksek", action: "Dondurucu sıcaklığı -18°C'den yüksek olmamalı.", recommendation: "Sıcaklık kaydını günlük tutun." },
        sto3: { risk: "Orta", action: "Çiğ malzemeler pişmişlerin altında olmalı.", recommendation: "Rafları yeniden düzenleyin." },
        sto4: { risk: "Yüksek", action: "Kimyasallar gıdalardan uzakta saklanmalı.", recommendation: "Kimyasallar için ayrı bir dolap kullanın." },
        sto5: { risk: "Orta", action: "Buz birikintisi soğutmayı engeller.", recommendation: "Düzenli olarak buz çözme işlemi yapın." },
        sto6: { risk: "Orta", action: "FIFO uygulanmalıdır.", recommendation: "Yeni ürünleri eski ürünlerin arkasına koyun." },
        prep1: { risk: "Yüksek", action: "El yıkama kurallarına uyulmalı.", recommendation: "El yıkama istasyonları sağlayın ve denetleyin." },
        prep2: { risk: "Yüksek", action: "Farklı kesme tahtaları kullanılmalı.", recommendation: "Renk kodlu kesme tahtaları kullanın." },
        prep3: { risk: "Yüksek", action: "Çiğ malzeme sonrası dezenfeksiyon şart.", recommendation: "Onaylı dezenfektanlar kullanın." },
        prep4: { risk: "Yüksek", action: "Bozulabilir ürünler soğukta kalmalı.", recommendation: "Ürünleri hemen buzdolabına koyun." },
        prep5: { risk: "Yüksek", action: "Oda sıcaklığında çözdürme güvenli değil.", recommendation: "Buzdolabında veya mikrodalgada çözdürün." },
        cook1: { risk: "Yüksek", action: "Tavuk 74°C'ye ulaşmalı.", recommendation: "Termometre ile kontrol edin ve kaydedin." },
        cook2: { risk: "Yüksek", action: "Kıyma 71°C'ye ulaşmalı.", recommendation: "Termometre kullanın." },
        cook3: { risk: "Yüksek", action: "Balık 63°C'ye ulaşmalı.", recommendation: "Pişirme sıcaklığını kontrol edin." },
        cook4: { risk: "Yüksek", action: "Yeniden ısıtma yetersiz olmamalı.", recommendation: "74°C'ye ısıtın." },
        cook5: { risk: "Orta", action: "Sıcaklık kaydı yapılmalı.", recommendation: "Pişirme günlüğü tutun." },
        cool1: { risk: "Yüksek", action: "Soğutma hızlı olmalı.", recommendation: "Sığ kaplar ve buz banyosu kullanın." },
        cool2: { risk: "Yüksek", action: "4°C'ye tam soğutma şart.", recommendation: "Süreyi ve sıcaklığı izleyin." },
        cool3: { risk: "Orta", action: "Derin kaplar soğutmayı yavaşlatır.", recommendation: "10 cm'den derin olmayan kaplar kullanın." },
        cool4: { risk: "Orta", action: "Açık gıdalar kirlenir.", recommendation: "Kapatarak saklayın." },
        per1: { risk: "Orta", action: "Kirli kıyafet gıdayı kirletir.", recommendation: "Günlük temiz kıyafet sağlayın." },
        per2: { risk: "Orta", action: "Saçlar gıdaya düşebilir.", recommendation: "Bone veya ağ takılmasını zorunlu kılın." },
        per3: { risk: "Düşük", action: "Takılar bakteri barındırabilir.", recommendation: "Takıların çıkarılmasını isteyin." },
        per4: { risk: "Düşük", action: "Uzun tırnaklar bakteri saklar.", recommendation: "Düzenli tırnak kontrolü yapın." },
        per5: { risk: "Yüksek", action: "Hasta çalışan bulaştırır.", recommendation: "Raporlama sistemi kurun." },
        per6: { risk: "Yüksek", action: "El yıkama atlanmamalı.", recommendation: "Lavaboları ve talimatları sağlayın." },
        clean1: { risk: "Yüksek", action: "Kirli yüzeyler gıdayı kirletir.", recommendation: "Her kullanımdan sonra temizleyin." },
        clean2: { risk: "Yüksek", action: "Kirli lavabolar hastalık saçar.", recommendation: "Günlük olarak dezenfekte edin." },
        clean3: { risk: "Orta", action: "Döküntüler haşere çeker.", recommendation: "Döküntüleri hemen temizleyin." },
        clean4: { risk: "Yüksek", action: "Yanlış dezenfektan etkisizdir.", recommendation: "Onaylı ürünleri talimatla kullanın." },
        clean5: { risk: "Orta", action: "Çizelge olmadan aksaklık olur.", recommendation: "Temizlik çizelgesi asın ve imzalayın." },
        pest1: { risk: "Yüksek", action: "Haşere varsa hemen müdahale.", recommendation: "Günlük kontrol yapın." },
        pest2: { risk: "Yüksek", action: "Delikler haşere girişidir.", recommendation: "Tüm delikleri kapatın." },
        pest3: { risk: "Orta", action: "Tuzaklar haşereyi gösterir.", recommendation: "Stratejik noktalara tuzak yerleştirin." },
        pest4: { risk: "Yüksek", action: "Profesyonel destek şart.", recommendation: "Sözleşmeli firma ile çalışın." },
        doc1: { risk: "Yüksek", action: "Sıcaklık kaydı izleme için şart.", recommendation: "Günde iki kez kaydedin." },
        doc2: { risk: "Yüksek", action: "Pişirme kaydı denetim için önemli.", recommendation: "Özel defter tutun." },
        doc3: { risk: "Orta", action: "Kayıtlar izleme içindir.", recommendation: "6 ay saklayın." },
        doc4: { risk: "Orta", action: "İmza sorumluluktur.", recommendation: "Günlük imza alın." },
        tr1: { risk: "Yüksek", action: "Eğitimsiz personel risk oluşturur.", recommendation: "Eğitim takvimi oluşturun." },
        tr2: { risk: "Orta", action: "Talimatlar hatırlatıcıdır.", recommendation: "Görünür yerlere asın." },
        tr3: { risk: "Orta", action: "Düzenli hatırlatma önemlidir.", recommendation: "Haftalık brifing yapın." }
    };

    function setupRecommendations() {
        document.querySelectorAll('.haccp-item').forEach(item => {
            item.addEventListener('change', function() {
                const id = this.dataset.id; const recBox = document.getElementById(`recommendation-${id}`);
                if (!this.checked) { const data = correctiveActions[id]; if (data) { recBox.style.display = 'block'; recBox.innerHTML = `<strong>⚠️ Risk Seviyesi: ${data.risk}</strong><br><strong>Düzeltici Eylem:</strong> ${data.action}<br><strong>Öneri:</strong> ${data.recommendation}`; } } else { recBox.style.display = 'none'; }
            });
        });
    }

    function collectAuditData() {
        const date = document.getElementById('checkDate').value;
        const inspector = document.getElementById('inspectorName').value || 'Belirtilmemiş';
        const signatureName = document.getElementById('signatureName').value || inspector;
        const signature = document.getElementById('signature').value || '';
        const items = document.querySelectorAll('.haccp-item');
        let checked = 0; const details = [];
        items.forEach(item => {
            const id = item.dataset.id; const label = item.closest('.checklist-item').querySelector('label').innerText;
            const note = document.getElementById(`note-${id}`)?.value || ''; const status = item.checked;
            if (status) checked++;
            const data = correctiveActions[id] || {};
            details.push({ id, label, status, note, risk: data.risk || '', action: data.action || '', recommendation: data.recommendation || '' });
        });
        const total = items.length; const percent = Math.round((checked / total) * 100);
        let evaluation = '', overallRiskLevel = '';
        if (percent === 100) { evaluation = 'Mükemmel! Tam uyum'; overallRiskLevel = 'Düşük'; }
        else if (percent >= 90) { evaluation = 'Çok İyi'; overallRiskLevel = 'Düşük'; }
        else if (percent >= 75) { evaluation = 'Kabul Edilebilir'; overallRiskLevel = 'Orta'; }
        else if (percent >= 50) { evaluation = 'İyileştirme Gerekli'; overallRiskLevel = 'Yüksek'; }
        else { evaluation = 'Uyumsuz'; overallRiskLevel = 'Çok Yüksek'; }
        return { date, inspector, signatureName, signature, details, checked, total, percent, evaluation, overallRiskLevel };
    }

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const data = collectAuditData();
        document.getElementById('resultArea').style.display = 'flex';
        document.getElementById('scoreDisplay').textContent = data.percent + '%';
        document.getElementById('evaluationText').textContent = data.evaluation;
        const riskEl = document.getElementById('overallRiskDisplay');
        riskEl.textContent = `Genel Risk Seviyesi: ${data.overallRiskLevel}`;
        riskEl.className = 'overall-risk ' + (data.overallRiskLevel.includes('Düşük') ? 'risk-level-low' : (data.overallRiskLevel.includes('Orta') ? 'risk-level-medium' : 'risk-level-high'));
        window.lastAuditData = data;
    });

    // Excel ve Word dışa aktarım (önceki kodun aynısı, yerden kazanmak için kısa tutuluyor, çalışır)
    document.getElementById('exportExcelBtn').addEventListener('click', async function() { if (!window.lastAuditData) { alert('Lütfen önce "Sonucu Hesapla"ya tıklayın.'); return; } showLoading('Excel raporu oluşturuluyor...', 'Sayfalar oluşturuluyor'); try { const data = window.lastAuditData; const workbook = new ExcelJS.Workbook(); workbook.creator = 'FAROUK GRUP'; const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050'; const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA'; function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};} function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};} function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;} function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}
        const cv = workbook.addWorksheet('Kapak', { views: [{ rightToLeft: true, showGridLines: false }] }); [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w); cv.getRow(2).height=80; cv.getRow(4).height=60; cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1); bc.value='FAROUK GRUP\nDanışmanlık ve İşletme'; bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'}; mh(cv,1,4,4,`HACCP Denetim Raporu\n${data.inspector}`,DB,GL,18); const inf=[['📋 Tarih',data.date],['👤 Denetçi',data.inspector],['📊 Uyum Oranı',`${data.percent}%`],['⚠️ Risk Seviyesi',data.overallRiskLevel]]; let ir=6; inf.forEach(([l,v],idx)=>{ cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4); const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v; const bg=idx%2===0?AR:'FFFEFCF6'; ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}}); ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}}); cv.getRow(ir).height=28; ir++; });
        const detailSheet = workbook.addWorksheet('Denetim Detayları', { views: [{ rightToLeft: true, showGridLines: false }] }); detailSheet.getColumn(1).width = 5; detailSheet.getColumn(2).width = 50; detailSheet.getColumn(3).width = 15; detailSheet.getColumn(4).width = 20; detailSheet.getColumn(5).width = 30; mh(detailSheet,1,5,1,'📋 HACCP Denetim Listesi',DB,GL,14); detailSheet.getRow(1).height=40; detailSheet.addRow(['Kalem', 'Durum', 'Risk Seviyesi', 'Notlar', 'Öneri']); const headerRow = detailSheet.getRow(2); headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } }; data.details.forEach(item => { detailSheet.addRow([item.label, item.status ? '✅ Uygun' : '❌ Uygun Değil', item.risk, item.note, item.status ? '' : item.recommendation]); });
        const summarySheet = workbook.addWorksheet('Özet', { views: [{ rightToLeft: true, showGridLines: false }] }); summarySheet.getColumn(1).width = 30; summarySheet.getColumn(2).width = 40; mh(summarySheet,1,2,1,'📊 Denetim Özeti',DB,GL,14); summarySheet.getRow(1).height=40; const summaryData = [ ['Uyum Oranı', `${data.percent}%`], ['Değerlendirme', data.evaluation], ['Genel Risk Seviyesi', data.overallRiskLevel], ['Uygun Kalem', data.checked], ['Toplam Kalem', data.total], ['Denetçi İmzası', `${data.signatureName} - ${data.signature || '__________'}`] ]; summaryData.forEach((row,idx) => { const r = idx + 3; const lc = summarySheet.getCell(r,1); lc.value = row[0]; ap(lc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,true,'right')); const vc = summarySheet.getCell(r,2); vc.value = row[1]; ap(vc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,false,'center')); });
        const buffer = await workbook.xlsx.writeBuffer(); const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); const now = new Date(); const fileName = `HACCP_Raporu_${data.date}_${now.toISOString().slice(0,10)}.xlsx`; saveAs(blob, fileName); } catch(err) { alert('Excel hatası: ' + err.message); } finally { hideLoading(); } });

    document.getElementById('exportWordBtn').addEventListener('click', async function() { if (!window.lastAuditData) { alert('Lütfen önce "Sonucu Hesapla"ya tıklayın.'); return; } showLoading('Word raporu oluşturuluyor...', 'Veriler toplanıyor'); try { const data = window.lastAuditData; const now = new Date(); const dateStr = now.toLocaleDateString('tr-TR'); const resultArea = document.getElementById('resultArea'); let resultImg = ''; if (resultArea) { try { const origBg = resultArea.style.backgroundColor; resultArea.style.backgroundColor = '#ffffff'; const canvas = await html2canvas(resultArea, { scale: 2, backgroundColor: '#ffffff' }); resultArea.style.backgroundColor = origBg; resultImg = canvas.toDataURL('image/png'); } catch(e) {} } let itemsHTML = ''; data.details.forEach(item => { const statusColor = item.status ? '#155724' : '#721c24'; const statusText = item.status ? '✅ Uygun' : '❌ Uygun Değil'; itemsHTML += `<tr><td style="border:1px solid #b8860b;padding:8px;text-align:right;">${item.label}</td><td style="border:1px solid #b8860b;padding:8px;text-align:center;color:${statusColor};font-weight:bold;">${statusText}</td><td style="border:1px solid #b8860b;padding:8px;text-align:center;">${item.risk}</td><td style="border:1px solid #b8860b;padding:8px;text-align:center;">${item.note || '-'}</td><td style="border:1px solid #b8860b;padding:8px;text-align:right;">${item.status ? '-' : item.recommendation}</td></tr>`; }); const fullHtml = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'><title>HACCP Raporu - FAROUK GRUP</title><style>body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}.cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}.cover h1{font-size:32px;color:#b8860b;margin:0;}.cover h2{font-size:24px;color:#b48554;margin:5px 0;}.cover p{color:#666;}table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}th{background:#fefcf6;color:#b8860b;font-weight:bold;}.signature{margin-top:40px;display:flex;justify-content:space-between;flex-wrap:wrap;}.chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}.footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}</style></head><body><div class="cover"><h1>FAROUK GRUP</h1><h2>📋 Günlük HACCP Denetim Raporu</h2><p>Tarih: ${data.date} | Denetçi: ${data.inspector}</p><p>Rapor Tarihi: ${dateStr}</p></div>${resultImg ? `<div style="text-align:center;margin:20px 0;"><img src="${resultImg}" style="max-width:100%;border:1px solid #b8860b;border-radius:10px;" /></div>` : ''}<h2 style="color:#b8860b;">Denetim Sonucu: ${data.percent}% - ${data.evaluation}</h2><h3 style="color:#b8860b;">Genel Risk Seviyesi: ${data.overallRiskLevel}</h3><table><thead><tr><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Kalem</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Durum</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Risk</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Notlar</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Öneri</th></tr></thead><tbody>${itemsHTML}</tbody></table><div class="signature"><div><strong>Denetçi Adı:</strong> ${data.signatureName}</div><div><strong>İmza:</strong> ${data.signature || '________________'}</div></div><div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()} | www.farouk-grup.com</div></body></html>`; const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `HACCP_Raporu_${data.date}_${now.toISOString().slice(0,10)}.doc`; link.click(); URL.revokeObjectURL(link.href); } catch(err) { alert('Word hatası: ' + err.message); } finally { hideLoading(); } });

    document.getElementById('checkDate').value = new Date().toISOString().split('T')[0];
    setupRecommendations();
