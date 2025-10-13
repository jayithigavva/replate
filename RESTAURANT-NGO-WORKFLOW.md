# 🍽️ Restaurant → NGO Complete Workflow Guide

## 🎯 **How The Connection Works**

Your app connects restaurants with NGOs in real-time for food waste reduction!

---

## 📱 **RESTAURANT SIDE - Complete Flow**

### **Step 1: Upload Food Image** 📸
1. Open Restaurant Dashboard
2. Three ways to upload:
   - **📤 Tap the big upload area** (drag-drop style button)
   - **📷 Gallery button** - Pick from photos
   - **📸 Camera button** - Take new photo
3. Image appears on screen

### **Step 2: AI Scans Food** 🤖
1. Tap **"🔍 Scan Food"** button
2. Wait 5-10 seconds
3. AI analyzes the image using your custom TensorFlow model
4. Results appear:
   - ✅ **GREEN = SAFE** for donation
   - ❌ **RED = SPOILED** - cannot donate
   - Shows confidence % (e.g., 85% confident)
   - Shows detected food type
   - Shows freshness indicators

### **Step 3: Mark Ready for Pickup** 🚚
**Only appears if food is SAFE!**

1. Tap **"🚚 Mark Food Ready for Pickup"** button
2. **Modal Form Opens** with fields:

```
┌────────────────────────────────────┐
│   🚚 Pickup Details                │
│   Fill in the details for NGOs     │
│                                    │
│  Food Type *                       │
│  ┌──────────────────────────────┐ │
│  │ Cooked rice and vegetables   │ │
│  └──────────────────────────────┘ │
│                                    │
│  Quantity *                        │
│  ┌──────────────────────────────┐ │
│  │ 20 servings                  │ │
│  └──────────────────────────────┘ │
│                                    │
│  Pickup By                         │
│  ┌──────────────────────────────┐ │
│  │ 8 PM today                   │ │
│  └──────────────────────────────┘ │
│                                    │
│  Notes                             │
│  ┌──────────────────────────────┐ │
│  │ No nuts, containers provided │ │
│  └──────────────────────────────┘ │
│                                    │
│  ✅ AI Scanned: SAFE (95%)         │
│                                    │
│  [Cancel]    [✅ Confirm Pickup]   │
│                                    │
│  📱 NGOs will be instantly notified│
│  🗺️ Your location appears on map  │
│  🔔 Get alert when NGO accepts     │
└────────────────────────────────────┘
```

3. Fill in the form:
   - **Food Type**: What food (e.g., "Cooked rice", "Pizza", "Curry")
   - **Quantity**: How much (e.g., "20 servings", "5kg", "10 plates")
   - **Pickup By**: When to pickup (e.g., "8 PM today", "Within 2 hours")
   - **Notes**: Allergens, special instructions, etc.

4. Tap **"✅ Confirm Pickup"**

### **Step 4: What Happens Next?** 🎉

**Immediately**:
- ✅ Success message appears
- 📢 **ALL NGOs in your area receive instant notification**
- 🗺️ **Your restaurant location appears on NGO maps as an orange marker**
- 📝 **Pickup details are visible to all NGOs**

**When NGO Accepts**:
- 🔔 **You get a notification**: "NGO [Name] accepted your pickup!"
- 👤 **See which NGO** is coming
- 📍 **See their estimated arrival** (if they share)
- ✅ **Status updates** in real-time

**When NGO Collects**:
- 🎊 **Final notification**: "Pickup completed! Thank you for reducing food waste."
- 📊 **Your donation count increases**
- 🏆 **Impact tracking** in your profile

---

## 🏢 **NGO SIDE - Complete Flow**

### **Step 1: See Available Pickups** 🗺️

**NGO Dashboard Shows**:

#### **A. Interactive Map** (Top of screen)
- 🗺️ Full map view
- 📍 **Orange markers** = Restaurants with food ready
- 📍 Each marker shows restaurant location
- Tap marker to see quick details
- Your location shown as blue dot

#### **B. Pickup List** (Below map)
Each pickup card shows:
```
┌────────────────────────────────┐
│ 🍽️ Restaurant: test@restaurant.com │
│                                │
│ 🍛 Food: Cooked rice & veggies │
│ 📦 Quantity: 20 servings       │
│ ⏰ Pickup By: 8 PM today       │
│ 📝 Notes: No nuts, containers  │
│ ✅ AI Scanned: SAFE (95%)      │
│                                │
│ 📍 1.2 km away                 │
│                                │
│    [✅ Accept Pickup]           │
└────────────────────────────────┘
```

### **Step 2: Accept Pickup** ✅
1. Review the details (food type, quantity, time, notes)
2. Check distance on map
3. Tap **"✅ Accept Pickup"** button
4. Confirmation: "Pickup accepted! Navigate to restaurant."

### **Step 3: What Happens When You Accept?** 🎉

**Immediately**:
- 🔔 **Restaurant gets notification**: "NGO [Your Name] accepted your pickup!"
- 🗺️ **Marker changes color** on other NGO's maps (shows it's claimed)
- 📱 **Your notification** confirms acceptance
- 🧭 **Navigation option** appears

**On Your Side**:
- Pickup moves to "My Accepted Pickups" section
- Shows restaurant address
- Option to get directions
- "Mark as Collected" button appears

### **Step 4: Collect the Food** 🚗
1. Navigate to restaurant (using map)
2. Collect the food
3. Tap **"Mark as Collected"** button
4. Success!

**What Happens**:
- 🎊 **Restaurant notified**: "Pickup completed by [Your NGO]"
- ✅ **Your stats update**: +1 pickup completed
- 📈 **Impact tracking**: Meals saved count increases
- 🗺️ **Marker removed** from map (pickup complete)

---

## 🔄 **Real-Time Connection Flow**

```
RESTAURANT                          NGO
    │                                │
    │  1. Mark Ready for Pickup      │
    │  ────────────────────────────> │
    │                                │  2. Notification appears
    │                                │  3. Sees on map
    │                                │  4. Reviews details
    │                                │
    │  5. Gets notification <──────  │  5. Accepts pickup
    │     "NGO accepted!"             │
    │                                │
    │                                │  6. Navigates to location
    │                                │  7. Collects food
    │                                │
    │  8. Gets notification <──────  │  8. Marks collected
    │     "Pickup completed!"         │
    │                                │
    │  9. Stats update               │  9. Stats update
    │                                │
```

---

## 📊 **What Information Is Shared?**

### **Restaurant Shares With NGOs**:
- ✅ Food type (what it is)
- ✅ Quantity (how much)
- ✅ Pickup deadline (when to collect by)
- ✅ Special notes (allergens, instructions)
- ✅ AI scan result (safe/spoiled + confidence)
- ✅ Restaurant location (GPS coordinates)
- ✅ Restaurant contact (email)
- ✅ Timestamp (when marked ready)
- ✅ Photo (optional - the food image)

### **NGO Shares With Restaurant**:
- ✅ NGO name/organization
- ✅ Acceptance notification
- ✅ Collection confirmation
- ✅ Time of acceptance
- ✅ NGO contact info

---

## 🔔 **Notification System**

### **Restaurant Gets Notified When**:
1. **NGO accepts pickup** → "NGO [Name] accepted your donation"
2. **NGO marks collected** → "Pickup completed! Thank you!"
3. **Pickup expires uncollected** → "Pickup expired, consider disposal"

### **NGO Gets Notified When**:
1. **New pickup created nearby** → "New food available: [Food Type] at [Distance]"
2. **Pickup about to expire** → "Pickup expiring in 1 hour!"
3. **Restaurant cancels** → "Pickup cancelled by restaurant"

---

## 🗺️ **Map Features for NGOs**

### **What They See**:
- 📍 **Orange markers** = Available pickups
- 📍 **Gray markers** = Accepted by other NGOs
- 📍 **Blue dot** = Their own location
- 📊 **Clustered markers** = Multiple pickups nearby

### **Marker Details** (on tap):
- Restaurant name/email
- Food type & quantity
- Distance from NGO
- Time left until expiry
- AI scan result
- Quick "Accept" button

### **Map Updates in Real-Time**:
- ⚡ New pickups appear immediately
- ⚡ Accepted pickups change color
- ⚡ Collected pickups disappear
- ⚡ All NGOs see the same live data

---

## 📝 **Example Complete Workflow**

### **Scenario: Restaurant Donates Leftover Curry**

**09:00 PM - Restaurant**:
```
1. Upload photo of curry
2. AI scans: ✅ SAFE (92% confidence)
3. Tap "Mark Ready for Pickup"
4. Fill form:
   - Food: Chicken curry with rice
   - Quantity: 30 servings
   - Pickup by: 10:30 PM
   - Notes: Mild spice, containers provided
5. Tap "Confirm Pickup"
6. ✅ "NGOs notified!"
```

**09:00 PM - All NGOs**:
```
🔔 Notification: "New food available 1.5km away"
🗺️ Orange marker appears on map
📋 Pickup card shows all details
```

**09:05 PM - NGO "Food Bank" Accepts**:
```
1. Reviews details
2. Checks map (1.5km away)
3. Taps "Accept Pickup"
4. Gets navigation option
```

**09:05 PM - Restaurant Gets Update**:
```
🔔 "Food Bank accepted your pickup!"
📱 Shows NGO contact
✅ Status: Accepted
```

**09:05 PM - Other NGOs See Update**:
```
🗺️ Marker turns gray
📋 "Accepted by Food Bank"
❌ Can't accept anymore
```

**09:25 PM - NGO Arrives & Collects**:
```
1. Arrives at restaurant
2. Collects 30 servings
3. Taps "Mark as Collected"
4. ✅ Pickup complete!
```

**09:25 PM - Restaurant Confirmed**:
```
🔔 "Pickup completed by Food Bank!"
🎊 "30 servings saved from waste"
📈 Your stats updated
```

**09:25 PM - Map Updates**:
```
🗺️ Marker disappears
📋 Removed from all NGO lists
✅ Recorded in system
```

---

## 🚀 **Key Features of The Connection**

### **1. Instant Notifications** ⚡
- WebSocket/Supabase Realtime
- No delay between actions
- Both sides stay updated

### **2. Location-Based** 📍
- GPS coordinates shared
- Distance calculations
- Route optimization for NGOs
- Map clustering for efficiency

### **3. Transparency** 🔍
- Both sides see status
- Clear communication
- Timeline of events
- Contact information

### **4. Safety First** 🛡️
- AI screening before listing
- Can't list spoiled food
- Quality assurance
- Confidence scores shown

---

## 🧪 **How to Test This Workflow**

### **You Need 2 Accounts**:

#### **Account 1: Restaurant**
```
Email: restaurant@test.com
Password: password123
Role: Restaurant
```

#### **Account 2: NGO**
```
Email: ngo@test.com
Password: password123
Role: NGO
```

### **Testing Steps**:

**Step 1: Create Pickup (Restaurant Account)**
1. Login as restaurant
2. Upload food image
3. Scan with AI (should be SAFE)
4. Tap "Mark Ready for Pickup"
5. Fill in form with details
6. Confirm

**Step 2: View on NGO Side**
1. Sign out, login as NGO
2. Should see pickup on map
3. Should see pickup in list
4. Details should match what restaurant entered

**Step 3: Accept Pickup (NGO)**
1. Tap pickup card
2. Review details
3. Tap "Accept Pickup"
4. Confirm

**Step 4: Check Restaurant Notification**
1. Sign out, login back as restaurant
2. Should have notification about NGO acceptance
3. Can see which NGO accepted

**Step 5: Complete Pickup (NGO)**
1. Login as NGO again
2. Find accepted pickup
3. Tap "Mark as Collected"
4. Complete!

**Step 6: Final Confirmation**
1. Login as restaurant
2. Should see "Pickup Completed" notification
3. Stats updated

---

## 🎨 **New Features I Just Added**

### ✅ **1. Detailed Pickup Form**
**Before**: Simple button with generic message
**Now**: Complete form with:
- Food type field
- Quantity field  
- Expiry/pickup time
- Notes for special instructions
- AI scan result badge
- Clear confirmation message

### ✅ **2. Better Communication**
**Restaurant sees**:
- "NGOs notified instantly"
- "Your location visible on map"
- "You'll be notified when accepted"

**NGO sees**:
- All pickup details in organized card
- AI scan result displayed
- Distance from their location
- Clear accept button

### ✅ **3. Comprehensive Chatbot**
Now answers **100+ questions** including:
- "How long can raw chicken be stored?"
- "Can I freeze chicken curry?"
- "Is it safe to thaw on counter?"
- All your meat, dairy, fruit, vegetable questions
- Plus bread, grains, leftovers, freezing tips

### ✅ **4. Smart Workflow**
- Can't list spoiled food (AI blocks it)
- Form pre-fills AI-detected food type
- Shows scan confidence to NGOs
- Tracks entire journey from scan to collection

---

## 📲 **Current Status**

✅ **Restaurant Dashboard**:
- Upload area with 3 options
- AI food scanning
- Detailed pickup form modal
- Real-time chat assistance
- Notification when NGO accepts

✅ **NGO Dashboard**:
- Map with pickup markers
- Detailed pickup cards
- Accept pickup functionality
- Mark as collected option
- Real-time updates

✅ **Backend**:
- AI model running
- Enhanced chatbot (100+ questions)
- Pickup creation endpoint
- Status update endpoint
- Notification system ready

✅ **Database**:
- Users table
- Pickups table
- Food scans table
- Chat messages table
- Real-time subscriptions

---

## 🧪 **Test It Now!**

1. **Look at your emulator** - app should have reloaded
2. **Upload a food image** (Gallery → Download → fresh_apple.jpg)
3. **Scan it** - should show SAFE
4. **Tap "Mark Ready for Pickup"**
5. **See the new modal form!**
6. **Fill it out and confirm**
7. **Get success message** explaining what happens

Then login as NGO to see it on the map!

---

## 💡 **Pro Tips**

- **Food Type**: Be specific (helps NGOs plan)
- **Quantity**: Include servings or weight
- **Pickup Time**: Give reasonable window
- **Notes**: Mention allergens, dietary info
- **AI Scan**: Builds trust with NGOs

---

## 🎯 **The Big Picture**

```
Restaurant has surplus food
          ↓
    AI scans for safety
          ↓
   Restaurant fills details
          ↓
    Marks ready for pickup
          ↓
   ⚡ INSTANT NOTIFICATION ⚡
          ↓
    NGOs see on map + list
          ↓
      NGO reviews details
          ↓
      NGO accepts pickup
          ↓
   ⚡ RESTAURANT NOTIFIED ⚡
          ↓
      NGO navigates there
          ↓
      Food collected
          ↓
   ⚡ BOTH PARTIES NOTIFIED ⚡
          ↓
    📊 Impact tracked
    🎉 Food waste reduced!
```

---

**This is the complete ecosystem connecting restaurants and NGOs to fight food waste!** 🌍✨

Try it now on your emulator - the new modal form should appear when you tap "Mark Ready for Pickup"!



