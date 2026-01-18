# Authentication Testing Guide

Complete guide to test all authentication features in Ambag.

---

## 🎯 What's Been Built

### ✅ Features Ready to Test:
1. **Email/Password Signup** - Create account with email
2. **Email/Password Login** - Sign in with credentials
3. **Google OAuth** - Sign in with Google (needs setup)
4. **Protected Routes** - Dashboard requires login
5. **Auto-redirect** - Logged-in users skip auth pages
6. **Session Management** - Stays logged in on refresh
7. **Logout** - Sign out functionality
8. **Database Profile** - Auto-creates user profile
9. **Auth Test Page** - Detailed auth info display

---

## 📋 Testing Checklist

### Test 1: Email Signup ✓

1. Go to http://localhost:3000
2. Click "Get started"
3. Fill in signup form:
   - Full name: "Test User"
   - Email: "test@example.com"
   - Password: "Test1234"
   - Confirm: "Test1234"
4. Click "Continue"

**Expected**:
- ✅ Green success message appears
- ✅ Redirects to `/dashboard` after 1 second
- ✅ Shows "Welcome back" with your email
- ✅ "Sign out" button visible

---

### Test 2: Check Database Profile ✓

1. From dashboard, click "View Auth Details"
2. Go to http://localhost:3000/test-auth

**Expected**:
- ✅ Shows "✓ Authentication Status: Authenticated"
- ✅ Provider: Email/Password
- ✅ User ID, Email displayed
- ✅ Database Profile: "✓ Profile exists"
- ✅ Full Name matches what you entered

---

### Test 3: Logout ✓

1. Click "Sign out" button
2. Or use logout from dashboard

**Expected**:
- ✅ Redirects to `/login`
- ✅ No longer authenticated

---

### Test 4: Email Login ✓

1. Go to http://localhost:3000/login
2. Enter:
   - Email: "test@example.com"
   - Password: "Test1234"
3. Click "Continue"

**Expected**:
- ✅ Redirects to `/dashboard`
- ✅ Logged in successfully

---

### Test 5: Protected Routes ✓

1. **Logout first**
2. Try accessing: http://localhost:3000/dashboard
3. Or: http://localhost:3000/test-auth

**Expected**:
- ✅ Auto-redirects to `/login`
- ✅ Cannot access without auth

---

### Test 6: Auto-redirect When Logged In ✓

1. **Make sure you're logged in**
2. Try accessing: http://localhost:3000/login
3. Or: http://localhost:3000/signup

**Expected**:
- ✅ Auto-redirects to `/dashboard`
- ✅ Cannot see auth pages when logged in

---

### Test 7: Session Persistence ✓

1. Login to your account
2. **Refresh the page** (F5)
3. Or close tab and reopen

**Expected**:
- ✅ Still logged in
- ✅ No redirect to login
- ✅ Session persists

---

### Test 8: Google OAuth (Setup Required)

**FIRST**: Follow `GOOGLE_OAUTH_SETUP.md` to configure Google OAuth

**Then**:
1. Go to http://localhost:3000/signup
2. Click "Continue with Google"
3. Select your Google account
4. Authorize the app

**Expected**:
- ✅ Redirects to Google sign-in
- ✅ After authorization, redirects to `/dashboard`
- ✅ Logged in with Google
- ✅ Profile auto-created in database

**Check Google auth worked**:
1. Go to http://localhost:3000/test-auth
2. Check "Provider" field

**Expected**:
- ✅ Shows "Provider: Google OAuth"

---

### Test 9: Form Validation ✓

**Test signup validation**:
1. Go to http://localhost:3000/signup
2. Try submitting with:
   - ❌ Short name (1 char) - Should show error
   - ❌ Invalid email - Should show error
   - ❌ Weak password (less than 8 chars) - Should show error
   - ❌ No uppercase in password - Should show error
   - ❌ Passwords don't match - Should show error

**Expected**:
- ✅ Red error messages appear
- ✅ Form doesn't submit
- ✅ Helpful error text

---

### Test 10: Error Handling ✓

**Test wrong credentials**:
1. Go to http://localhost:3000/login
2. Enter wrong password
3. Click "Continue"

**Expected**:
- ✅ Red error: "Invalid email or password"
- ✅ Stays on login page

**Test duplicate email**:
1. Try signing up with email that already exists
2. Click "Continue"

**Expected**:
- ✅ Shows error message
- ✅ Doesn't create duplicate account

---

## 🔍 Detailed Verification

### Check Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Users**

**Verify**:
- ✅ Your test user appears in list
- ✅ Email matches
- ✅ Provider shown (email or google)
- ✅ Created timestamp

### Check Database

1. In Supabase, go to **Table Editor**
2. Open `users` table

**Verify**:
- ✅ User profile exists
- ✅ ID matches auth user ID
- ✅ Email, full_name populated
- ✅ created_at timestamp

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found '@/lib/supabase/server'"
**Fix**: Make sure all lib files exist:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

### Issue: "Invalid API key"
**Fix**:
1. Check `.env.local` has correct credentials
2. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "User not redirecting after login"
**Fix**:
1. Check middleware is working
2. Clear browser cache/cookies
3. Try incognito mode

### Issue: Google OAuth not working
**Fix**:
1. Complete `GOOGLE_OAUTH_SETUP.md`
2. Check redirect URI matches exactly
3. Add your email as test user in Google Console

### Issue: Profile not created in database
**Fix**:
1. Check migration `001_initial_schema.sql` was run
2. Verify trigger exists: `on_auth_user_created`
3. Check Supabase logs for errors

---

## ✅ Success Criteria

All these should work:
- ✅ Can signup with email/password
- ✅ Can login with email/password
- ✅ Can logout
- ✅ Dashboard is protected
- ✅ Session persists on refresh
- ✅ Profile created in database
- ✅ Form validation works
- ✅ Error messages display
- ✅ Google OAuth works (if configured)
- ✅ Test page shows all data

---

## 📊 Test Page Info

The test page at `/test-auth` shows:

1. **Authentication Status** - Logged in or not
2. **Provider** - Email or Google
3. **Supabase Auth Data** - User ID, email, timestamps
4. **User Metadata** - Name, avatar (from Google)
5. **Database Profile** - From `users` table
6. **Session Info** - Token validity, role
7. **Raw JSON** - Full data dump for debugging

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. ✅ Authentication is fully functional
2. ➡️ Move to **Groups** (Create, Join, Invite)
3. Then **Expenses** (Add, Split, View)
4. Then **Balances** (Calculate, Simplify, Settle)

---

## 💡 Pro Tips

- **Use incognito** for testing signup/login flows
- **Check browser console** for errors (F12)
- **Check Supabase logs** in dashboard
- **Test on mobile** (responsive design)
- **Try multiple accounts** to verify isolation
- **Test edge cases** (empty forms, special characters)

---

**Happy testing!** 🎉

If something doesn't work, check:
1. Dev server is running (`npm run dev`)
2. Supabase migrations ran successfully
3. `.env.local` has correct credentials
4. Browser console for errors
