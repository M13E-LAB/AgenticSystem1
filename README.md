# 🚀 Multi-Agent Research Assistant - Full Stack Application

A complete full-stack application with modern web interface for a multi-agent research system that creates intelligent briefings.

## 📋 Overview

This system uses **5 specialized agents** orchestrated by LangGraph to produce professional research briefings with citations and human validation.

### 🎯 Architecture

```
User Request → Planner → Retrieval → Human Approval → Writer → Critic → Final Briefing
```

**Agents:**
- 🎯 **Planner**: Analyzes the request and creates a research plan
- 🔍 **Retrieval**: Web search (DuckDuckGo) + Wikipedia
- 👤 **Human Approval**: User validation of sources
- ✍️ **Writer**: Briefing composition with citations
- 🔍 **Critic**: Content review and improvement

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API Key

### 1. Backend Configuration

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API keys (see env_example.txt)
nano .env  # Add OPENAI_API_KEY and LANGFUSE keys
```

**Required environment variables in `.env`:**
```bash
OPENAI_API_KEY=sk-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 2. Frontend Configuration

```bash
cd frontend

# Install dependencies
npm install
```

### 3. Start the Application

**Option A: Automatic script**
```bash
chmod +x start_app.sh
./start_app.sh
```

**Option B: Manual (2 terminals)**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- 🎨 **Frontend**: http://localhost:3000
- 📊 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
Agentic AI/
├── backend/
│   ├── main.py                    # FastAPI API
│   ├── services/
│   │   ├── agents_integration.py  # Multi-agent system (LangGraph)
│   │   ├── research_service.py    # Business logic
│   │   └── websocket_manager.py   # Real-time WebSocket
│   ├── requirements.txt           # Python dependencies
│   └── venv/                      # Virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Home page
│   │   │   ├── NewResearch.jsx         # Create research
│   │   │   ├── ResearchProgress.jsx    # Real-time tracking
│   │   │   └── Architecture.jsx        # System explanation
│   │   ├── App.jsx                # Main component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── start_app.sh              # Startup script
├── env_example.txt           # Configuration template
├── README.md                 # This file
└── FULLSTACK_README.md       # Detailed technical documentation
```

---

## 🎨 Features

### ✅ Implemented

- ✅ **Complete REST API** (FastAPI)
- ✅ **WebSocket** for real-time updates
- ✅ **Modern React interface** and responsive
- ✅ **Visual agent pipeline**
- ✅ **Interactive source approval**
- ✅ **Web search** (DuckDuckGo + Wikipedia)
- ✅ **Professional citations** in briefings
- ✅ **Robust error handling**
- ✅ **Live architecture documentation**

### 🔄 User Workflow

1. **Create a research** → Form with options
2. **Track progress** → Animated pipeline in real-time
3. **Approve sources** → Interactive selection
4. **Get briefing** → Professional document with citations

---

## 📡 API Endpoints

### Main endpoints:

- `POST /api/research/create` - Create a research
- `GET /api/research/:id/status` - Get status
- `POST /api/research/:id/approve-sources` - Approve sources
- `GET /api/research/list` - List all research
- `GET /api/architecture` - System documentation
- `WS /ws/:id` - WebSocket for real-time

📚 Complete interactive documentation: http://localhost:8000/docs

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern REST API
- **Uvicorn** - ASGI server
- **LangGraph** - Multi-agent orchestration
- **LangChain** - LLM framework
- **OpenAI** - GPT-4o-mini
- **DuckDuckGo** - Web search
- **Wikipedia** - Knowledge base

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **TailwindCSS** - Modern styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **WebSocket** - Real-time

---

## 💡 Usage Examples

### Via Web Interface

1. Go to http://localhost:3000
2. Click "Start New Research"
3. Enter your question (e.g., "Analyze the evolution of electric vehicle market")
4. Configure options if needed
5. Track progress in real-time
6. Approve found sources
7. Receive your professional briefing

### Via API

```bash
# Create a research
curl -X POST http://localhost:8000/api/research/create \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Evolution of AI in healthcare",
    "max_sources": 10,
    "enable_web": true,
    "enable_wikipedia": true
  }'

# Get status
curl http://localhost:8000/api/research/{research_id}/status

# Approve sources
curl -X POST http://localhost:8000/api/research/{research_id}/approve-sources \
  -H "Content-Type: application/json" \
  -d '{
    "approved_source_ids": [0, 1, 2, 3, 4]
  }'
```

---

## 🚀 Possible Future Enhancements

- 📄 Professional PDF export
- 💾 Database (PostgreSQL)
- 🔐 User authentication
- 📊 Analytics and dashboards
- 🌐 Multi-language support
- 🎨 Dark mode
- 📱 Mobile application
- 🧪 Automated tests (Jest, Pytest)
- 🐳 Docker & Docker Compose
- ☁️ Cloud deployment (AWS/GCP/Azure)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check that virtual environment is activated
source backend/venv/bin/activate

# Reinstall dependencies
pip install -r backend/requirements.txt

# Check OpenAI key
cat backend/.env
```

### Frontend won't start
```bash
# Delete node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WebSocket won't connect
- Check that backend is running on port 8000
- Check proxy configuration in `frontend/vite.config.js`
- Check browser console for errors

### No search results
- Check your internet connection
- DuckDuckGo may have rate limits → System will use Wikipedia as fallback
- Check backend logs for detailed errors

---

## 📞 Documentation & Support

### 📚 Complete documentation:
- **`INSTALLATION_GUIDE.md`** - Step-by-step installation guide ⭐ **START HERE**
- **`ARCHITECTURE_DIAGRAM.md`** - Diagrams and detailed architecture
- **`PROJECT_COMPLIANCE_REPORT.md`** - Project A requirements compliance
- **`LANGFUSE_SETUP.md`** - Langfuse monitoring configuration
- **`FULLSTACK_README.md`** - Advanced technical documentation
- **`env_example.txt`** - Environment variables template
- **http://localhost:3000/architecture** - Real-time visual explanation

### 🎯 Quick start:
1. Follow `INSTALLATION_GUIDE.md` (10 minutes)
2. Read `ARCHITECTURE_DIAGRAM.md` to understand the system
3. Check `PROJECT_COMPLIANCE_REPORT.md` for evaluation

---

## 🎓 Project Information

**Course:** Multi-Agent AI Systems - Final Project  
**Project:** Project A - Multi-Agent Research & Briefing Assistant  
**Requirements Compliance:** 100% ✅ (7/7 core requirements COMPLETE)

**Key Features:**
- ✅ Multi-agent workflow (5 agents)
- ✅ LangGraph routing with StateGraph
- ✅ **Vector Database RAG** (ChromaDB + OpenAI Embeddings) 🆕
- ✅ External search tools (DuckDuckGo + Wikipedia)
- ✅ Human-in-the-loop approval system
- ✅ SqliteSaver persistence
- ✅ Langfuse monitoring with full traces
- ✅ Full-stack web application (bonus)

**🎉 100% Project A Compliance Achieved!**

See `PROJECT_COMPLIANCE_REPORT.md` and `VECTOR_DATABASE_GUIDE.md` for details.

---

## 📄 License

MIT License - Open source

---

**Built with ❤️ for intelligent research automation**

🚀 Ready to transform your research into professional briefings!
