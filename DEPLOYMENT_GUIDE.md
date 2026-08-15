# Milan Portfolio - Deployment & Setup Guide

## Project Overview
This is a professional portfolio website for Milan Rathod (Python/Django Developer) with an integrated AI assistant powered by Google Gemini API. The site includes:

- Responsive portfolio website with projects, skills, certificates
- AI chatbot widget (Ask AI Assistant button)
- Contact form with CSV logging
- Admin dashboard for managing contacts
- Resume and certification showcase

---

## Local Development Setup

### Prerequisites
- Node.js v16+ installed
- Python 3.8+ installed
- Google Gemini API Key ([Get API Key](https://ai.google.dev/))

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Milan_Portfolio_Website
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment** (for local AI backend)
   ```bash
   cd ai-agent/backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   pip install -r requirements.txt
   cd ../..
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your Gemini API Key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start the Node.js server (serves portfolio + manages Python backend)
   npm run start:local
   
   # This will:
   # - Start the website on http://localhost:3000
   # - Automatically launch the Python AI backend on http://localhost:8000
   ```

6. **Open in browser**
   - Visit http://localhost:3000
   - Click the "🤖 Ask AI Assistant" button in the top navigation
   - Or click the floating AI button in the bottom right

---

## Features & How to Use

### 🤖 AI Assistant
- Click "Milan AI" button in top-right navigation
- Ask questions about Milan's skills, projects, experience, etc.
- The AI will answer **only** from the portfolio data (no hallucinations)
- If you ask about unrelated topics, it will politely redirect you

**Portfolio Data Files:**
- `ai-agent/data/profile.json` - Basic info
- `ai-agent/data/skills.json` - Technical skills
- `ai-agent/data/projects.json` - Projects list
- `ai-agent/data/experience.json` - Work experience
- `ai-agent/data/education.json` - Education history
- `ai-agent/data/certificates.json` - Certifications
- `ai-agent/data/resume.json` - Resume link
- `ai-agent/data/contact.json` - Contact information

### 📝 Contact Form
- Fill out contact form in the Contact section
- Submissions are saved to `contact.csv`
- Admin can access submissions via the admin dashboard

### 🔐 Admin Dashboard
- Access: http://localhost:3000/admin.html
- Password: `milan123` (can be changed in `server.js`)
- Features:
  - View all contact submissions
  - Filter and delete messages
  - Export contact data

---

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in with GitHub
3. Click "New Project"
4. Select your portfolio repository
5. Click "Import"

### Step 3: Configure Environment Variables
In the Vercel project settings:

1. Go to **Settings → Environment Variables**
2. Add the following variables:
   ```
   GEMINI_API_KEY = your_actual_api_key_here
   ```
3. Make sure it's added to **Production** environment
4. Click "Save"

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the deployment to complete
3. Your site will be live at: `https://<project-name>.vercel.app`

### Step 5: Test the AI Widget
1. Visit your deployed site
2. Click the "Ask AI Assistant" button
3. Ask a question like "Tell me about Milan"
4. The AI should respond using the Vercel API route (`/api/chat`)

---

## API Endpoints

### Local Development
- **Portfolio Site:** `http://localhost:3000`
- **AI Chat API:** `http://localhost:8000/chat` (Python backend)
- **Contact Submissions:** `POST http://localhost:3000/submit-contact`
- **Admin Login:** `POST http://localhost:3000/api/admin/login`

### Production (Vercel)
- **Portfolio Site:** `https://your-project.vercel.app`
- **AI Chat API:** `https://your-project.vercel.app/api/chat` (Vercel Serverless Function)
- **Contact Submissions:** `POST https://your-project.vercel.app/submit-contact`

---

## Troubleshooting

### AI Assistant Shows "Offline" Message
**Cause:** Backend is not running or API key is missing

**Fix:**
- Ensure `GEMINI_API_KEY` is set in `.env` (local) or Vercel Environment Variables (production)
- Restart the server: `npm run start:local`
- Check browser console for detailed error messages

### Contact Form Not Saving
**Cause:** Server not running or CORS issue

**Fix:**
- Ensure Node.js server is running: `npm run start:local`
- Check that `contact.csv` exists and is writable
- Clear browser cache and retry

### Admin Dashboard Password Not Working
**Cause:** Password is hardcoded in `server.js`

**Fix:**
- Default password is `milan123`
- To change it, edit line in `server.js`:
  ```javascript
  if (password === 'your_new_password_here') {
  ```

### Vercel Deployment Fails
**Cause:** Missing environment variables or build issues

**Fix:**
- Verify `GEMINI_API_KEY` is set in Vercel Environment Variables
- Check deployment logs in Vercel dashboard
- Ensure `.env` file is in `.gitignore` (don't commit secrets)

---

## File Structure
```
Milan_Portfolio_Website/
├── index.html              # Main portfolio page
├── admin.html              # Admin dashboard
├── style.css               # Main styles
├── script.js               # Main JavaScript
├── server.js               # Node.js Express server
├── package.json            # Node.js dependencies
├── ai-agent-widget.js      # AI chat widget
├── ai-agent-widget.css     # Widget styles
├── .env.example            # Environment variables template
├── .env                    # ACTUAL secrets (don't commit!)
├── vercel.json             # Vercel configuration
├── .vercelignore           # Files to ignore on Vercel
├── api/
│   └── chat.js            # Vercel serverless function for AI
├── ai-agent/
│   ├── backend/
│   │   ├── main.py        # FastAPI server
│   │   ├── agent.py       # AI logic
│   │   ├── tools.py       # Portfolio data loaders
│   │   ├── requirements.txt
│   │   └── .env           # Local API key (don't commit!)
│   └── data/
│       ├── profile.json
│       ├── skills.json
│       ├── projects.json
│       └── ...
├── resume/                 # Resume files
├── images/                 # Portfolio images
└── contact.csv            # Contact form submissions (auto-created)
```

---

## Security Notes

⚠️ **Important:**
1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Keep API keys secret** - Use Vercel Environment Variables for production
3. **Update admin password** - Change from default `milan123` in production
4. **CORS is open** - Limit to your domain in production if needed

---

## Customization

### Change AI Model
Edit `ai-agent/backend/agent.py`:
```python
DEFAULT_MODELS = ["gemini-2.5-flash", ...]  # Add your preferred model
```

### Change Admin Password
Edit `server.js`:
```javascript
if (password === 'your_secure_password') {
```

### Update Portfolio Data
Edit JSON files in `ai-agent/data/`:
- `profile.json` - Personal info
- `skills.json` - Add/remove skills
- `projects.json` - Add portfolio projects
- `certificates.json` - Add certifications

---

## Support & Contacts

- **Email:** rathodmilan216@gmail.com
- **Phone:** +91 9327599254
- **GitHub:** https://github.com/Milan07xt
- **LinkedIn:** https://linkedin.com/in/milan-rathod07

---

## License

© 2026 Milan Rathod. All rights reserved.
