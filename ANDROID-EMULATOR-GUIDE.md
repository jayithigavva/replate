# 🤖 Android Emulator Testing Guide

## ✅ Current Setup Status

Your app is now running on the Android emulator with the following fixes:
- ✅ **URL polyfill** - Fixed React Native compatibility
- ✅ **Backend connection** - Configured for Android emulator (10.0.2.2:3000)
- ✅ **Emulator running** - Medium_Phone_API_36.1

---

## 🔄 How to Reload the App

The app should reload automatically. If not, use one of these methods:

### Method 1: From Expo Terminal
In the terminal where Expo is running, press **`r`** to reload the app

### Method 2: From Emulator Dev Menu
1. Press **`Cmd + M`** (Mac) or **`Ctrl + M`** (Windows/Linux)
2. Tap **"Reload"** in the menu

### Method 3: Using ADB
```bash
adb shell input text "RR"
```

---

## 📱 Using the Android Emulator

### Navigation Controls
- **Back**: Click the back triangle (◁) on the emulator
- **Home**: Click the circle (○) in the middle
- **Recent Apps**: Click the square (□) on the right

### Useful Shortcuts
- **`Cmd + M`** (Mac) / **`Ctrl + M`** (Windows) - Open dev menu
- **`Cmd + D`** (Mac) / **`Ctrl + D`** (Windows) - Open debug menu
- **Rotate**: Click rotate button on emulator toolbar
- **Take Screenshot**: Click camera icon

### Simulate Location (for Map Testing)
1. Click the **`...`** (More) button on emulator toolbar
2. Go to **Location** tab
3. Search for an address or enter coordinates
4. Click **"Set Location"**

### Simulate Camera (for Food Scanning)
1. The emulator uses a virtual camera
2. It shows an animated 3D cube by default
3. For real images: 
   - Click **`...`** → **Camera** → **Virtual Scene**
   - Or add real images to emulator gallery

---

## 🧪 Testing Your App on Emulator

### Step 1: Wait for App to Load
After reloading, you should see the **Login Screen** with:
- Orange Replate logo
- "Sign In" button
- "Sign Up" button
- Black and orange theme

### Step 2: Create Test Account
1. Tap **"Sign Up"**
2. Enter:
   - Email: `restaurant@test.com`
   - Password: `password123`
   - Select Role: **Restaurant**
3. Tap **"Create Account"**

### Step 3: Upload Food Image

#### Option A: Use Sample Images
1. First, add test images to emulator:
```bash
# From your project root, run:
adb push training-data/safe/fresh_apple.jpg /sdcard/Download/
adb push training-data/spoiled/rotten_apple.jpg /sdcard/Download/
```

2. In the app, tap **Camera icon**
3. Choose **"Pick from Gallery"**
4. Select the image from Downloads

#### Option B: Use Virtual Camera
1. Tap **Camera icon**
2. Choose **"Take Photo"**
3. Grant camera permissions
4. Take photo of the virtual scene

### Step 4: Test AI Scanning
1. After selecting image, tap **"Scan Food"**
2. Wait 5-10 seconds
3. You'll see AI results:
   - **Green** = SAFE for donation
   - **Red** = SPOILED, not safe
4. Check confidence score

### Step 5: Test Pickup Creation
1. If food is safe, tap **"Mark Ready for Pickup"**
2. Fill in details:
   - Quantity: "20 servings"
   - Expiry: "8 PM today"
   - Notes: "Fresh vegetables"
3. Tap **"Confirm"**

### Step 6: Test NGO View
1. Sign out (Profile → Sign Out)
2. Sign up as NGO:
   - Email: `ngo@test.com`
   - Password: `password123`
   - Role: **NGO**
3. View the map with pickup markers
4. Tap a marker to see details
5. Tap **"Accept Pickup"**

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
The backend is running on your Mac, and the emulator uses special IP:
```bash
# Check backend is running:
curl http://localhost:3000/health

# Test from emulator:
adb shell curl http://10.0.2.2:3000/health
```

### App Still Showing Errors
1. **Clear cache and rebuild**:
```bash
# In Expo terminal, press 'c' to clear cache
# Or restart with:
npx expo start --android --clear
```

2. **Check logs**:
```bash
# View Android logs:
adb logcat | grep -i "expo\|error"
```

### Emulator is Slow
1. **Close other apps** to free up memory
2. **Increase emulator RAM** in Android Studio:
   - Tools → AVD Manager → Edit emulator → Advanced Settings
   - Increase RAM to 2048 MB or more

### Camera Not Working
1. Grant permissions manually:
   - Settings → Apps → Expo Go → Permissions → Camera ✓
2. Or reinstall the app:
```bash
adb uninstall host.exp.exponent
```

### Keyboard Not Showing
- Click inside the text field
- Or press **`Cmd + K`** to show keyboard

---

## 📊 What You Should See

### Login Screen
```
┌─────────────────────────────┐
│                             │
│      [Replate Logo]         │
│                             │
│   Food Waste Reduction      │
│                             │
│  ┌─────────────────────┐   │
│  │      Sign In        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │      Sign Up        │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### Restaurant Dashboard
```
┌─────────────────────────────┐
│  Restaurant Dashboard  ⚙️    │
├─────────────────────────────┤
│                             │
│   📸 Upload Food Photo      │
│   ┌─────────────────────┐  │
│   │                     │  │
│   │   [Image Preview]   │  │
│   │                     │  │
│   └─────────────────────┘  │
│                             │
│   🤖 Scan Food              │
│                             │
│   📊 Recent Pickups         │
│   • Pickup #1 - Pending     │
│   • Pickup #2 - Completed   │
│                             │
├─────────────────────────────┤
│ [Home] [Notifications] [👤] │
└─────────────────────────────┘
```

### NGO Dashboard
```
┌─────────────────────────────┐
│    NGO Dashboard       ⚙️    │
├─────────────────────────────┤
│                             │
│   🗺️  [Interactive Map]     │
│   ┌─────────────────────┐  │
│   │  📍  📍           │  │
│   │      📍  📍       │  │
│   │  📍          📍   │  │
│   └─────────────────────┘  │
│                             │
│   📋 Available Pickups      │
│   ┌─────────────────────┐  │
│   │ Test Restaurant      │  │
│   │ 20 servings • 2.5 km │  │
│   │ [Accept Pickup]      │  │
│   └─────────────────────┘  │
│                             │
├─────────────────────────────┤
│ [Home] [Notifications] [👤] │
└─────────────────────────────┘
```

---

## 🎯 Key Features to Test

- [ ] **Authentication**: Sign up, login, logout
- [ ] **Image Upload**: Pick from gallery (after adding test images)
- [ ] **AI Scanning**: Upload fresh/spoiled food images
- [ ] **Pickup Creation**: Create and manage pickups
- [ ] **Map View**: See pickup locations (NGO side)
- [ ] **Real-time Updates**: Test with two accounts
- [ ] **Notifications**: Check notification screen
- [ ] **Profile**: Edit user details

---

## 💡 Pro Tips

1. **Use Portrait Mode**: The app is designed for mobile portrait
2. **Test Both Roles**: Restaurant AND NGO perspectives
3. **Add Test Images**: Push sample images to emulator for realistic testing
4. **Check Console**: Look at Expo terminal for errors/logs
5. **Use Dev Menu**: Cmd+M to access debug tools

---

## 📞 Quick Commands

```bash
# Reload app
Press 'r' in Expo terminal

# Clear cache and restart
npx expo start --android --clear

# Add test images to emulator
adb push training-data/safe/fresh_apple.jpg /sdcard/Download/
adb push training-data/spoiled/rotten_apple.jpg /sdcard/Download/

# Check backend health
curl http://localhost:3000/health

# View emulator logs
adb logcat | grep -i expo

# Restart emulator
adb reboot

# Take screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

## ✨ Next Steps

1. **Wait for reload** - The app should be loading now
2. **Create an account** - Test Restaurant or NGO signup
3. **Upload images** - Add test images to emulator
4. **Test all features** - Follow the testing checklist
5. **Report issues** - Note any bugs or problems

Your app should now be working perfectly on the Android emulator! 🎉



