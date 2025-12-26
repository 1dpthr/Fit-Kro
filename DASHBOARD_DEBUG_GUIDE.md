# Dashboard Debug Guide - Complete Logging Added

## 🔍 Comprehensive Debugging Now Active

I've added detailed logging throughout the entire data flow to identify exactly what's happening with the dashboard issue. Here's what to check:

## 📋 Testing Steps with Debug Output

### 1. Open Browser Developer Tools
- Open http://localhost:3000
- Press F12 or right-click → Inspect
- Go to "Console" tab

### 2. Complete the Full Flow
Follow this exact sequence:

**Step A: Sign Up**
1. Click "Sign Up" tab
2. Enter email: `test@example.com`
3. Enter password: `123456`
4. Click "Create Account"

**Step B: Onboarding**
5. Fill out Step 1: Name, Gender, Age
6. Fill out Step 2: Height, Weight
7. Fill out Step 3: Goals, Activity, Diet
8. Click "Complete"

**Step C: Dashboard**
9. Navigate to dashboard
10. Check console for debug messages

## 🖥️ What to Look For in Console

### Expected Console Output:

#### During Signup:
```
🎯 handleAuthSuccess called with: {type: "signup", prefill: {...}}
💾 Stored prefill data in localStorage: {email: "test@example.com", name: "Test User"}
🚀 Setting onboarding prefill and navigating to onboarding
```

#### During Onboarding Completion:
```
🚀 Starting onboarding completion process...
📋 Form data: {name: "John Doe", gender: "male", age: "25", ...}
💾 Saving profile data to localStorage (demo mode)
🔄 Saving to localStorage: {name: "John Doe", ...}
✅ Verification - saved data: {"name":"John Doe","gender":"male",...}
✅ Profile saved to localStorage successfully
🎯 Calling onComplete callback...
🎉 Onboarding completed - entering app
💾 Setting onboarding_completed to true in localStorage
📋 localStorage keys after onboarding: ["demo_profile","onboarding_completed","signup_prefill"]
💾 demo_profile data: {"name":"John Doe",...}
✅ onboarding_completed status: "true"
🔄 Setting app state to "app"
🎯 App state transition complete
```

#### During Dashboard Loading:
```
🔍 Loading profile data for dashboard...
📋 All localStorage keys: ["demo_profile","onboarding_completed","signup_prefill"]
💾 demo_profile data: {"name":"John Doe","gender":"male",...}
📱 signup_prefill data: {"email":"test@example.com","name":"Test User"}
✅ onboarding_completed status: "true"
✅ Loaded profile from localStorage: {name: "John Doe", ...}
🏷️ Set user name to: John Doe
```

## 🚨 If Dashboard Shows "User" Instead of Name

### Check These Console Messages:

#### ❌ If you see this:
```
⚠️ No demo_profile found in localStorage
⚠️ No signup_prefill found in localStorage
📱 Using default user name
🏷️ Set user name to: User (default)
```

**This means the data wasn't saved to localStorage properly**

### Possible Issues:
1. **localStorage is disabled** in browser
2. **Data saving failed** during onboarding
3. **Race condition** - Dashboard loaded before onboarding completed
4. **Data was overwritten** or cleared

#### 🔧 Solutions:
- Clear browser localStorage and try again
- Check if localStorage is enabled in browser
- Try refreshing the page after onboarding completes

#### ❌ If you see this:
```
⚠️ localStorage failed, trying server fallback: [Error]
```

**This means localStorage operations are failing**

#### 🔧 Solutions:
- Check browser console for localStorage errors
- Try incognito/private browsing mode
- Check if localStorage quota is exceeded

## 🧪 Quick Debug Test

### Test localStorage Directly:
1. Open browser console
2. Type: `localStorage.getItem('demo_profile')`
3. Should show your profile JSON data
4. If null/empty, data wasn't saved

### Test Profile Loading:
1. After completing onboarding
2. Type: `localStorage.getItem('demo_profile')`
3. Should show: `{"name":"Your Name",...}`

### Check Dashboard State:
1. Navigate to dashboard
2. Look for these exact messages:
   - `✅ Loaded profile from localStorage:`
   - `🏷️ Set user name to: Your Name`

## 📊 Expected localStorage Content

After successful onboarding, localStorage should contain:

```javascript
// demo_profile
{
  "name": "John Doe",
  "gender": "male", 
  "age": 25,
  "height": 175,
  "weight": 70,
  "goal": "maintain",
  "activityLevel": "moderate",
  "dietPreference": "none",
  "completed": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// signup_prefill  
{
  "email": "test@example.com",
  "name": "Test User"
}

// onboarding_completed
"true"
```

## 🎯 Troubleshooting Steps

### Step 1: Check Console During Signup
- Look for prefill storage messages
- Verify localStorage keys are created

### Step 2: Check Console During Onboarding
- Look for data saving messages
- Verify profile data is saved to localStorage

### Step 3: Check Console During Dashboard Load
- Look for profile loading messages
- Verify user name is set correctly

### Step 4: Manual localStorage Check
- Open browser console
- Type: `console.log(localStorage)`
- Check if demo_profile exists

## 🔍 Specific Error Messages to Watch For

### ❌ localStorage Issues:
- `⚠️ localStorage failed, trying server fallback`
- `⚠️ Failed to load from localStorage`
- `⚠️ localStorage save failed`

### ❌ Data Flow Issues:
- `⚠️ No demo_profile found in localStorage`
- `⚠️ No signup_prefill found in localStorage`
- `⚠️ No session found for server fallback`

### ❌ State Issues:
- `🚨 Session error - redirecting to auth`
- `🚫 No active session - redirecting to auth`
- `🚨 Auth check failed - redirecting to auth`

## ✅ Success Indicators

### ✅ Signup Success:
```
💾 Stored prefill data in localStorage: {...}
🚀 Setting onboarding prefill and navigating to onboarding
```

### ✅ Onboarding Success:
```
✅ Verification - saved data: {...}
✅ Profile saved to localStorage successfully
🎉 Onboarding completed - entering app
📋 localStorage keys after onboarding: [...]
💾 demo_profile data: {...}
```

### ✅ Dashboard Success:
```
✅ Loaded profile from localStorage: {...}
🏷️ Set user name to: John Doe
```

## 🎯 Next Steps

1. **Run the test flow** with browser console open
2. **Copy all console messages** during the process
3. **Check localStorage directly** in console
4. **Look for the specific error patterns** above
5. **Report back** with the exact console output

The comprehensive logging will show us exactly where the data flow is breaking and why the dashboard isn't displaying the user name correctly!

