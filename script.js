let arabaAnimasyon;
let hareketEdiyor = false;
let mevcutPozisyon = 50;
let mevcutHiz = 0;
const maksimumHiz = 10;
const hizlanma = 0.03;
const yavaslama = 0.05;
const geriTepmeHizi = -0.8; // Daha yavaş geri tepme hızı
let carpismaDurumu = false;
let animasyonId = null;

const araba = document.querySelector('.car');
const onTekerlek = document.querySelector('.front-wheel svg');
const arkaTekerlek = document.querySelector('.back-wheel svg');
const baslatBtn = document.getElementById('startBtn');
const durdurBtn = document.getElementById('stopBtn');
const engel = document.querySelector('.obstacle');

// Tekerlek özellikleri
const tekerlekCap = 40; // piksel cinsinden tekerlek çapı
const tekerlekCevre = Math.PI * tekerlekCap; // tekerlek çevresi
let sonPozisyon = 50; // Son pozisyonu takip etmek için

function carpismaKontrol() {
    const arabaRect = araba.getBoundingClientRect();
    const engelRect = engel.getBoundingClientRect();
    
    return !(arabaRect.right < engelRect.left || 
             arabaRect.left > engelRect.right || 
             arabaRect.bottom < engelRect.top || 
             arabaRect.top > engelRect.bottom);
}

function arabaKaybol() {
    let opaklık = 1;
    const kaybolmaHizi = 0.02;
    
    function kaybolmaAnimasyonu() {
        opaklık -= kaybolmaHizi;
        araba.style.opacity = opaklık;
        
        if (opaklık > 0) {
            requestAnimationFrame(kaybolmaAnimasyonu);
        }
    }
    
    kaybolmaAnimasyonu();
}

function tekerlekDonusunuGuncelle(yeniPozisyon) {
    // Katedilen mesafeyi hesapla
    const katedilenMesafe = yeniPozisyon - sonPozisyon;
    sonPozisyon = yeniPozisyon;
    
    // Tekerleğin kaç derece dönmesi gerektiğini hesapla
    const donusDerece = (katedilenMesafe / tekerlekCevre) * 360;
    
    // Mevcut dönüş açılarını al
    const mevcutOnTekerlek = parseFloat(onTekerlek.style.transform?.match(/-?\d+(\.\d+)?/) || 0); // used chatgpt to find this
    const mevcutArkaTekerlek = parseFloat(arkaTekerlek.style.transform?.match(/-?\d+(\.\d+)?/) || 0); // used chatgpt to find this
    
    // Yeni dönüş açılarını hesapla
    const yeniOnTekerlek = mevcutOnTekerlek + donusDerece;
    const yeniArkaTekerlek = mevcutArkaTekerlek + donusDerece;
    
    // Tekerlekleri döndür
    onTekerlek.style.transform = `rotate(${yeniOnTekerlek}deg)`;
    arkaTekerlek.style.transform = `rotate(${yeniArkaTekerlek}deg)`;
}

function oyunuSifirla() {
    if (animasyonId) {
        cancelAnimationFrame(animasyonId);
        animasyonId = null;
    }
    mevcutPozisyon = 50;
    sonPozisyon = 50;
    mevcutHiz = 0;
    carpismaDurumu = false;
    hareketEdiyor = false;
    araba.style.left = `${mevcutPozisyon}px`;
    araba.style.opacity = 1; // Opaklığı sıfırla
}

function arabaPozisyonunuGuncelle() {
    if (carpismaKontrol() && !carpismaDurumu) {
        carpismaDurumu = true;
        mevcutHiz = geriTepmeHizi;
        
        // Yavaşça dur ve kaybol
        const durmaZamani = setInterval(() => {
            if (Math.abs(mevcutHiz) > 0.01) {
                mevcutHiz *= 0.87; // Yavaşça hızı azalt
            } else {
                clearInterval(durmaZamani);
                mevcutHiz = 0;
                hareketEdiyor = false;
                
                // 1.5 saniye sonra kaybolma animasyonunu başlat
                setTimeout(() => {
                    arabaKaybol();
                }, 1500);
            }
        }, 50);
    }

    if (hareketEdiyor && !carpismaDurumu) {
        mevcutHiz = Math.min(maksimumHiz, mevcutHiz + hizlanma);
    } else if (!hareketEdiyor && mevcutHiz > 0) {
        mevcutHiz = Math.max(0, mevcutHiz - yavaslama);
    }

    if (mevcutHiz !== 0) {
        const yeniPozisyon = mevcutPozisyon + mevcutHiz;
        
        // Ekran sınırları kontrolü
        if (yeniPozisyon >= 0) {
            mevcutPozisyon = yeniPozisyon;
            araba.style.left = `${mevcutPozisyon}px`;
            tekerlekDonusunuGuncelle(yeniPozisyon);
        }
        
        animasyonId = requestAnimationFrame(arabaPozisyonunuGuncelle);
    } else {
        mevcutHiz = 0;
        if (animasyonId) {
            cancelAnimationFrame(animasyonId);
            animasyonId = null;
        }
    }
}

baslatBtn.addEventListener('click', () => {
    oyunuSifirla(); // Önce oyunu sıfırla
    hareketEdiyor = true;
    arabaPozisyonunuGuncelle();
});

durdurBtn.addEventListener('click', () => {
    hareketEdiyor = false;
});
