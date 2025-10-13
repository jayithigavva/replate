# 🔑 Create Test User in Supabase

## Quick Method: Create User Directly in Supabase

### Step 1: Go to Supabase Authentication

1. Visit: https://supabase.com/dashboard/project/ystrzvkgqkqklgcflkbp
2. Click **"Authentication"** in the left sidebar
3. Click **"Users"** tab
4. Click **"Add user"** button (or "+ Add user")

### Step 2: Create User

Fill in the form:
- **Email**: `test@restaurant.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ Check this box (important!)

Click **"Create user"**

### Step 3: Add User to Users Table

Now you need to add the role to the `users` table:

1. Go to **"Table Editor"** → **"users"** table
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **id**: Copy the UUID from the user you just created in Authentication
   - **role**: `restaurant` (or `ngo`)
   - **email**: `test@restaurant.com`
4. Click **"Save"**

### Step 4: Login in the App

Now in your Android emulator:
1. Enter email: `test@restaurant.com`
2. Enter password: `password123`
3. Click "Sign In"
4. ✅ You should be logged in!

---

## Alternative: Fix the Signup Policy (Recommended)

Instead of manually creating users, fix the RLS policy:

### Go to SQL Editor:
https://supabase.com/dashboard/project/ystrzvkgqkqklgcflkbp/sql/new

### Run this SQL:
```sql
CREATE POLICY "Users can insert own profile during signup" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);
```

After running this, signup will work normally in the app!

---

## Quick Test Users

Create these for testing:

### Restaurant User
- Email: `restaurant@test.com`
- Password: `password123`
- Role: `restaurant`

### NGO User
- Email: `ngo@test.com`
- Password: `password123`
- Role: `ngo`

---

## 🎯 Once You're Logged In

You'll see either:
- **Restaurant Dashboard** - Upload food photos, scan with AI, create pickups
- **NGO Dashboard** - View map with pickup locations, accept pickups

---

## 🐛 Troubleshooting

### "Invalid credentials" error
- Check that the email/password match exactly
- Make sure "Auto Confirm User" was checked

### "User not found" error
- Make sure you added the user to BOTH:
  1. Authentication → Users
  2. Table Editor → users table

### Still getting RLS error
- Double-check the user ID matches in both tables
- Or temporarily disable RLS: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`

---

**After creating the test user, try logging in on your Android emulator!** 🚀



