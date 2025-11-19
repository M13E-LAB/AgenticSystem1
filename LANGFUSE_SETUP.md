# 📊 Langfuse Monitoring Setup Guide

## 🎯 Why Langfuse?

Langfuse is **required** for Project A to provide:
- ✅ Real-time LLM call tracing
- ✅ Performance metrics
- ✅ Token usage tracking
- ✅ Error monitoring
- ✅ Cost analysis

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Langfuse Account

1. Go to https://cloud.langfuse.com
2. Click "Sign up for free"
3. Create your account (email + password or Google/GitHub)

### Step 2: Create a Project

1. Once logged in, click "New Project"
2. Name it: `Multi-Agent Research Assistant`
3. Click "Create"

### Step 3: Get API Keys

1. In your project, go to **Settings** → **API Keys**
2. You'll see:
   - **Public Key**: `pk-lf-...`
   - **Secret Key**: `sk-lf-...` (click "Show" to reveal)
3. Copy both keys

### Step 4: Configure Backend

1. Open `backend/.env` (or create it from `env_example.txt`)
2. Add your Langfuse credentials:

```bash
# Langfuse Monitoring
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key-here
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key-here
LANGFUSE_HOST=https://cloud.langfuse.com
```

3. Save the file

### Step 5: Install Dependencies

```bash
cd backend
source venv/bin/activate
pip install langfuse>=2.0.0
```

### Step 6: Restart Backend

```bash
python main.py
```

You should see:
```
✅ Langfuse monitoring enabled
✅ Multi-agent system imports successful
```

---

## 📊 View Your Traces

### After Running a Research:

1. Go to https://cloud.langfuse.com
2. Open your project
3. Click on **Traces** in the sidebar
4. You'll see all LLM calls with:
   - Agent name (Planner, Writer, Critic)
   - Execution time
   - Token usage
   - Input/output
   - Cost estimation

---

## 🔍 What Gets Tracked?

### Planner Agent
- Query analysis
- Search plan generation
- Token usage

### Retrieval Agent
- Web search calls
- Wikipedia lookups
- Source deduplication

### Writer Agent
- Briefing generation
- Citation formatting
- Content synthesis

### Critic Agent
- Quality review
- Content improvement
- Final edits

---

## 📸 Dashboard Screenshot (for Project Report)

### How to Take Screenshot:

1. Run a complete research workflow
2. Go to Langfuse dashboard
3. Click on your latest trace
4. Take a screenshot showing:
   - List of traces
   - Detailed view with spans
   - Performance metrics

**Include this screenshot in your project report!**

---

## 🛠️ Troubleshooting

### Error: "Langfuse not available"

**Check:**
1. Are the keys in `.env` correct?
2. Did you restart the backend after adding keys?
3. Is `langfuse>=2.0.0` installed?

```bash
pip list | grep langfuse
# Should show: langfuse 2.x.x
```

### No traces appearing in dashboard

**Solutions:**
1. Wait 5-10 seconds after research completes
2. Refresh the Langfuse dashboard
3. Check backend logs for errors
4. Verify LANGFUSE_HOST is correct

### "Invalid API key" error

**Solutions:**
1. Double-check keys in `.env`
2. No extra spaces before/after keys
3. Keys should start with `pk-lf-` and `sk-lf-`

---

## 💡 Optional: Self-Hosted Langfuse

If you prefer to self-host:

```bash
# Using Docker
docker run -d \
  --name langfuse \
  -p 3000:3000 \
  langfuse/langfuse:latest
```

Then update `.env`:
```bash
LANGFUSE_HOST=http://localhost:3000
```

---

## 📋 Verification Checklist

Before submitting your project, verify:

- [ ] Langfuse account created
- [ ] API keys added to `.env`
- [ ] Backend shows "✅ Langfuse monitoring enabled"
- [ ] At least one research completed
- [ ] Traces visible in Langfuse dashboard
- [ ] Screenshot taken for report
- [ ] All 5 agents appear in traces (Planner, Retrieval, Writer, Critic)

---

## 🎓 For Project Evaluation

Your evaluator will look for:
1. **Langfuse integration** ✅ (callback handlers)
2. **Trace visibility** ✅ (dashboard screenshot)
3. **Proper spans** ✅ (each agent traced)
4. **Metadata tagging** ✅ (step, query info)

**All of this is already implemented in your code!** Just add the keys and run it. 🚀

---

## 📞 Support

- **Langfuse Docs**: https://langfuse.com/docs
- **Discord**: https://discord.gg/langfuse
- **GitHub**: https://github.com/langfuse/langfuse

---

**Setup time: ~5 minutes** ⏱️

**Required for Project A submission** ✅

