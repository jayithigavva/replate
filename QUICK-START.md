# 🚀 Replate App - Quick Start

## ✅ Current Status

Your app is **RUNNING** and ready to test!

### Running Services:
- ✅ **Backend API**: http://localhost:3000 (Running)
- ✅ **Expo Dev Server**: Running and ready
- ✅ **Supabase Database**: Connected
- ✅ **AI Model**: Loaded and ready

---

## 📱 VIEW YOUR APP NOW

### Step 1: Look at Your Terminal
You should see the **Expo QR code** in your terminal window where you ran the app.

### Step 2: Install Expo Go (If you haven't already)
- **iOS**: Download "Expo Go" from the App Store
- **Android**: Download "Expo Go" from Google Play Store

### Step 3: Scan the QR Code
- Open the Expo Go app on your phone
- Tap "Scan QR Code"
- Point your camera at the QR code in the terminal
- Wait for the app to load (10-30 seconds first time)

### Alternative: Use Simulator/Emulator
In the terminal where Expo is running, press:
- `i` - Open iOS Simulator (Mac only)
- `a` - Open Android Emulator (requires Android Studio)
- `w` - Open in web browser (limited features)

---

## 🎯 First Steps - Quick Test Flow

### 1️⃣ Create Restaurant Account (2 minutes)
1. Open the app on your phone
2. Tap **"Sign Up"**
3. Enter:
   - Email: `myrestaurant@test.com`
   - Password: `password123`
   - Role: **Restaurant**
4. Tap "Create Account"
5. ✅ You're in! You'll see the Restaurant Dashboard

### 2️⃣ Upload and Scan Food (3 minutes)
1. Tap the **camera icon** or "Upload Food" button
2. Choose **"Choose from Gallery"**
3. Select a food photo from your phone
4. Tap **"Scan Food"** button
5. Wait 5-10 seconds
6. ✅ AI will tell you if the food is SAFE or SPOILED

### 3️⃣ Create a Pickup (1 minute)
1. If food is safe, tap **"Mark Ready for Pickup"**
2. Enter details:
   - Quantity: e.g., "20 servings"
   - Expiry: e.g., "8 PM today"
   - Notes: "Cooked rice and vegetables"
3. Tap **"Confirm"**
4. ✅ Pickup created! NGOs will see it

### 4️⃣ Test NGO View (3 minutes)
1. **Sign out** (Profile → Sign Out)
2. **Sign up** as NGO:
   - Email: `myngo@test.com`
   - Password: `password123`
   - Role: **NGO**
3. ✅ You'll see a **map** with pickup locations
4. Tap a marker to see details
5. Tap **"Accept Pickup"**

---

## 🎨 What You'll See

### Restaurant Dashboard (Orange & Black Theme)
- 📸 **Camera button** - Upload food photos
- 🤖 **AI Scanner** - Detects fresh/spoiled food
- 💬 **Chatbot** - Ask food safety questions
- 📊 **Pickup History** - See your donations
- 🔔 **Notifications** - NGO pickup updates

### NGO Dashboard
- 🗺️ **Interactive Map** - All pickup locations
- 📍 **Markers** - Each restaurant with available food
- 📋 **Pickup List** - Details, distance, quantity
- 🚗 **Route Optimizer** - Best collection order
- ✅ **Mark Collected** - Update pickup status

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path (Everything Works)
1. **Restaurant**: Upload fresh apple photo
2. **AI**: Detects "SAFE - Fresh Apple" (95% confidence)
3. **Restaurant**: Marks ready for pickup
4. **NGO**: Sees it on map immediately
5. **NGO**: Accepts and collects
6. **Restaurant**: Gets notification of collection
✅ **Success!**

### Scenario 2: Spoiled Food Detection
1. **Restaurant**: Upload moldy bread photo
2. **AI**: Detects "SPOILED - Not safe for donation"
3. **Restaurant**: Cannot mark for pickup (blocked)
✅ **AI prevented bad donation!**

### Scenario 3: Real-time Updates
1. **Open app on TWO phones**
   - Phone 1: Restaurant account
   - Phone 2: NGO account
2. **Phone 1**: Create pickup
3. **Phone 2**: Watch it appear on map (2-3 seconds)
4. **Phone 2**: Accept pickup
5. **Phone 1**: See status change to "Accepted"
✅ **Real-time working!**

---

## 📁 Sample Images for Testing

### Use These Images from Training Data:
```
Fresh/Safe Food:
- training-data/safe/fresh_apple.jpg
- training-data/safe/fresh_bread.jpg
- training-data/safe/fresh_vegetables.jpg

Spoiled/Unsafe Food:
- training-data/spoiled/moldy_bread.jpg
- training-data/spoiled/rotten_apple.jpg
- training-data/spoiled/spoiled_milk.jpg
```

Or use photos from the `dataset/` folder!

---

## 🎯 Key Features to Test

- [ ] **User Authentication** - Sign up, login, logout
- [ ] **Camera/Image Upload** - Take/choose photos
- [ ] **AI Food Detection** - Scan fresh vs. spoiled
- [ ] **Pickup Creation** - Restaurant marks ready
- [ ] **Map Display** - NGO sees locations
- [ ] **Real-time Updates** - Instant notifications
- [ ] **Chatbot** - Ask food safety questions
- [ ] **Profile Management** - Edit details
- [ ] **Pickup History** - View past donations

---

## 🔧 Troubleshooting

### "QR Code Not Scanning"
```bash
# In the Expo terminal, press 's' to switch to tunnel mode
# Then scan the new QR code
```

### "Cannot Connect to Server"
```bash
# Check backend is running:
curl http://localhost:3000/health

# Should see: {"status":"OK"}
```

### "App is Slow"
```bash
# Clear Expo cache and restart:
npx expo start -c
```

### "Camera Not Working"
- Go to phone Settings → Expo Go → Permissions
- Enable Camera and Photos

---

## 📖 Full Documentation

For comprehensive testing guide, see:
- **TESTING-GUIDE.md** - Complete test cases and scenarios
- **README.md** - Project overview
- **AI-SETUP-GUIDE.md** - AI model details
- **FRONTEND-README.md** - Frontend architecture

---

## 💡 Quick Tips

1. **Keep both servers running** - Don't close the terminal windows
2. **Use real device** - More accurate than simulator
3. **Same WiFi network** - Phone and computer must be on same network
4. **Test both roles** - Restaurant AND NGO experience
5. **Try edge cases** - What happens with weird inputs?

---

## 🎉 You're Ready!

Your app is running and ready to test. Here's what to do now:

1. ✅ **Scan the QR code** with Expo Go
2. ✅ **Create an account** (Restaurant or NGO)
3. ✅ **Upload a food image** and scan it
4. ✅ **Explore all features** in the dashboard
5. ✅ **Test real-time** with two devices if possible

**Have fun testing! The app is fully functional and ready to explore.** 🚀

---

## 📞 Quick Commands

```bash
# View this guide
cat QUICK-START.md

# See detailed testing guide
cat TESTING-GUIDE.md

# Check backend health
curl http://localhost:3000/health

# Restart everything
# Terminal 1:
cd backend && npm start

# Terminal 2:
npx expo start
```



