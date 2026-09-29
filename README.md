# 💰 ZenTrade Wallet — Offline-First

Digital wallet na gumagana **kahit walang internet**.
Ginawa para sa Pilipinas — palengke, tindahan, komunidad.

## 📱 Dalawang Bersyon

### 🌐 Web Version — makikita sa browser
Nasa folder: `web/`
- I-deploy sa Render
- Gumagamit ng localStorage — nasa browser ang datos
- Walang kailangang server

### 📲 Mobile Version — para sa telepono
Gumagamit ng Expo/React Native
- Gumagana kahit walang internet
- QR/NFC payment (darating pa)
- Lokal na pagpapatunay

## Paano Patakbuhin ang Web Version
```bash
cd web
npm install
npm run dev
