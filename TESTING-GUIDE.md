# 🧪 Replate App - Complete Testing Guide

## 🚀 Quick Start

### Current Status
✅ **Backend Server**: Running on http://localhost:3000  
✅ **Frontend**: Expo Dev Server running  
✅ **Supabase**: Connected and configured  

---

## 📱 How to View the App

### Option 1: Mobile Device (Recommended)
1. **Install Expo Go** on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play Store

2. **Scan the QR Code**:
   - Look at your terminal where Expo is running
   - You'll see a QR code displayed
   - Open Expo Go app and scan the QR code
   - The app will load on your phone

### Option 2: iOS Simulator (Mac only)
- Press `i` in the Expo terminal to open iOS Simulator
- Wait for simulator to launch and app to load

### Option 3: Android Emulator
- Press `a` in the Expo terminal to open Android Emulator
- Requires Android Studio to be installed

### Option 4: Web Browser
- Press `w` in the Expo terminal to open in web browser
- Note: Some features may not work properly on web

---

## 🎯 What is Replate?

**Replate** is a food waste reduction platform that connects:
- 🍽️ **Restaurants** with surplus food
- 🏢 **NGOs** who can distribute food to those in need

### Key Features:
1. **AI Food Safety Scanner** - Uses computer vision to detect if food is safe or spoiled
2. **Real-time Pickup System** - Restaurants mark food ready, NGOs get notified instantly
3. **Map Integration** - NGOs see all pickup locations on a map
4. **Route Optimization** - Grouped pickups for efficient collection
5. **Food Safety Chatbot** - AI assistant for food safety questions

---

## 🧪 Complete Testing Workflow

### Part 1: Restaurant Flow (Food Donation Side)

#### Test Case 1: Restaurant Sign Up
1. **Launch the app**
2. **Tap "Sign Up"**
3. **Enter details**:
   - Email: `restaurant1@test.com`
   - Password: `password123`
   - Role: Select **Restaurant**
   - Name: `Test Restaurant`
   - Location: Allow location access or enter manually
4. **Tap "Create Account"**
5. ✅ **Expected**: Account created, logged in to Restaurant Dashboard

#### Test Case 2: Upload Food Image
1. **On Restaurant Dashboard**, tap the camera icon or upload button
2. **Choose option**:
   - "Take Photo" (camera)
   - "Choose from Gallery" (existing photo)
3. **Select/Take a food photo**
4. ✅ **Expected**: Image displays in the app

#### Test Case 3: AI Food Safety Scan
1. **After uploading image**, tap "Scan Food"
2. **Wait for AI analysis** (may take 5-10 seconds)
3. ✅ **Expected Results**:
   - **If Fresh**: Green checkmark, "Food is SAFE for donation"
   - **If Spoiled**: Red warning, "Food appears SPOILED - not safe"
   - Shows confidence score (e.g., "95% confident")
   - Shows detected food type

#### Test Case 4: Mark Ready for Pickup
1. **If food is safe**, you'll see "Mark Ready for Pickup" button
2. **Tap the button**
3. **Confirm pickup details**:
   - Verify your location
   - Add quantity (e.g., "20 servings")
   - Add expiry time (e.g., "Pickup by 8 PM today")
   - Add notes (optional)
4. **Tap "Confirm Pickup"**
5. ✅ **Expected**: Success message, NGOs get notified

#### Test Case 5: Food Safety Chatbot
1. **Tap the chat icon** on Restaurant Dashboard
2. **Ask questions** like:
   - "How long can I store cooked rice?"
   - "Is it safe to donate leftover pizza?"
   - "What temperature should I keep food at?"
3. ✅ **Expected**: AI responds with food safety advice

#### Test Case 6: View Pickup History
1. **Scroll down** on Restaurant Dashboard
2. **See "Recent Pickups"** section
3. ✅ **Expected**: List of your past donations with status:
   - 🟡 Pending: Waiting for NGO
   - 🟢 Completed: NGO collected
   - 🔴 Cancelled: Not collected

---

### Part 2: NGO Flow (Food Collection Side)

#### Test Case 7: NGO Sign Up
1. **Sign out** from Restaurant account (Profile → Sign Out)
2. **Tap "Sign Up"**
3. **Enter details**:
   - Email: `ngo1@test.com`
   - Password: `password123`
   - Role: Select **NGO**
   - Organization: `Test Food Bank`
   - Location: Allow location access
4. **Tap "Create Account"**
5. ✅ **Expected**: Account created, logged in to NGO Dashboard

#### Test Case 8: View Map with Pickups
1. **On NGO Dashboard**, you'll see a map
2. **Map should show**:
   - 📍 Orange markers for available pickups
   - 📍 Your current location (blue dot)
   - Clustered markers if multiple pickups nearby
3. **Tap a marker** to see pickup details:
   - Restaurant name
   - Food quantity
   - Distance from you
   - Expiry time
4. ✅ **Expected**: Interactive map with all pickups

#### Test Case 9: View Pickup List
1. **Below the map**, see "Available Pickups" list
2. **Each item shows**:
   - Restaurant name
   - Food details
   - Distance and direction
   - "Accept Pickup" button
3. **Tap on a pickup** to see full details
4. ✅ **Expected**: Detailed view with food photo, quantity, notes

#### Test Case 10: Accept and Collect Food
1. **Select a pickup** from the list
2. **Tap "Accept Pickup"**
3. **Navigate to restaurant**:
   - Use map for directions
   - See estimated distance/time
4. **At restaurant, tap "Mark as Collected"**
5. **Confirm collection**
6. ✅ **Expected**: 
   - Pickup marked complete
   - Restaurant gets notification
   - Pickup removed from available list

#### Test Case 11: Route Optimization
1. **If multiple pickups** are nearby
2. **Tap "Optimize Route"** button
3. ✅ **Expected**: 
   - Pickups sorted by proximity
   - Suggested collection order
   - Total distance/time shown

---

### Part 3: Real-time Features Testing

#### Test Case 12: Real-time Notifications
1. **Open TWO devices/browsers**:
   - Device 1: Restaurant account
   - Device 2: NGO account
2. **On Device 1 (Restaurant)**:
   - Upload food image
   - Mark ready for pickup
3. **On Device 2 (NGO)**:
   - Wait 2-3 seconds
   - ✅ **Expected**: New pickup appears automatically on map
4. **On Device 2 (NGO)**:
   - Accept and mark as collected
5. **On Device 1 (Restaurant)**:
   - ✅ **Expected**: Status updates to "Collected"

---

## 🎨 UI/UX Elements to Check

### Color Scheme
- ✅ Primary: Orange (#FF6600) - used for buttons, headers
- ✅ Secondary: Black (#000000) - used for text
- ✅ Accents: White background with orange highlights

### Components to Verify
- ✅ **Buttons**: Orange with white text, rounded corners
- ✅ **Cards**: White background, subtle shadows
- ✅ **Icons**: Consistent sizing and spacing
- ✅ **Loading States**: Spinners appear during API calls
- ✅ **Error Messages**: Red text for errors, orange for warnings

### User Experience
- ✅ **Navigation**: Bottom tabs (Restaurant/NGO)
- ✅ **Forms**: Clear labels, validation messages
- ✅ **Images**: Proper aspect ratios, loading states
- ✅ **Maps**: Smooth panning and zooming
- ✅ **Feedback**: Success messages after actions

---

## 🔍 AI Model Testing

### Testing the Food Spoilage Detection

#### Fresh Food Images to Test:
1. **Fresh Apple**: Should detect as SAFE
2. **Fresh Vegetables**: Should detect as SAFE
3. **Fresh Cooked Food**: Should detect as SAFE

#### Spoiled Food Images to Test:
1. **Moldy Bread**: Should detect as SPOILED
2. **Rotten Fruit**: Should detect as SPOILED
3. **Discolored Food**: Should detect as SPOILED

### How to Test AI Accuracy:
1. **Use training data** from `/training-data/` folder
2. **Take photos** of real fresh/spoiled food
3. **Check confidence scores**: Should be >70% for reliable results
4. **Test edge cases**: 
   - Partially spoiled food
   - Food in different lighting
   - Close-up vs. far shots

---

## 🐛 Common Issues and Fixes

### Issue 1: "Cannot connect to backend"
**Solution**:
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not, restart backend
cd backend
npm start
```

### Issue 2: "Expo QR code not scanning"
**Solution**:
- Ensure phone and computer are on same WiFi
- Try tunnel mode: Press `s` in Expo terminal, then select "tunnel"

### Issue 3: "Camera not working"
**Solution**:
- Grant camera permissions in phone settings
- On iOS: Settings → Expo Go → Camera → Enable
- On Android: Settings → Apps → Expo Go → Permissions → Camera

### Issue 4: "Map not showing"
**Solution**:
- Check location permissions
- Ensure internet connection
- May need Mapbox API key for production

### Issue 5: "Images not uploading"
**Solution**:
- Check file size (should be <10MB)
- Ensure Supabase storage bucket exists
- Check internet connection

---

## 📊 What to Look For During Testing

### Functionality Checklist
- [ ] User registration works
- [ ] User login/logout works
- [ ] Camera/image picker works
- [ ] AI food scanning returns results
- [ ] Pickup creation works
- [ ] Map displays correctly
- [ ] Real-time updates work
- [ ] Chatbot responds
- [ ] Notifications appear
- [ ] Data persists after app reload

### Performance Checklist
- [ ] App loads in <3 seconds
- [ ] AI scan completes in <10 seconds
- [ ] Map loads smoothly
- [ ] No lag when scrolling
- [ ] Images load quickly
- [ ] Transitions are smooth

### UI/UX Checklist
- [ ] Text is readable
- [ ] Buttons are easy to tap
- [ ] Forms are clear
- [ ] Error messages are helpful
- [ ] Loading states are visible
- [ ] Colors are consistent
- [ ] Layout works on different screen sizes

---

## 📝 Test Accounts

Use these test accounts for quick testing:

### Restaurant Accounts
- Email: `restaurant1@test.com` | Password: `password123`
- Email: `restaurant2@test.com` | Password: `password123`

### NGO Accounts
- Email: `ngo1@test.com` | Password: `password123`
- Email: `ngo2@test.com` | Password: `password123`

---

## 🚀 Next Steps After Testing

1. **Report Issues**: Note any bugs or issues you find
2. **Suggest Improvements**: What features would enhance the app?
3. **Performance**: Any slow or laggy parts?
4. **UI Feedback**: Does the design feel intuitive?
5. **AI Accuracy**: How accurate is the food detection?

---

## 📞 Quick Commands Reference

```bash
# Start backend
cd backend && npm start

# Start frontend
npm start

# Reset Expo cache (if issues)
npx expo start -c

# View backend logs
cd backend && npm run dev

# Build for Android
npx eas build --platform android

# Build for iOS
npx eas build --platform ios
```

---

## 🎯 Key Metrics to Track

During testing, observe:
- **Response Times**: How fast does the AI respond?
- **User Flow**: How many taps to complete a task?
- **Error Rate**: How often do things fail?
- **User Confusion**: What parts are unclear?
- **Visual Appeal**: Does it look professional?

---

## 💡 Tips for Best Testing Experience

1. **Test on Real Device**: Mobile testing is most accurate
2. **Use Real Photos**: More realistic than sample images
3. **Test Edge Cases**: What happens with bad inputs?
4. **Check Both Roles**: Restaurant AND NGO perspectives
5. **Test Real-time**: Use two devices simultaneously
6. **Document Issues**: Take screenshots of bugs
7. **Test Different Networks**: WiFi vs. Mobile data

---

## ✨ Happy Testing!

The app is now running and ready for you to explore. Start with the Restaurant flow, then try the NGO flow, and see how they work together in real-time!

**Questions or issues?** Check the logs in your terminal or refer to the troubleshooting section above.

