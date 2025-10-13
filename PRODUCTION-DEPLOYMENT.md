# 🚀 Production Deployment Guide for Replate

## ✅ What's Ready for Production

Your app is now configured for **real-world testing**:

1. ✅ **No Mapbox** - Simple list view for NGOs
2. ✅ **No Hugging Face** - Custom AI model only
3. ✅ **AI Scanning Optional** - Restaurants can donate without scanning
4. ✅ **Backend working locally** - Ready to deploy
5. ✅ **Supabase connected** - Database working

---

## 🔧 Step 1: Deploy Backend to Render

### Option A: Deploy via Render Dashboard (Recommended)

1. **Go to [render.com](https://render.com)** and sign in/sign up

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository:**
   - Select your repo: `jayithigavva/replate`
   - Render will scan for deployable services

4. **Configure the backend:**
   ```
   Name: replate-backend (or any name you prefer)
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   Plan: Free
   ```

5. **Add Environment Variables:**
   Click "Advanced" and add these:
   ```
   SUPABASE_URL=https://ystrzvkgqkqklgcflkbp.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHJ6dmtncWtxa2xnY2Zsa2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDgzNzYsImV4cCI6MjA3NTIyNDM3Nn0.MNINi3Vt5S6VBxe_JRxYVdUloWhxm5bCWF5FmcSTM38
   PORT=10000
   NODE_ENV=production
   ```

6. **Click "Create Web Service"**

7. **Wait 5-10 minutes** for deployment

8. **Your backend URL will be:**
   ```
   https://replate-backend-XXXX.onrender.com
   ```
   (Copy this URL!)

### Option B: Deploy via Blueprint (Automated)

Your `render.yaml` file is already configured. Just:

1. Go to [render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Select your repo
4. Render will deploy everything automatically

---

## 🔧 Step 2: Update Frontend to Use Production Backend

Once your backend is deployed:

1. **Open `src/config/api.js`**

2. **Find this line:**
   ```javascript
   const PRODUCTION_URL = 'https://your-app-name.onrender.com';
   ```

3. **Replace with your actual Render URL:**
   ```javascript
   const PRODUCTION_URL = 'https://replate-backend-XXXX.onrender.com';
   ```
   (Use the URL from Step 1!)

4. **Set production mode:**
   ```javascript
   const USE_PRODUCTION = true;
   ```

5. **Save the file**

---

## 📱 Step 3: Test on Your Device

### Start Expo:

```bash
npx expo start
```

### Test on your phone:
1. Open Expo Go app
2. Scan the QR code
3. App will now use **production backend**!

---

## 🧪 Step 4: Complete Testing Workflow

### Test as Restaurant:

1. **Sign up** as restaurant:
   ```
   Email: test-restaurant@gmail.com
   Password: Test123!
   Role: Restaurant
   ```

2. **Upload a food image** (or use sample images)

3. **Option A - With AI Scanning:**
   - Tap "Scan Food" 
   - Wait for AI analysis
   - If safe, tap "Create Food Donation"
   - Fill in details
   - Submit

4. **Option B - Without AI Scanning:**
   - Just tap "Create Food Donation" directly
   - Fill in details
   - Submit
   - (Shows "Not scanned" badge)

5. **Verify success message:**
   - Should say "NGOs notified"
   - Should say "Your location visible on map"

### Test as NGO:

1. **Sign out**, then **sign up** as NGO:
   ```
   Email: test-ngo@gmail.com
   Password: Test123!
   Role: NGO
   ```

2. **Dashboard should show:**
   - Count of available pickups
   - List of all pickups
   - Each pickup card with details

3. **Accept a pickup:**
   - Tap "Accept Pickup" on any card
   - Confirm
   - Should see success message

4. **Verify real-time:**
   - Switch back to restaurant account
   - Should have notification about NGO acceptance

---

## 🔍 Troubleshooting

### Backend not responding:

```bash
# Test your Render backend directly:
curl https://your-render-url.onrender.com/health

# Should return: {"status":"OK","timestamp":"..."}
```

### App can't connect:

1. Check `src/config/api.js`:
   - `USE_PRODUCTION = true` ✅
   - `PRODUCTION_URL` matches your Render URL ✅

2. Restart Expo:
   ```bash
   # In Expo terminal, press:
   c  # Clear cache
   r  # Reload
   ```

### AI not working:

The AI model runs on the **backend**, so:
1. Make sure backend is deployed
2. Check Render logs for AI model loading
3. AI needs ~2GB memory (Free tier should work)

### "Render backend sleeping":

Free tier backends sleep after 15 minutes of inactivity.
- First request will wake it up (takes ~30 seconds)
- Keep backend active by pinging `/health` every 10 minutes

---

## 🎯 What to Verify

Use this checklist:

- [ ] Backend deployed to Render
- [ ] Render URL copied to `src/config/api.js`
- [ ] `USE_PRODUCTION = true` set
- [ ] Can sign up as restaurant
- [ ] Can upload food images
- [ ] AI scanning works (gets predictions)
- [ ] Can donate WITHOUT scanning
- [ ] Can sign up as NGO  
- [ ] NGO sees pickups list
- [ ] NGO can accept pickups
- [ ] Real-time notifications work
- [ ] Chatbot works
- [ ] Profile screen loads

---

## 🚨 Important Notes

### AI Model Performance:
- Current accuracy: **66.7%** (moderate)
- Works but could be better
- Consider retraining with more diverse images
- For now, restaurants can donate without scanning

### Free Tier Limitations:
- Render backend sleeps after 15 min
- First request after sleep = 30-60 seconds
- Consider paid plan ($7/month) for always-on

### Data Privacy:
- All user data in Supabase
- Row Level Security enabled
- Restaurants can only see their pickups
- NGOs see all available pickups

---

## 📊 Current Status

```
✅ Frontend: Ready
✅ Backend: Running locally (needs Render deployment)
✅ Database: Connected (Supabase)
✅ AI Model: Working (66.7% accuracy)
✅ Authentication: Working
✅ Real-time: Ready
✅ No external dependencies (Mapbox/Hugging Face removed)
```

---

## 🎉 Next Steps

1. **Deploy backend to Render** (5 minutes)
2. **Update `src/config/api.js`** with Render URL (1 minute)
3. **Test complete workflow** (10 minutes)
4. **Give to real restaurants/NGOs** to test! 🚀

---

## 📞 Quick Commands

```bash
# Check backend health
curl http://localhost:3000/health

# Check production backend
curl https://your-render-url.onrender.com/health

# Start Expo with cache clear
npx expo start -c

# Test AI model
cd backend && node test-model.js

# View backend logs locally
cd backend && npm start
```

---

## 🔗 Resources

- **Render Dashboard**: https://dashboard.render.com
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repo**: https://github.com/jayithigavva/replate
- **Expo Dashboard**: https://expo.dev

---

**Your app is ready for production testing!** 🎉

Just deploy the backend to Render and update the config. Everything else is already working.


