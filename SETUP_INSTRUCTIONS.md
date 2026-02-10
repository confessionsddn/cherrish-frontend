# 🎯 SETUP INSTRUCTIONS - LOVECONFESS REACT

**Complete guide to run your React frontend locally**

---

## 📋 PREREQUISITES

Before you start, make sure you have:

1. **Node.js** installed (version 18 or higher)
   - Check: `node --version`
   - Download from: https://nodejs.org/

2. **npm** (comes with Node.js)
   - Check: `npm --version`

3. **Code Editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Extract the Project

Extract the `loveconfess-frontend` folder to your desired location.

```
📁 loveconfess-frontend/
   ├── src/
   ├── index.html
   ├── package.json
   └── ...
```

### Step 2: Open Terminal

**Windows:**
- Open Command Prompt or PowerShell
- Navigate to project: `cd path\to\loveconfess-frontend`

**Mac/Linux:**
- Open Terminal
- Navigate to project: `cd path/to/loveconfess-frontend`

### Step 3: Install Dependencies

```bash
npm install
```

**What this does:**
- Downloads React and all required packages
- Creates `node_modules` folder
- Takes 1-2 minutes

**Expected output:**
```
added 250 packages, and audited 251 packages in 45s
found 0 vulnerabilities
```

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 5: Open in Browser

1. Open your browser (Chrome, Firefox, Edge, Safari)
2. Go to: **http://localhost:3000**
3. You should see the LOVECONFESS interface!

---

## ✅ VERIFY IT'S WORKING

Test these features:

### 1. Header
- [ ] See "LOVECONFESS" logo
- [ ] See credits display (150 CREDITS)
- [ ] Theme toggle button visible
- [ ] Premium button visible

### 2. Confession Form
- [ ] See "SHARE YOUR HEART" heading
- [ ] See 4 mood zones (2x2 grid)
- [ ] Click different moods - they should activate
- [ ] Type in text area
- [ ] Click "VOICE CONFESSION" button
- [ ] Submit a confession

### 3. Confession Feed
- [ ] See 5 sample confessions
- [ ] See filter buttons (All, Crush, Heartbreak, etc.)
- [ ] Click reactions - numbers should increase
- [ ] Click gift button - modal should open

### 4. Animations
- [ ] See floating shapes in background
- [ ] Confetti on confession submit
- [ ] Emoji burst on reactions
- [ ] Mood transition animations

### 5. Modals
- [ ] Click "PREMIUM" - modal opens
- [ ] Click "GIFT" - modal opens
- [ ] Click X or outside - modals close

### 6. Theme Toggle
- [ ] Click moon icon
- [ ] Background should change to dark
- [ ] Click sun icon
- [ ] Background should change to light

---

## 🐛 TROUBLESHOOTING

### Problem: "command not found: npm"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: Port 3000 already in use
**Solution:**
```bash
# Windows
npx kill-port 3000

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Then run `npm run dev` again.

### Problem: "Cannot find module"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: White screen or errors
**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Share error message with me

### Problem: CSS not loading properly
**Solution:**
```bash
# Clear cache and restart
rm -rf .vite
npm run dev
```

### Problem: Animations not working
**Solution:**
- Make sure JavaScript is enabled in browser
- Check browser console for errors
- Try a different browser (Chrome recommended)

---

## 📝 TESTING CHECKLIST

After setup, test ALL features:

**Basic Features:**
- [ ] Page loads without errors
- [ ] All text is visible and readable
- [ ] Buttons are clickable
- [ ] Forms work

**Confession System:**
- [ ] Can select mood zones
- [ ] Can type in text area
- [ ] Can submit confession
- [ ] New confession appears at top of feed
- [ ] Timestamp shows "JUST NOW"

**Reactions:**
- [ ] Heart button increments count
- [ ] Like button increments count
- [ ] Cry button increments count
- [ ] Laugh button increments count
- [ ] Emoji burst animation plays

**Voice Recording:**
- [ ] Click "VOICE CONFESSION"
- [ ] Voice recorder UI appears
- [ ] Click "START RECORDING"
- [ ] Browser asks for microphone permission
- [ ] Click "STOP RECORDING"
- [ ] Can play recording back

**Filtering:**
- [ ] Click "Crush" - only crush confessions show
- [ ] Click "Heartbreak" - only heartbreak confessions show
- [ ] Click "All" - all confessions show

**Modals:**
- [ ] Premium modal opens
- [ ] Shows premium items
- [ ] Purchase button works (deducts credits)
- [ ] Gift modal opens
- [ ] Shows gift options
- [ ] Send gift works (deducts credits)

**Theme:**
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Toggle switches smoothly

**Animations:**
- [ ] Floating shapes move in background
- [ ] Confetti bursts on submit
- [ ] Hearts float on reactions
- [ ] Mood transition plays (Crush → Heartbreak)

---

## 🎉 SUCCESS!

If everything above works, **your React frontend is ready!**

**Next Steps:**

1. **Test thoroughly** - Click everything, try to break it
2. **Note any bugs** - Write down what doesn't work
3. **Tell me** - Share your findings
4. **Move to Backend** - Once frontend is confirmed working

---

## 📸 WHAT IT SHOULD LOOK LIKE

### Light Mode
- White/cream background
- Black borders
- Pastel colored mood zones
- Pink "SHARE ANONYMOUSLY" button

### Dark Mode
- Dark gray background
- White borders
- Darker pastel mood zones
- Same pink button

### Confession Card
- White background (or yellow if premium)
- Black thick border
- Brutal shadow (4px offset)
- Mood badge in top left
- Reaction buttons at bottom
- Hover effect (card moves)

---

## 💻 DEVELOPMENT TIPS

### Hot Reload
- Save any file
- Browser auto-refreshes
- No need to restart server

### Browser DevTools
- Press F12
- Console tab shows errors
- React tab shows component state (if extension installed)

### React DevTools Extension
- Chrome: https://chrome.google.com/webstore (search "React DevTools")
- Firefox: https://addons.mozilla.org/firefox (search "React DevTools")
- Helps debug React components

### Stop Server
- Press `Ctrl + C` in terminal
- Confirms: "Terminate batch job? (Y/N)"
- Type Y and press Enter

### Restart Server
```bash
npm run dev
```

---

## 🔍 FILE LOCATIONS (For Debugging)

If you need to check/edit files:

**Main App:** `src/App.jsx`
**Confession Form:** `src/components/ConfessionForm/ConfessionForm.jsx`
**Mood Selector:** `src/components/ConfessionForm/MoodSelector.jsx`
**Confession Card:** `src/components/ConfessionFeed/ConfessionCard.jsx`
**Styles:** `src/styles/global.css`

---

## 📞 WHEN TO CONTACT ME

Contact me if:
- ❌ Installation fails
- ❌ Server won't start
- ❌ White screen appears
- ❌ Errors in console
- ❌ Features don't work
- ✅ Everything works! (Tell me so we can move to backend)

---

## 🎯 FINAL CHECK

Before saying "it works":

1. [ ] All 5 sample confessions visible
2. [ ] Can post new confession
3. [ ] New confession appears at top
4. [ ] Reactions increment
5. [ ] Filters work
6. [ ] Modals open/close
7. [ ] Theme toggle works
8. [ ] Animations play
9. [ ] No console errors
10. [ ] Mobile responsive (resize browser)

**If all checked ✅ → FRONTEND COMPLETE!**

---

Ready? Let's go! 🚀

```bash
npm install
npm run dev
```
