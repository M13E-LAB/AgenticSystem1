# 🚀 Installation & Setup Guide

## Quick Start Guide for Multi-Agent Research Assistant

**Time required:** 10 minutes ⏱️

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- ✅ Langfuse account ([Sign up here](https://cloud.langfuse.com))

---

## 🔧 Step-by-Step Installation

### Step 1: Install Backend Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi uvicorn langgraph langchain langfuse ...
```

---

### Step 2: Configure Environment Variables

```bash
# Create .env file from template
cp ../env_example.txt .env

# Edit .env and add your keys
nano .env  # or use your favorite editor
```

**Required values in `.env`:**
```bash
OPENAI_API_KEY=sk-...your-key...
LANGFUSE_PUBLIC_KEY=pk-lf-...your-key...
LANGFUSE_SECRET_KEY=sk-lf-...your-key...
LANGFUSE_HOST=https://cloud.langfuse.com
```

**How to get Langfuse keys:**
1. Go to https://cloud.langfuse.com
2. Sign up (free)
3. Create a project
4. Go to Settings → API Keys
5. Copy Public Key and Secret Key

---

### Step 3: Test Backend

```bash
# Still in backend/ directory with venv activated
python main.py
```

**Expected output:**
```
✅ Langfuse monitoring enabled
✅ Multi-agent system imports successful
✅ Writer/Critic agents with Langfuse monitoring enabled
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**✅ If you see this, backend is ready!**

Leave this terminal running.

---

### Step 4: Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install
```

**Expected output:**
```
added 234 packages in 15s
```

---

### Step 5: Start Frontend

```bash
# Still in frontend/ directory
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**✅ If you see this, frontend is ready!**

---

### Step 6: Access the Application

Open your browser and go to:

**🌐 http://localhost:3000**

You should see the Dashboard with:
- Multi-Agent Research Assistant title
- Start New Research button
- Statistics panel

---

## 🧪 Test the System

### Run Your First Research

1. Click **"Start New Research"**
2. Enter a question, for example:
   ```
   What are the latest trends in artificial intelligence?
   ```
3. Click **"Start Research"**
4. Watch the pipeline in action:
   - 🎯 Planner analyzing...
   - 🔍 Retrieval searching...
   - 👤 Waiting for your approval...
5. **Review the sources** found
6. **Select** which sources to keep (or click "Approve All")
7. Click **"Approve & Continue"**
8. Watch the final steps:
   - ✍️ Writer creating briefing...
   - 🔍 Critic reviewing...
9. **Read your final briefing** with citations!

---

## 📊 Verify Langfuse Integration

1. Go to https://cloud.langfuse.com
2. Open your project
3. Click **"Traces"** in sidebar
4. You should see traces for:
   - Planner Agent
   - Writer Agent
   - Critic Agent

**Take a screenshot for your project report!**

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Make sure venv is activated
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

---

**Problem:** `⚠️ OPENAI_API_KEY not set`

**Solution:**
1. Check `backend/.env` exists
2. Verify key is correct (starts with `sk-`)
3. No extra spaces or quotes

---

**Problem:** `⚠️ Langfuse not available`

**Solution:**
1. Check Langfuse keys in `.env`
2. Keys should start with `pk-lf-` and `sk-lf-`
3. Restart backend after adding keys

---

### Frontend won't start

**Problem:** `Error: Cannot find module`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

**Problem:** `Port 3000 already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

---

### No search results

**Problem:** DuckDuckGo returns no results

**Solution:**
- This is normal sometimes
- System automatically falls back to Wikipedia
- Try a different query

---

### WebSocket not connecting

**Problem:** Progress page doesn't update

**Solution:**
1. Check backend is running on port 8000
2. Check browser console for errors
3. Refresh the page

---

## 🔄 Restart Everything

If something goes wrong, restart both services:

```bash
# Terminal 1 (Backend)
cd backend
source venv/bin/activate
python main.py

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

---

## 📂 File Locations

**Backend:**
- Code: `backend/services/`
- Database: `backend/checkpoints.db` (auto-created)
- Config: `backend/.env`

**Frontend:**
- Code: `frontend/src/`
- Build: `frontend/dist/` (after `npm run build`)

---

## 🎯 What to Do After Installation

1. ✅ Run at least one complete research
2. ✅ Verify Langfuse traces appear
3. ✅ Take dashboard screenshot
4. ✅ Test human approval flow
5. ✅ Read the architecture diagram
6. ✅ Prepare your demo presentation

---

## 📚 Next Steps

- Read `ARCHITECTURE_DIAGRAM.md` to understand the system
- Read `PROJECT_COMPLIANCE_REPORT.md` for evaluation criteria
- Check `LANGFUSE_SETUP.md` for monitoring details
- Review `README.md` for full documentation

---

## ✅ Installation Checklist

Before considering installation complete:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can create a research
- [ ] Sources are retrieved
- [ ] Can approve sources
- [ ] Briefing is generated
- [ ] Langfuse shows traces
- [ ] Screenshot taken

**If all checked, you're ready to demo!** 🎉

---

## 🆘 Still Having Issues?

1. **Check logs:**
   - Backend: Look at terminal running `python main.py`
   - Frontend: Check browser console (F12)

2. **Verify versions:**
   ```bash
   python --version  # Should be 3.9+
   node --version    # Should be 18+
   ```

3. **Fresh install:**
   ```bash
   # Backend
   rm -rf backend/venv
   cd backend && python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   rm -rf frontend/node_modules
   cd frontend && npm install
   ```

---

## 🎓 For Evaluators

To quickly demo this project:

```bash
# Clone/download project
cd "Agentic AI"

# Terminal 1
cd backend
source venv/bin/activate
python main.py

# Terminal 2
cd frontend
npm run dev

# Browser
open http://localhost:3000
```

**Demo time:** 5 minutes  
**Full evaluation:** 15 minutes

---

**Installation complete!** Ready to use your Multi-Agent Research Assistant 🚀

For technical details, see `ARCHITECTURE_DIAGRAM.md`

