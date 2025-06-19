# İbraam v2 - Personel ve Envanter Yönetim Sistemi

Modern React ve TypeScript ile geliştirilmiş kapsamlı personel ve envanter yönetim sistemi.

## 🚀 Özellikler

### 📊 Dashboard
- Genel sistem istatistikleri
- Son zimmet işlemleri
- Hızlı erişim kartları
- Sistem özeti

### 👥 Personel Yönetimi
- Personel ekleme, düzenleme, silme
- Departman ve pozisyon takibi
- İletişim bilgileri yönetimi
- İşe başlama tarihi takibi

### 📦 Envanter Yönetimi
- Envanter öğesi ekleme, düzenleme, silme
- Kategori, marka, model takibi
- Seri numarası yönetimi
- Satın alma tarihi ve değer takibi

### 🚗 Araç Yönetimi
- Araç ekleme, düzenleme, silme
- Marka, model, yıl, plaka bilgileri
- Araç tipi kategorileri
- Araçlara envanter öğesi atama

### 📋 Zimmet İşlemleri
- Personele araç zimmetleme
- Aktif zimmetler takibi
- Araç iade işlemleri
- Zimmet geçmişi

### 📈 İşlem Geçmişi
- Tüm sistem işlemlerinin kaydı
- Filtreleme ve arama özellikleri
- Detaylı değişiklik takibi
- Kullanıcı bazlı işlem kayıtları

## 🛠️ Teknolojiler

### Frontend
- **React 18** - Modern React hooks ve functional components
- **TypeScript** - Type safety ve geliştirici deneyimi
- **Material-UI (MUI)** - Modern ve responsive UI bileşenleri
- **React Router** - Client-side routing
- **React Hook Form** - Form yönetimi ve validasyon
- **Context API** - Global state yönetimi

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Hafif ve taşınabilir veritabanı
- **CORS** - Cross-origin resource sharing

### UI/UX
- **Material Design** - Google'ın tasarım dili
- **Responsive Design** - Mobil uyumlu tasarım
- **Data Grid** - Gelişmiş tablo bileşenleri
- **Form Validation** - Gerçek zamanlı form doğrulama

## 📁 Proje Yapısı

```
ibraamv2/
├── public/                 # Static dosyalar
├── src/
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   └── layout/         # Layout bileşenleri
│   ├── context/           # Context API
│   ├── pages/             # Sayfa bileşenleri
│   │   ├── Dashboard/     # Dashboard sayfası
│   │   ├── Personnel/     # Personel yönetimi
│   │   ├── Inventory/     # Envanter yönetimi
│   │   ├── Vehicles/      # Araç yönetimi
│   │   ├── Assignments/   # Zimmet işlemleri
│   │   └── History/       # İşlem geçmişi
│   ├── services/          # API servisleri
│   ├── App.tsx           # Ana uygulama bileşeni
│   └── index.tsx         # Uygulama giriş noktası
├── server/               # Backend sunucu
│   └── index.js         # Express sunucu
├── package.json         # Proje bağımlılıkları
└── tsconfig.json       # TypeScript konfigürasyonu
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn

### Kurulum
```bash
# Projeyi klonlayın
git clone [repository-url]
cd ibraamv2

# Bağımlılıkları yükleyin
npm install
```

### Çalıştırma

#### Geliştirme Ortamı
```bash
# Backend sunucusunu başlatın (Terminal 1)
npm run server

# Frontend uygulamasını başlatın (Terminal 2)
npm start
```

#### Tek Komutla Çalıştırma
```bash
# Hem backend hem frontend'i aynı anda başlatır
npm run dev
```

### Erişim
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📊 Veritabanı

Uygulama SQLite veritabanı kullanır. İlk çalıştırmada otomatik olarak:
- Gerekli tablolar oluşturulur
- Örnek veriler eklenir
- Veritabanı dosyası `server/database.sqlite` konumunda oluşturulur

### Tablolar
- **personnel** - Personel bilgileri
- **inventory** - Envanter öğeleri
- **vehicles** - Araç bilgileri
- **assignments** - Zimmet işlemleri
- **history** - İşlem geçmişi

## 🔧 API Endpoints

### Personel
- `GET /api/personnel` - Tüm personeli listele
- `POST /api/personnel` - Yeni personel ekle
- `PUT /api/personnel/:id` - Personel güncelle
- `DELETE /api/personnel/:id` - Personel sil

### Envanter
- `GET /api/inventory` - Tüm envanter öğelerini listele
- `POST /api/inventory` - Yeni envanter öğesi ekle
- `PUT /api/inventory/:id` - Envanter öğesi güncelle
- `DELETE /api/inventory/:id` - Envanter öğesi sil

### Araçlar
- `GET /api/vehicles` - Tüm araçları listele
- `POST /api/vehicles` - Yeni araç ekle
- `PUT /api/vehicles/:id` - Araç güncelle
- `DELETE /api/vehicles/:id` - Araç sil

### Zimmet İşlemleri
- `GET /api/assignments` - Tüm zimmet işlemlerini listele
- `POST /api/assignments` - Yeni zimmet oluştur
- `PUT /api/assignments/:id` - Zimmet güncelle
- `PUT /api/assignments/:id/return` - Araç iade et

### Geçmiş
- `GET /api/history` - İşlem geçmişini listele

## 🎨 Özellikler

### Responsive Tasarım
- Mobil, tablet ve masaüstü uyumlu
- Material-UI'nin responsive grid sistemi
- Adaptive navigation menu

### Form Validasyonu
- Gerçek zamanlı form doğrulama
- Türkçe hata mesajları
- Required field kontrolü
- Email format kontrolü

### Data Management
- Gelişmiş tablo bileşenleri
- Sıralama ve filtreleme
- Sayfalama (pagination)
- Arama özellikleri

### State Management
- Context API ile global state
- Optimistic updates
- Error handling
- Loading states

## 🔒 Güvenlik

- Input validation
- SQL injection koruması
- CORS konfigürasyonu
- Error handling

## 📝 Geliştirme Notları

### Code Style
- TypeScript strict mode
- ESLint konfigürasyonu
- Functional components
- Custom hooks kullanımı

### Performance
- React.memo optimizasyonları
- Lazy loading
- Efficient re-rendering
- Optimized bundle size

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.

---

**İbraam v2** - Modern, güvenli ve kullanıcı dostu personel ve envanter yönetim sistemi.