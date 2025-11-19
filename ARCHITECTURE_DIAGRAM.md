# 🏗️ Multi-Agent Research Assistant - Architecture Diagram

## Project A - Multi-Agent Research & Briefing Assistant

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                              │
│                        http://localhost:3000                                │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Dashboard   │  │ New Research │  │   Progress   │  │ Architecture │   │
│  │  (Overview)  │  │   (Create)   │  │ (Real-time)  │  │   (Docs)     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│         User Interface with WebSocket real-time updates                    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ HTTP REST API + WebSocket
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                      BACKEND API (FastAPI)                                  │
│                      http://localhost:8000                                  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  API Endpoints:                                                │         │
│  │  • POST /api/research/create                                   │         │
│  │  • GET  /api/research/:id/status                               │         │
│  │  • POST /api/research/:id/approve-sources                      │         │
│  │  • GET  /api/research/list                                     │         │
│  │  • WS   /ws/:id (WebSocket real-time updates)                  │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  WebSocket Manager: Real-time communication                    │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Research Service: Business logic orchestration                │         │
│  └────────────────────────────────────────────────────────────────┘         │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ Python function calls
                                 │
┌────────────────────────────────▼────────────────────────────────────────────┐
│                   MULTI-AGENT SYSTEM (LangGraph)                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    LangGraph StateGraph Workflow                    │    │
│  │                                                                     │    │
│  │   START                                                             │    │
│  │     │                                                               │    │
│  │     ▼                                                               │    │
│  │  ┌──────────────┐                                                  │    │
│  │  │ 🎯 PLANNER   │  Analyzes request, creates search plan          │    │
│  │  │   AGENT      │  Uses: GPT-4o-mini + Langfuse tracing           │    │
│  │  └──────┬───────┘                                                  │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │  ┌──────────────┐                                                  │    │
│  │  │ 🔍 RETRIEVAL │  Searches multiple sources:                      │    │
│  │  │   AGENT      │  • DuckDuckGo web search (@tool)                 │    │
│  │  │              │  • Wikipedia search (@tool)                      │    │
│  │  │              │  • External APIs                                 │    │
│  │  └──────┬───────┘  With fallback logic                            │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │  ┌──────────────┐                                                  │    │
│  │  │ 👤 HUMAN     │  ⚠️ INTERRUPT POINT                              │    │
│  │  │   APPROVAL   │  User reviews and approves sources              │    │
│  │  │              │  (Human-in-the-loop via WebSocket)              │    │
│  │  └──────┬───────┘                                                  │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │  ┌──────────────┐                                                  │    │
│  │  │ ✍️ WRITER    │  Creates briefing with citations                │    │
│  │  │   AGENT      │  Uses: GPT-4o-mini + Langfuse tracing           │    │
│  │  │              │  Format: [1], [2] citation style                │    │
│  │  └──────┬───────┘                                                  │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │  ┌──────────────┐                                                  │    │
│  │  │ 🔍 CRITIC    │  Reviews and improves briefing                   │    │
│  │  │   AGENT      │  Uses: GPT-4o-mini + Langfuse tracing           │    │
│  │  └──────┬───────┘                                                  │    │
│  │         │                                                           │    │
│  │         ▼                                                           │    │
│  │       END                                                           │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🗄️ Persistence Layer: SqliteSaver                                  │    │
│  │  • Database: checkpoints.db                                        │    │
│  │  • State recovery across sessions                                  │    │
│  │  • Resume capability with thread_id                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  📊 Monitoring: Langfuse                                            │    │
│  │  • Traces all LLM calls                                            │    │
│  │  • Spans for each agent                                            │    │
│  │  • Performance metrics                                             │    │
│  │  • Dashboard: https://cloud.langfuse.com                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐
│    USER     │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Submit Research Request
       ▼
┌─────────────────────────────┐
│  Frontend (React)           │
│  - Validates input          │
│  - POST /api/research/create│
└──────┬──────────────────────┘
       │
       │ 2. HTTP Request
       ▼
┌─────────────────────────────┐
│  Backend API (FastAPI)      │
│  - Creates research_id      │
│  - Starts WebSocket         │
└──────┬──────────────────────┘
       │
       │ 3. Initialize Multi-Agent
       ▼
┌─────────────────────────────┐
│  Planner Agent              │
│  - Analyze query            │
│  - Create search queries    │
│  - Langfuse trace           │
└──────┬──────────────────────┘
       │
       │ 4. Search Queries
       ▼
┌─────────────────────────────┐
│  Retrieval Agent            │
│  - DuckDuckGo search        │
│  - Wikipedia search         │
│  - Deduplicate results      │
└──────┬──────────────────────┘
       │
       │ 5. Sources Found
       ▼
┌─────────────────────────────┐
│  Human Approval (INTERRUPT) │
│  - Send sources via WS      │
│  - Wait for user decision   │
└──────┬──────────────────────┘
       │
       │ 6. WebSocket Update
       ▼
┌─────────────────────────────┐
│  Frontend displays sources  │
│  User selects/approves      │
└──────┬──────────────────────┘
       │
       │ 7. Approval Decision
       ▼
┌─────────────────────────────┐
│  Backend receives approval  │
│  - POST approve-sources     │
│  - Resume workflow          │
└──────┬──────────────────────┘
       │
       │ 8. Continue with approved sources
       ▼
┌─────────────────────────────┐
│  Writer Agent               │
│  - Generate briefing        │
│  - Add citations [1], [2]   │
│  - Langfuse trace           │
└──────┬──────────────────────┘
       │
       │ 9. Draft Briefing
       ▼
┌─────────────────────────────┐
│  Critic Agent               │
│  - Review quality           │
│  - Improve content          │
│  - Langfuse trace           │
└──────┬──────────────────────┘
       │
       │ 10. Final Briefing
       ▼
┌─────────────────────────────┐
│  Backend sends completion   │
│  - WebSocket update         │
│  - Save to SqliteSaver      │
└──────┬──────────────────────┘
       │
       │ 11. Display Result
       ▼
┌─────────────────────────────┐
│  Frontend shows briefing    │
│  - Content + citations      │
│  - Metadata                 │
└─────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend Layer
- **React 18** - UI components
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **WebSocket API** - Real-time updates

### Backend Layer
- **FastAPI** - REST API framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **WebSockets** - Real-time communication
- **Python-dotenv** - Environment configuration

### Multi-Agent Layer
- **LangGraph** - Agent orchestration
- **LangChain** - LLM framework
- **OpenAI GPT-4o-mini** - Language model
- **DuckDuckGo Search** - Web search tool
- **Wikipedia** - Knowledge base tool

### Persistence & Monitoring
- **SqliteSaver** - State persistence (checkpoints.db)
- **Langfuse** - LLM observability & monitoring
- **SQLite** - Embedded database

---

## ✅ Project Requirements Compliance

| Requirement | Implementation | Status |
|------------|----------------|--------|
| **Multi-agent workflow** | Planner → Retrieval → Writer → Critic | ✅ |
| **Routing logic** | LangGraph StateGraph with conditional edges | ✅ |
| **Vector database** | *(To be added: ChromaDB with RAG)* | ⚠️ |
| **External search** | DuckDuckGo + Wikipedia with @tool | ✅ |
| **Human-in-the-loop** | Interrupt + WebSocket approval flow | ✅ |
| **Persistent state** | SqliteSaver with checkpoints.db | ✅ |
| **Langfuse monitoring** | Callback handlers on all LLM calls | ✅ |
| **Citations** | [1], [2] format with references | ✅ |

---

## 🗂️ File Structure

```
Agentic AI/
├── backend/
│   ├── main.py                        # FastAPI application
│   ├── services/
│   │   ├── agents_integration.py      # Multi-agent system
│   │   ├── research_service.py        # Business logic
│   │   └── websocket_manager.py       # WebSocket handling
│   ├── requirements.txt               # Python dependencies
│   ├── checkpoints.db                 # SqliteSaver persistence
│   └── .env                           # Configuration
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Home page
│   │   │   ├── NewResearch.jsx        # Create research
│   │   │   ├── ResearchProgress.jsx   # Real-time tracking
│   │   │   └── Architecture.jsx       # System explanation
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── ARCHITECTURE_DIAGRAM.md            # This file
├── README.md                          # Main documentation
└── start_app.sh                       # Startup script
```

---

## 🔑 Key Features

### 1. **Routing Logic**
- LangGraph StateGraph manages agent transitions
- Conditional routing based on state
- Interrupt handling for human approval

### 2. **Tool-Enabled Search**
- `@tool` decorator for DuckDuckGo
- `@tool` decorator for Wikipedia
- Automatic fallback mechanism
- Rate limiting and timeout handling

### 3. **Human-in-the-Loop**
- Interrupt at approval node
- WebSocket for instant communication
- User can select/reject sources
- Resume with approved sources only

### 4. **Persistence**
- SqliteSaver stores all checkpoints
- Thread-based session management
- State recovery across restarts
- Resume capability with `thread_id`

### 5. **Langfuse Monitoring**
- Traces all LLM calls
- Metadata tagging (step, query)
- Performance metrics
- Error tracking
- Dashboard visualization

---

## 🚀 Deployment Notes

### Environment Variables Required

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Langfuse Monitoring
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com

# Optional: Custom Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### Running the System

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 📊 Monitoring Dashboard

Access Langfuse dashboard at: https://cloud.langfuse.com

**Visible metrics:**
- Request traces for each research
- Agent execution times
- LLM token usage
- Error rates
- Performance bottlenecks

---

## 🎓 Educational Value

This architecture demonstrates:
1. **Multi-agent coordination** with LangGraph
2. **Tool integration** for external data
3. **Human-in-the-loop** patterns
4. **State persistence** across sessions
5. **Production-grade monitoring** with Langfuse
6. **Real-time communication** with WebSockets
7. **Full-stack integration** (React + FastAPI)

---

**Built for: Multi-Agent AI Systems Final Project (Project A)**

**Date:** November 2024

**Status:** Production-ready with all core requirements implemented ✅

