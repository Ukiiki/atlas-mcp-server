# 📱 Mobile Approval System - Complete Guide

## Overview

This system allows you to approve Claude's actions and answer questions from your iPhone, enabling you to stay productive on the go.

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd atlas-frontend
npm run dev
```

The server will start at http://localhost:3000

### 2. Access on Your iPhone

**Option A: Local Network (Same WiFi)**
1. Find your computer's local IP:
   ```bash
   ipconfig getifaddr en0  # Mac
   ```
2. On iPhone, visit: `http://YOUR_IP:3000/approve`

**Option B: Deploy to Vercel (Recommended)**
1. Deploy the app:
   ```bash
   cd atlas-frontend
   vercel --prod
   ```
2. Visit the provided URL + `/approve`
3. Example: `https://carlsbad-chamber.vercel.app/approve`

### 3. Install as PWA on iPhone

1. Open the approval page in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. You now have a native-like app!

## 🎯 Features

### Approval Requests

Claude can create approval requests for:
- **Deployments** - Before pushing to production
- **Code Changes** - Modifying critical files
- **Data Migration** - Moving data between systems
- **Configuration** - Changing settings or environment
- **Custom Operations** - Any action requiring review

### Question & Answer

Claude can ask you questions and you can respond:
- **Multiple Choice** - Tap the option you prefer
- **Free Text** - Type your answer in a text box
- **Contextual** - Questions include full context

### Real-time Updates

- Auto-refreshes every 5 seconds
- See new approvals immediately
- Stats update in real-time
- No manual refresh needed

## 📊 Dashboard Features

### Stats Cards

- **Pending** - Awaiting your approval (orange)
- **Approved** - Actions you've approved (green)
- **Questions** - Unanswered questions (blue)

### Approval Card Details

Each approval shows:
- **Category Badge** - Type of operation (color-coded)
- **Title** - Clear summary
- **Description** - Full details
- **Metadata** - Technical details (expandable)
- **Timestamp** - When it was created
- **Action Buttons** - Approve (green) or Reject (red)

### Question Cards

Each question shows:
- **Question Text** - What Claude wants to know
- **Options** - Pre-defined choices (if applicable)
- **Text Input** - Free-form answer field
- **Timestamp** - When it was asked

## 🔧 API Reference

### Create Approval Request

```bash
POST /api/approvals
Content-Type: application/json

{
  "title": "Deploy to Production",
  "description": "Deploy version 2.0.0 with new features",
  "category": "deployment",
  "metadata": {
    "version": "2.0.0",
    "environment": "production"
  }
}
```

**Categories:**
- `deployment`
- `code_change`
- `data_migration`
- `configuration`
- `other`

### Get Pending Approvals

```bash
GET /api/approvals?status=pending
```

Returns:
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "totalRequests": 10,
    "pending": 2,
    "approved": 7,
    "rejected": 1,
    "unansweredQuestions": 1,
    "totalQuestions": 3
  }
}
```

### Approve or Reject

```bash
PATCH /api/approvals/:id
Content-Type: application/json

{
  "status": "approved",
  "notes": "Looks good, proceed!"
}
```

**Status:** `approved` or `rejected`

### Create Question

```bash
POST /api/questions
Content-Type: application/json

{
  "question": "Which database should we use?",
  "options": ["Supabase", "PostgreSQL", "MongoDB"]
}
```

### Answer Question

```bash
PATCH /api/questions/:id
Content-Type: application/json

{
  "response": "Supabase"
}
```

## 🤖 Claude Integration

### From Claude Code Hooks

The `tool-call.sh` hook automatically creates approvals for:

1. **Destructive Bash Commands**
   - Patterns: `rm -rf`, `DROP`, `DELETE`, `truncate`
   - Category: `code_change`

2. **Critical File Changes**
   - Files: `package.json`, `.env`, `vercel.json`, `tsconfig.json`
   - Category: `configuration`

### Manual Approval Requests

Claude can create approvals programmatically:

```javascript
// In Claude's workflow
const response = await fetch('/api/approvals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Custom Operation',
    description: 'Detailed description of what will happen',
    category: 'other',
    metadata: { key: 'value' }
  })
})
```

### Polling for Approval

Claude can check approval status:

```javascript
// Poll until approved or rejected
const approval = await fetch(`/api/approvals/${id}`)
const data = await approval.json()

if (data.data.status === 'approved') {
  // Proceed with operation
} else if (data.data.status === 'rejected') {
  // Cancel operation
}
```

## 🎨 Customization

### Change Colors

Edit `/atlas-frontend/tailwind.config.ts`:

```typescript
colors: {
  ocean: {
    teal: '#0891b2',   // Your brand color
    blue: '#3b82f6',
    // ...
  }
}
```

### Change Refresh Interval

Edit `/atlas-frontend/src/app/approve/page.tsx`:

```typescript
// Default: 5000ms (5 seconds)
const interval = setInterval(fetchData, 5000)

// Change to 10 seconds:
const interval = setInterval(fetchData, 10000)
```

### Add Authentication

Currently open access. To add PIN auth:

1. Create `/api/auth/verify` endpoint
2. Store PIN in environment variable
3. Check PIN before showing approvals
4. Add PIN input to approve page

Example:

```typescript
// pages/api/auth/verify.ts
if (pin === process.env.APPROVAL_PIN) {
  return { success: true }
}
```

## 🔒 Security Considerations

### Current State
- No authentication (anyone with URL can approve)
- In-memory storage (data lost on restart)
- No encryption

### Production Recommendations

1. **Add Authentication**
   - Simple PIN code (fast to implement)
   - Magic link via email (more secure)
   - OAuth (most secure, but complex)

2. **Persistent Storage**
   - Migrate from in-memory to Supabase
   - Add real-time subscriptions
   - Enable audit logging

3. **Rate Limiting**
   - Prevent approval spam
   - Limit API calls per IP
   - Add CAPTCHA for sensitive operations

4. **HTTPS Only**
   - Required for PWA features
   - Required for push notifications
   - Vercel provides this automatically

## 📈 Future Enhancements

### Push Notifications
Add web push to get notified instantly:

```typescript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

// Request permission
Notification.requestPermission()

// Send notification when approval created
new Notification('New Approval Request', {
  body: 'Claude wants to deploy to production'
})
```

### Voice Input
Allow voice responses to questions:

```typescript
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  handleAnswerQuestion(questionId, transcript)
}
```

### Approval History
Show all past approvals with filtering:

```typescript
GET /api/approvals?status=approved&limit=50&offset=0
```

### Batch Operations
Approve multiple items at once:

```typescript
POST /api/approvals/batch
{
  "approvals": ["id1", "id2", "id3"],
  "status": "approved"
}
```

## 🐛 Troubleshooting

### Approvals not showing up?

**Check:**
1. Is dev server running? `npm run dev`
2. Is API responding? Visit `/api/approvals`
3. Check browser console for errors
4. Try hard refresh (Cmd+Shift+R)

### Can't access from iPhone?

**Check:**
1. Same WiFi network as computer?
2. Computer firewall blocking port 3000?
3. Correct IP address?
4. Try `0.0.0.0:3000` instead of `localhost:3000` when starting dev server:
   ```json
   // package.json
   "dev": "next dev -H 0.0.0.0"
   ```

### PWA not installing?

**Check:**
1. Using HTTPS? (Required for PWA)
2. Using Safari on iPhone? (Chrome doesn't support Add to Home Screen same way)
3. Valid manifest.json? Visit `/manifest.json`

### Real-time updates not working?

**Check:**
1. JavaScript enabled?
2. Interval running? Check browser console
3. API requests succeeding? Check Network tab
4. Try manual refresh button

## 💡 Pro Tips

1. **Bookmark the URL** - Add to favorites for quick access
2. **Use shortcuts** - PWA shortcuts let you jump to specific tabs
3. **Enable notifications** - Get instant alerts for new approvals
4. **Test locally first** - Always test approval flow before deploying
5. **Keep it simple** - Don't over-engineer the approval process

## 📞 Support

Having issues? Check:
1. This guide first
2. Browser console for errors
3. Server logs for API errors
4. `.claude/README.md` for hook setup

## 🎓 Learning Resources

- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Claude Code Hooks](https://docs.claude.com/en/docs/claude-code/hooks)

---

Built with ❤️ for the Carlsbad Chamber of Commerce

**Ready to approve from anywhere!** 🚀📱
