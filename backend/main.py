"""
🚀 Multi-Agent Research Assistant - FastAPI Backend

This API wraps the Jupyter notebook multi-agent system and provides
RESTful endpoints and WebSocket support for real-time updates.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import asyncio
import json
from datetime import datetime
import uuid

# Import our multi-agent system
from services.research_service import ResearchService
from services.websocket_manager import WebSocketManager

# Initialize FastAPI app
app = FastAPI(
    title="Multi-Agent Research Assistant API",
    description="API for orchestrating multi-agent research workflows with human-in-the-loop approval",
    version="2.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React/Vite dev servers (5173 is primary)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
research_service = ResearchService()
websocket_manager = WebSocketManager()


# ============================================================================
# 📊 MODELS - Request/Response schemas
# ============================================================================

class ResearchRequest(BaseModel):
    """Request model for creating a new research"""
    query: str
    max_sources: int = 10
    search_depth: str = "normal"  # normal, deep
    enable_web: bool = True
    enable_wikipedia: bool = True

class ResearchResponse(BaseModel):
    """Response model for research creation"""
    research_id: str
    status: str
    message: str

class SourceApproval(BaseModel):
    """Model for approving/rejecting sources"""
    research_id: str
    approved_source_ids: List[int]

class ResearchStatus(BaseModel):
    """Model for research status"""
    research_id: str
    status: str
    current_step: str
    progress: Dict[str, Any]
    sources: Optional[List[Dict]] = None
    briefing: Optional[str] = None


# ============================================================================
# 🏠 ROOT & HEALTH
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Multi-Agent Research Assistant API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "architecture": "/api/architecture"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "multi-agent-research-api"
    }


# ============================================================================
# 📚 ARCHITECTURE EXPLANATION ENDPOINTS
# ============================================================================

@app.get("/api/architecture")
async def get_architecture():
    """
    Get detailed explanation of the backend architecture
    This endpoint serves as documentation for the frontend
    """
    return {
        "overview": {
            "description": "Multi-agent system using LangGraph for orchestration",
            "agents_count": 5,
            "workflow_type": "Sequential with human-in-the-loop"
        },
        "agents": [
            {
                "name": "Planner Agent",
                "role": "Analyzes user request and creates research plan",
                "input": "User research query",
                "output": "Research plan with search queries",
                "llm": "GPT-4o-mini",
                "icon": "🎯"
            },
            {
                "name": "Retrieval Agent",
                "role": "Searches web and Wikipedia for information",
                "input": "Search queries from Planner",
                "output": "List of sources with content",
                "tools": ["DuckDuckGo Search", "Wikipedia API"],
                "icon": "🔍"
            },
            {
                "name": "Human Approval",
                "role": "Human reviews and approves sources",
                "input": "List of found sources",
                "output": "Approved sources list",
                "type": "interrupt",
                "icon": "👤"
            },
            {
                "name": "Writer Agent",
                "role": "Creates professional briefing with citations",
                "input": "Approved sources",
                "output": "Draft briefing with citations",
                "llm": "GPT-4o-mini",
                "icon": "✍️"
            },
            {
                "name": "Critic Agent",
                "role": "Reviews and improves the briefing",
                "input": "Draft briefing",
                "output": "Final polished briefing",
                "llm": "GPT-4o-mini",
                "icon": "🔍"
            }
        ],
        "workflow": {
            "type": "Sequential Pipeline",
            "steps": [
                "User Request → Planner Agent",
                "Planner Agent → Retrieval Agent",
                "Retrieval Agent → Human Approval (INTERRUPT)",
                "Human Approval → Writer Agent",
                "Writer Agent → Critic Agent",
                "Critic Agent → Final Briefing"
            ],
            "state_management": "LangGraph StateGraph with MemorySaver checkpointer",
            "persistence": "In-memory with checkpoint support"
        },
        "technologies": {
            "orchestration": "LangGraph",
            "llm_framework": "LangChain",
            "llm_provider": "OpenAI (GPT-4o-mini)",
            "search_tools": ["DuckDuckGo", "Wikipedia"],
            "state_management": "LangGraph StateGraph",
            "backend_api": "FastAPI",
            "websocket": "FastAPI WebSocket"
        },
        "features": {
            "human_in_the_loop": "Interactive source approval",
            "fallback_mechanism": "Wikipedia fallback when DuckDuckGo fails",
            "rate_limiting": "1 second delay between searches",
            "error_handling": "Comprehensive try-catch with logging",
            "real_time_updates": "WebSocket for progress updates"
        }
    }

@app.get("/api/architecture/flow")
async def get_workflow_flow():
    """Get detailed workflow flow for visualization"""
    return {
        "nodes": [
            {"id": "start", "label": "User Request", "type": "input"},
            {"id": "planner", "label": "Planner Agent", "type": "agent"},
            {"id": "retrieval", "label": "Retrieval Agent", "type": "agent"},
            {"id": "human", "label": "Human Approval", "type": "interrupt"},
            {"id": "writer", "label": "Writer Agent", "type": "agent"},
            {"id": "critic", "label": "Critic Agent", "type": "agent"},
            {"id": "end", "label": "Final Briefing", "type": "output"}
        ],
        "edges": [
            {"from": "start", "to": "planner"},
            {"from": "planner", "to": "retrieval"},
            {"from": "retrieval", "to": "human"},
            {"from": "human", "to": "writer"},
            {"from": "writer", "to": "critic"},
            {"from": "critic", "to": "end"}
        ]
    }


# ============================================================================
# 🔬 RESEARCH ENDPOINTS
# ============================================================================

@app.post("/api/research/create", response_model=ResearchResponse)
async def create_research(request: ResearchRequest):
    """
    Create a new research request
    This starts the multi-agent workflow
    """
    try:
        research_id = str(uuid.uuid4())
        
        # Start research in background
        asyncio.create_task(
            research_service.start_research(
                research_id=research_id,
                query=request.query,
                max_sources=request.max_sources,
                websocket_manager=websocket_manager
            )
        )
        
        return ResearchResponse(
            research_id=research_id,
            status="started",
            message="Research started successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/research/{research_id}/status")
async def get_research_status(research_id: str):
    """Get current status of a research"""
    try:
        status = research_service.get_status(research_id)
        if not status:
            raise HTTPException(status_code=404, detail="Research not found")
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/research/{research_id}/approve-sources")
async def approve_sources(research_id: str, approval: SourceApproval):
    """Approve sources and continue research"""
    try:
        result = await research_service.approve_sources(
            research_id=research_id,
            approved_ids=approval.approved_source_ids,
            websocket_manager=websocket_manager
        )
        return {"status": "approved", "message": "Sources approved, continuing research"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/research/{research_id}/briefing")
async def get_briefing(research_id: str):
    """Get the final briefing"""
    try:
        briefing = research_service.get_briefing(research_id)
        if not briefing:
            raise HTTPException(status_code=404, detail="Briefing not found or not ready")
        return briefing
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/research/list")
async def list_researches():
    """List all researches"""
    return research_service.list_all()


# ============================================================================
# 🔌 WEBSOCKET FOR REAL-TIME UPDATES
# ============================================================================

@app.websocket("/ws/{research_id}")
async def websocket_endpoint(websocket: WebSocket, research_id: str):
    """
    WebSocket endpoint for real-time updates
    Sends progress updates as the research progresses
    """
    await websocket_manager.connect(websocket, research_id)
    try:
        while True:
            # Keep connection alive and wait for messages
            data = await websocket.receive_text()
            # Echo back for now (can be used for commands later)
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, research_id)


# ============================================================================
# 🎯 STARTUP & SHUTDOWN
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Multi-Agent Research API starting...")
    print("📊 Initializing research service...")
    await research_service.initialize()
    print("✅ API ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down Multi-Agent Research API...")
    await research_service.cleanup()
    print("✅ Cleanup complete")


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Multi-Agent Research API on port 8002...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=False,  # Disabled auto-reload for stability
        log_level="info"
    )

