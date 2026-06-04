# 🎯 Quick Reference - Modem Call System

## 📋 System Requirements
- Node.js v14+
- Modern Browser (Chrome, Firefox, Safari, Edge)
- USB Modem with ModemManager
- Linux system with ModemManager installed

## 🚀 Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd /run/media/varydev/STUFFS/DEVELOPER_PROJECTS/modem/modem-backend
npm run dev
```
✅ Server runs on `http://localhost:3001`

### Step 2: Start Frontend
```bash
cd /run/media/varydev/STUFFS/DEVELOPER_PROJECTS/modem/modem-ui
npm run dev
```
✅ App runs on `http://localhost:5174`

### Step 3: Open in Browser
```
http://localhost:5174
```

---

## 📱 Interface Overview

### Left Panel (Dialer & Call Status)
```
┌─ HEADER ─────────────────────┐
│ Call Center | Status: Ready   │
├─ DISPLAY ────────────────────┤
│ Dialed: 100   Duration: 00:00 │
├─ KEYPAD ─────────────────────┤
│ 1  2  3  ⌫                   │
│ 4  5  6  C                   │
│ 7  8  9  [Dial]              │
│ *  0  #                      │
├─ CALL STATUS ────────────────┤
│ 📞 Incoming Call: +256...    │
│ [✓ Answer] [✕ Decline]      │
└──────────────────────────────┘
```

### Right Panel (Media & Controls)
```
┌─ MEDIA CONTROLS ──────────────┐
│ [🎤 Microphone ON]            │
│ [📢 Speaker OFF]              │
│ Volume: ░░░░░░ 70%            │
│ 🟢 Microphone connected       │
├─ QUICK ACTIONS ──────────────┤
│ [📞 Place Call]               │
│ [✓ Answer]                    │
│ [✕ End Call]                  │
│ [⊗ Hangup All]                │
├─ CALL QUEUE ─────────────────┤
│ • 100 (active) 🔴            │
│ • +256... (queued) 🔴        │
└──────────────────────────────┘
```

---

## 📞 How to Make a Call

### Step-by-Step
1. **Enter Number**
   - Click keypad buttons: `1-0`, `*`, `#`
   - Or type phone number: `100`, `+256700123456`
   - Display shows: `100`

2. **Dial**
   - Click green `[📞 Place Call]` button
   - Or click blue `[Dial]` on keypad
   - Browser asks for microphone permission (first time)

3. **During Call**
   - Duration timer starts: `00:00:01`
   - Microphone status shows: `ON`
   - Can use media controls

4. **End Call**
   - Click red `[✕ End Call]` button
   - Or click `[⊗ Hangup All]` for all calls
   - Call ends, timer stops

---

## 🎤 Microphone Controls

### Initial Setup
- **First Dial**: Browser asks "Allow [site] to access your microphone?"
- **Click Allow**: Gives permission (persistent)
- **Green Indicator**: Shows microphone is connected

### During Call
| Button | Action | Status |
|--------|--------|--------|
| [🎤 Microphone] | Toggle mute | Shows ON/OFF |
| [📢 Speaker] | Toggle speaker | Shows ON/OFF |
| Volume Slider | Adjust 0-100% | Shows % |

### Examples
```
Scenario 1: Mute Yourself
1. Click [🎤 Microphone ON] button
2. It changes to [🎤 Microphone OFF]
3. Caller can't hear you
4. Click again to unmute

Scenario 2: Adjust Volume
1. Find "Volume" slider
2. Drag left for quiet, right for loud
3. Shows current: "70%"
4. Changes apply instantly
```

---

## ☎️ Call Examples

### Example 1: Dial Number
```
✓ Enter: "100"
✓ Click: "Place Call"
✓ Duration: Starts at 00:00:01
✓ Microphone: Automatic access
✓ Status: Active Call
✓ End: Click "End Call"
```

### Example 2: USSD Code
```
✓ Enter: "*123#"
✓ Click: "Place Call"
✓ Shows: Menu or response
✓ Duration: Tracks time
✓ End: "End Call"
```

### Example 3: Incoming Call
```
✓ Phone rings
✓ Notification: "+256700123456"
✓ Options: [✓ Answer] [✕ Decline]
✓ Click: "Answer"
✓ Duration: Starts tracking
✓ Manage: Use media controls
✓ End: "End Call"
```

---

## 🎯 Common Buttons & What They Do

| Button | Action | When to Use |
|--------|--------|------------|
| 📞 Place Call | Dials number | After entering number |
| ✓ Answer | Accepts incoming | When phone ringing |
| ✕ End Call | Terminates current | During active/incoming |
| ⊗ Hangup All | Ends all calls | To clear queue |
| ⌫ Delete | Remove last digit | To fix number |
| C Clear | Reset dialer | To start over |
| 🎤 Microphone | Toggle mute | During call |
| 📢 Speaker | Toggle speaker | During call |

---

## 🟢 Status Indicators

### Microphone Status
- 🟢 **Green Dot + "Microphone connected"** = Ready to use
- 🔴 **Red Dot + "Microphone access required"** = Need permission

### Call Status
- 📞 **"Idle"** = No calls active
- 🔴 **"Incoming Call"** = Phone ringing (green notification)
- 🟡 **"Active Call"** = Call in progress (yellow notification)
- 📋 **"Call Queue"** = Multiple calls listed

### Media Controls
- 🎤 **Green Background** = Microphone ON (you can be heard)
- 🎤 **Red Background** = Microphone OFF (muted)
- 📢 **Blue Background** = Speaker ON (volume playing)
- 📢 **Gray Background** = Speaker OFF

---

## ⚠️ Troubleshooting

### Issue: Can't Hear
```
Solution:
1. Check speaker toggle is ON (blue)
2. Check volume slider not at 0%
3. Check system volume (PC/Mac volume)
4. Try speaker toggle OFF then ON
```

### Issue: Caller Can't Hear You
```
Solution:
1. Check microphone toggle is ON (green background)
2. Check system microphone settings
3. Test: Click mute OFF, then ON
4. Check volume slider (should be >0%)
```

### Issue: Microphone Permission Denied
```
Solution:
1. Check browser address bar for permission indicator
2. Click permission icon and click "Allow"
3. Or clear site permissions and reload
4. Different browsers: Check each browser settings
```

### Issue: No Incoming/Outgoing Calls
```
Solution:
1. Verify modem is connected (status shows "Ready")
2. Check number format (digits only, or *code#)
3. Verify backend is running (http://localhost:3001)
4. Check number is valid for your network
```

---

## 🌐 Access URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5174 | 5174 |
| Backend API | http://localhost:3001 | 3001 |
| API: Status | /api/call/status | - |
| API: Dial | /api/call/dial | - |
| API: Answer | /api/call/answer | - |
| API: Hangup | /api/call/hangup | - |

---

## 📊 Supported Number Formats

| Format | Example | Use Case |
|--------|---------|----------|
| Simple Number | `100` | Short codes, emergency |
| Long Number | `0712345678` | Regular phone numbers |
| International | `+256700123456` | Cross-border calls |
| USSD Code | `*123#` | Network services, balance |
| Complex USSD | `*99*1#` | Multiple-step codes |

---

## 🎨 Visual Feedback

### Colors Meaning
- 🟢 **Green**: Good, enabled, answer
- 🔴 **Red**: Critical, hangup, error
- 🟡 **Yellow**: Warning, active, caution
- 🔵 **Blue**: Info, secondary action
- 🟠 **Orange**: Primary accent, important
- ⚪ **Gray**: Disabled, inactive

### Animations
- **Pulse**: Loading or incoming (animated dot)
- **Scale**: Button hover (grows slightly)
- **Fade**: Message appear/disappear
- **Slide**: Panel transitions

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 0-9 | Type digits |
| * | DTMF star |
| # | DTMF hash |
| Enter | Dial |
| Backspace | Delete |
| Escape | Clear |
| Tab | Navigate buttons |
| Space | Activate button |

---

## 📱 Mobile Tips

### Best Practices
1. **Hold Portrait**: Better for landscape on landscape devices
2. **Full Screen**: Use full screen mode for better UX
3. **Landscape**: Try landscape mode for bigger buttons
4. **Touch**: Use large touch targets (don't rush)
5. **Speakers**: Use external speakers for better audio

### Mobile Keypad
```
Compact layout:
1  2  3
4  5  6
7  8  9
*  0  #  [Dial]

Vertical stack:
- Display
- Keypad
- Controls
- Media
```

---

## 🔧 System Requirements

### Minimum
- **RAM**: 512 MB
- **Disk**: 100 MB
- **CPU**: Dual-core
- **Network**: Broadband

### Recommended
- **RAM**: 2 GB
- **Disk**: 500 MB
- **CPU**: Quad-core
- **Network**: Fast broadband

### Modem
- Compatible with ModemManager
- Huawei E153 (tested)
- Other GSM modems (should work)

---

## 📖 Documentation

### Available Docs
1. **COMPLETE_GUIDE.md** - Full system documentation
2. **API_REFERENCE.md** - REST API endpoints
3. **CALL_SYSTEM_IMPROVEMENTS.md** - Backend features
4. **FRONTEND_IMPROVEMENTS.md** - Frontend features
5. **README.md** - Project overview

---

## 🎯 Feature Summary

✅ **Calling**: Dial, answer, hangup
✅ **Audio**: Microphone, speaker, volume
✅ **Timer**: Call duration tracking
✅ **Queue**: See all calls
✅ **Mobile**: Fully responsive
✅ **Real-time**: WebSocket updates
✅ **Media**: Full audio control
✅ **Status**: Live indicators
✅ **Error**: Clear messages
✅ **Permissions**: Secure & safe

---

## 🚀 Getting Help

### Check These First
1. Backend running? `http://localhost:3001`
2. Frontend running? `http://localhost:5174`
3. Modem connected? Check status
4. Microphone allowed? Check permission
5. Number valid? Check format

### Documentation
- See COMPLETE_GUIDE.md for detailed help
- See API_REFERENCE.md for API details
- Check README.md for overview

---

**Last Updated**: June 4, 2026
**Status**: ✅ Ready to Use
**Version**: 2.0
