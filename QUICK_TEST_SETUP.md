# Quick Setup for External Testers

## 🎯 Three Ways to Test HOOTNER

### 1️⃣ **Full Website (Easiest - Just Open in Browser)** ⭐

**🔒 SECURE HTTPS URL:**
```
https://daxqx65ar35pp.cloudfront.net
```

✅ Complete HOOTNER application  
✅ Secure HTTPS connection  
✅ No installation needed  
✅ Works on any device

---

### 2️⃣ **API Testing (For Developers)**

**Production API:**
```
https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/
```

**Test in browser or curl:**
```bash
curl https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/health
```

---

### 3️⃣ **Local Frontend + Production Backend**

```bash
# 1. Clone repo
git clone https://github.com/Hootner/hootner.git
cd hootner

# 2. Install
npm install

# 3. Create .env.test file
echo "VITE_API_URL=https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod" > .env.test
echo "NODE_ENV=test" >> .env.test

# 4. Start
npm run dev

# 5. Open browser
# http://localhost:3000
```

---

### 4️⃣ **Postman/Thunder Client**

**Import this:**

**Base URL:** `https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod`

**Requests to test:**
- `GET /health`
- `POST /graphql`
- `GET /api/videos`

---

## 📱 Mobile/Other Computers

**Same WiFi Network:**
1. Host computer IP: `192.168.42.10`
2. On test device browser: `http://192.168.42.10:3000`
3. Make sure Windows Firewall allows Node.js on port 3000

**Internet (Production):**
- Direct API: `https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/`

**Enable Firewall (Windows):**
```powershell
netsh advfirewall firewall add rule name="Node Dev Server" dir=in action=allow protocol=TCP localport=3000
```

---

## ❓ Need Help?

GitHub Issues: https://github.com/Hootner/hootner/issues

**That's it!** No AWS account needed. 🚀
