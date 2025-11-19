"""
🔬 Research Service - Core business logic for multi-agent research

This service wraps the Jupyter notebook multi-agent system and provides
async methods for the API to use.
"""

import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import sys
import os

# Add parent directory to path to import from notebook
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Import real agents
from services.agents_integration import execute_research, is_agents_available, get_langfuse_handler, is_langfuse_available

# Import for Writer and Critic agents
try:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage
    
    # Initialize LLM with Langfuse if available
    langfuse_handler = get_langfuse_handler()
    callbacks = [langfuse_handler] if langfuse_handler else []
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, callbacks=callbacks)
    LLM_AVAILABLE = True
    
    if is_langfuse_available():
        print("✅ Writer/Critic agents with Langfuse monitoring enabled")
    else:
        print("⚠️ Writer/Critic agents without Langfuse monitoring")
except Exception as e:
    LLM_AVAILABLE = False
    print(f"⚠️ LLM not available for Writer/Critic agents: {e}")


class ResearchService:
    """Service for managing research workflows"""
    
    def __init__(self):
        self.active_researches: Dict[str, Dict[str, Any]] = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize the service and load the multi-agent system"""
        if self.initialized:
            return
            
        try:
            # TODO: Import and initialize the multi-agent system from notebook
            # For now, we'll use mock data
            print("📊 Initializing multi-agent system...")
            self.initialized = True
            print("✅ Multi-agent system ready")
        except Exception as e:
            print(f"❌ Error initializing: {e}")
            raise
    
    async def start_research(
        self,
        research_id: str,
        query: str,
        max_sources: int,
        websocket_manager
    ):
        """Start a new research workflow"""
        
        # Initialize research state
        self.active_researches[research_id] = {
            "id": research_id,
            "query": query,
            "status": "running",
            "current_step": "planner",
            "started_at": datetime.now().isoformat(),
            "progress": {
                "planner": {"status": "running", "progress": 0},
                "retrieval": {"status": "pending", "progress": 0},
                "human_approval": {"status": "pending", "progress": 0},
                "writer": {"status": "pending", "progress": 0},
                "critic": {"status": "pending", "progress": 0}
            },
            "sources": [],
            "briefing": None
        }
        
        # Send initial status
        await websocket_manager.send_update(research_id, {
            "type": "status_update",
            "step": "planner",
            "message": "🎯 Planner Agent: Analyzing your request...",
            "progress": self.active_researches[research_id]
        })
        
        # Simulate workflow (replace with actual multi-agent calls)
        await asyncio.sleep(2)
        
        # Planner complete
        self.active_researches[research_id]["progress"]["planner"] = {
            "status": "completed",
            "progress": 100
        }
        self.active_researches[research_id]["current_step"] = "retrieval"
        
        await websocket_manager.send_update(research_id, {
            "type": "status_update",
            "step": "retrieval",
            "message": "🔍 Retrieval Agent: Searching for sources...",
            "progress": self.active_researches[research_id]
        })
        
        # Use REAL agents to search
        try:
            print("🤖 Using REAL multi-agent system...")
            research_results = await execute_research(query)
            
            # Format sources with IDs
            real_sources = []
            for idx, source in enumerate(research_results["sources"]):
                source["id"] = idx
                real_sources.append(source)
            
            self.active_researches[research_id]["sources"] = real_sources
            print(f"✅ Real search completed: {len(real_sources)} sources found")
            
        except Exception as e:
            print(f"❌ Error in real search: {e}")
            # Fallback to mock sources
            mock_sources = [
                {
                    "id": 0,
                    "type": "web",
                    "title": "Search results unavailable",
                    "source": "https://example.com",
                    "content": f"Could not perform real search. Error: {str(e)}"
                }
            ]
            self.active_researches[research_id]["sources"] = mock_sources
        self.active_researches[research_id]["progress"]["retrieval"] = {
            "status": "completed",
            "progress": 100
        }
        self.active_researches[research_id]["current_step"] = "human_approval"
        self.active_researches[research_id]["status"] = "waiting_approval"
        
        # Get the actual sources that were found
        found_sources = self.active_researches[research_id]["sources"]
        
        await websocket_manager.send_update(research_id, {
            "type": "sources_ready",
            "step": "human_approval",
            "message": f"👤 Found {len(found_sources)} sources! Waiting for your approval...",
            "sources": found_sources,  # Send the REAL sources, not mock_sources
            "progress": self.active_researches[research_id]
        })
    
    async def approve_sources(
        self,
        research_id: str,
        approved_ids: List[int],
        websocket_manager
    ):
        """Continue research after source approval"""
        
        if research_id not in self.active_researches:
            raise ValueError("Research not found")
        
        research = self.active_researches[research_id]
        
        # Filter approved sources
        approved_sources = [
            src for src in research["sources"]
            if src["id"] in approved_ids
        ]
        
        research["approved_sources"] = approved_sources
        research["status"] = "running"
        research["current_step"] = "writer"
        research["progress"]["human_approval"] = {"status": "completed", "progress": 100}
        
        await websocket_manager.send_update(research_id, {
            "type": "status_update",
            "step": "writer",
            "message": f"✍️ Writer Agent: Creating briefing from {len(approved_sources)} sources...",
            "progress": research
        })
        
        # REAL Writer Agent - Generate briefing with GPT
        print(f"✍️ Writer Agent: Generating briefing from {len(approved_sources)} sources...")
        draft_briefing = await self._generate_briefing(research["query"], approved_sources)
        
        research["progress"]["writer"] = {"status": "completed", "progress": 100}
        research["current_step"] = "critic"
        
        await websocket_manager.send_update(research_id, {
            "type": "status_update",
            "step": "critic",
            "message": "🔍 Critic Agent: Reviewing and improving briefing...",
            "progress": research
        })
        
        # REAL Critic Agent - Improve the briefing
        print("🔍 Critic Agent: Reviewing and improving...")
        final_briefing = await self._improve_briefing(research["query"], draft_briefing)
        
        research["progress"]["critic"] = {"status": "completed", "progress": 100}
        research["status"] = "completed"
        research["current_step"] = "completed"
        research["briefing"] = {
            "content": final_briefing,
            "metadata": {
                "sources_used": len(approved_sources),
                "generated_at": datetime.now().isoformat(),
                "word_count": len(final_briefing.split()),
                "citations": len(approved_sources)
            }
        }
        research["completed_at"] = datetime.now().isoformat()
        
        await websocket_manager.send_update(research_id, {
            "type": "completed",
            "step": "completed",
            "message": "✅ Research completed successfully!",
            "briefing": research["briefing"],
            "progress": research
        })
        
        return research["briefing"]
    
    def get_status(self, research_id: str) -> Optional[Dict]:
        """Get current status of a research"""
        return self.active_researches.get(research_id)
    
    def get_briefing(self, research_id: str) -> Optional[Dict]:
        """Get final briefing"""
        research = self.active_researches.get(research_id)
        if research and research.get("briefing"):
            return research["briefing"]
        return None
    
    def list_all(self) -> List[Dict]:
        """List all researches"""
        return [
            {
                "id": r["id"],
                "query": r["query"],
                "status": r["status"],
                "started_at": r["started_at"],
                "completed_at": r.get("completed_at")
            }
            for r in self.active_researches.values()
        ]
    
    async def _generate_briefing(self, query: str, sources: List[dict]) -> str:
        """Generate briefing using Writer Agent (GPT)"""
        if not LLM_AVAILABLE:
            return "LLM not available. Cannot generate briefing."
        
        # Prepare sources text
        sources_text = ""
        for i, source in enumerate(sources):
            sources_text += f"\n[{i+1}] {source['type'].upper()}: {source.get('title', 'No title')}\n"
            sources_text += f"Source: {source.get('source', 'Unknown')}\n"
            sources_text += f"Content: {source['content'][:500]}...\n"
        
        # Writer prompt
        prompt = f"""You are a professional research writer. Create a comprehensive briefing based on the provided sources.

USER REQUEST: {query}

SOURCES:
{sources_text}

REQUIREMENTS:
1. Create a well-structured briefing with clear sections
2. Include proper citations using [1], [2], etc. format
3. Synthesize information from multiple sources
4. Maintain professional tone
5. Include a reference list at the end

STRUCTURE:
# Research Briefing: [Title]

## Executive Summary

## Main Findings

## Detailed Analysis

## Conclusions

## References

Write the complete briefing now:"""
        
        try:
            # Add Langfuse metadata
            config = {}
            if is_langfuse_available():
                config["callbacks"] = [get_langfuse_handler()]
                config["metadata"] = {"step": "writer", "query": query}
            
            response = llm.invoke([SystemMessage(content=prompt)], config=config)
            return response.content
        except Exception as e:
            print(f"❌ Error generating briefing: {e}")
            return f"Error generating briefing: {str(e)}"
    
    async def _improve_briefing(self, query: str, draft: str) -> str:
        """Improve briefing using Critic Agent (GPT)"""
        if not LLM_AVAILABLE:
            return draft
        
        prompt = f"""You are a senior editor reviewing a research briefing. Analyze the draft and improve it.

ORIGINAL REQUEST: {query}

DRAFT BRIEFING:
{draft}

REVIEW CRITERIA:
1. Accuracy and completeness
2. Clear structure and flow
3. Proper citations
4. Professional language
5. Addresses the original request

Provide the IMPROVED VERSION of the briefing (not just comments):"""
        
        try:
            # Add Langfuse metadata
            config = {}
            if is_langfuse_available():
                config["callbacks"] = [get_langfuse_handler()]
                config["metadata"] = {"step": "critic", "query": query}
            
            response = llm.invoke([SystemMessage(content=prompt)], config=config)
            return response.content
        except Exception as e:
            print(f"❌ Error improving briefing: {e}")
            return draft  # Return draft if improvement fails
    
    async def cleanup(self):
        """Cleanup resources"""
        self.active_researches.clear()
        self.initialized = False

