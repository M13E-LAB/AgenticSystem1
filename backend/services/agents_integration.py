"""
 Integration du système multi-agents réel

"""

import os
import sys
from typing import List, Dict, Any
from datetime import datetime

# Configuration OpenAI
from dotenv import load_dotenv
load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    print("⚠️  OPENAI_API_KEY not set. Please set it in .env file or environment")

# Langfuse monitoring
try:
    from langfuse.callback import CallbackHandler
    langfuse_handler = CallbackHandler(
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
    )
    LANGFUSE_AVAILABLE = True
    print("✅ Langfuse monitoring enabled")
except Exception as e:
    LANGFUSE_AVAILABLE = False
    langfuse_handler = None
    print(f"⚠️  Langfuse not available: {e}")

try:
    # Imports pour le système multi-agents
    from typing import TypedDict, Optional, Annotated
    from langgraph.graph import StateGraph, START, END
    from langgraph.types import interrupt, Command
    from langgraph.checkpoint.sqlite import SqliteSaver  # SqliteSaver for persistence
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage
    from langchain_core.tools import tool
    from duckduckgo_search import DDGS  # Correct import!
    import wikipedia
    import time
    
    AGENTS_AVAILABLE = True
    print("✅ Multi-agent system imports successful")
    
except ImportError as e:
    AGENTS_AVAILABLE = False
    print(f"⚠️  Multi-agent system not available: {e}")
    print("💡 Using mock data instead")


# ============================================================================
# STATE DEFINITION
# ============================================================================

class ResearchState(TypedDict, total=False):
    user_request: str
    research_plan: dict
    search_queries: List[str]
    web_results: List[dict]
    all_sources: List[dict]
    draft_briefing: str
    final_briefing: str
    human_feedback: str
    approved_sources: List[dict]
    current_step: str
    timestamp: str


# ============================================================================
# SEARCH TOOLS
# ============================================================================

if AGENTS_AVAILABLE:
    @tool
    def web_search(query: str, max_results: int = 5) -> List[dict]:
        """Search the web using DuckDuckGo"""
        try:
            print(f"    🌐 DuckDuckGo search: '{query}'")
            
            # Add timeout to avoid hanging
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError("Search timeout")
            
            # Set 10 second timeout
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(10)
            
            try:
                with DDGS() as ddgs:
                    results = list(ddgs.text(query, max_results=max_results))
                signal.alarm(0)  # Cancel alarm
            except TimeoutError:
                signal.alarm(0)
                print(f"    ⏱️ DuckDuckGo timeout, trying Wikipedia...")
                return []
            
            print(f"    ✅ Raw results: {len(results)}")
                
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "content": result.get("body", ""),
                    "source": result.get("href", ""),
                    "title": result.get("title", ""),
                    "type": "web"
                })
            
            print(f"    ✅ Formatted results: {len(formatted_results)}")
            return formatted_results
        except Exception as e:
            print(f"    ❌ Web search error: {e}")
            import traceback
            traceback.print_exc()
            return []

    @tool
    def wikipedia_search(query: str, max_results: int = 3) -> List[dict]:
        """Search Wikipedia for information"""
        try:
            search_results = wikipedia.search(query, results=max_results)
            
            formatted_results = []
            for title in search_results:
                try:
                    page = wikipedia.page(title)
                    content = page.content[:500] + "..." if len(page.content) > 500 else page.content
                    
                    formatted_results.append({
                        "content": content,
                        "source": page.url,
                        "title": page.title,
                        "type": "wikipedia"
                    })
                except Exception as e:
                    continue
                    
            return formatted_results
        except Exception as e:
            print(f"Wikipedia search error: {e}")
            return []

    # Initialize LLM with Langfuse callback if available
    callbacks = [langfuse_handler] if LANGFUSE_AVAILABLE and langfuse_handler else []
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, callbacks=callbacks)


# ============================================================================
# AGENTS
# ============================================================================

def planner_agent_real(user_request: str) -> dict:
    """Real Planner Agent using GPT"""
    if not AGENTS_AVAILABLE:
        return {
            "topic": user_request,
            "search_queries": [user_request]
        }
    
    planning_prompt = f"""
    You are a research planner. Analyze this request and create a detailed research plan.
    
    User Request: {user_request}
    
    Create a JSON response with:
    1. "topic": Main research topic
    2. "scope": Research scope and boundaries  
    3. "search_queries": List of 3-5 specific search queries
    4. "structure": Suggested briefing structure
    
    Respond ONLY with valid JSON.
    """
    
    try:
        # Add Langfuse tracing
        callbacks = [langfuse_handler] if LANGFUSE_AVAILABLE and langfuse_handler else []
        response = llm.invoke([SystemMessage(content=planning_prompt)], config={"callbacks": callbacks})
        import json
        plan = json.loads(response.content)
        return plan
    except:
        # Fallback
        return {
            "topic": user_request,
            "scope": "Research analysis",
            "search_queries": [user_request, f"{user_request} trends", f"{user_request} analysis"],
            "structure": ["Overview", "Analysis", "Conclusions"]
        }


def retrieval_agent_real(search_queries: List[str]) -> List[dict]:
    """Real Retrieval Agent using DuckDuckGo + Wikipedia"""
    if not AGENTS_AVAILABLE:
        return []
    
    # Limit to first 2 queries for speed
    queries_to_search = search_queries[:2]
    print(f"📊 Searching {len(queries_to_search)} queries")
    print(f"🌐 Using DuckDuckGo + Wikipedia")
    
    all_web_results = []
    all_wiki_results = []
    
    for i, query in enumerate(queries_to_search):
        print(f"  🔎 Query {i+1}/{len(queries_to_search)}: {query}")
        
        # Try DuckDuckGo first
        try:
            print(f"    🌐 Searching DuckDuckGo...")
            web_results = web_search.invoke({"query": query, "max_results": 2})
            if web_results:
                all_web_results.extend(web_results)
                print(f"    ✅ Web: {len(web_results)} results")
            else:
                print(f"    ⚠️ DuckDuckGo: No results, trying Wikipedia...")
        except Exception as e:
            print(f"    ❌ DuckDuckGo error: {e}, trying Wikipedia...")
        
        # Also search Wikipedia
        try:
            print(f"    📚 Searching Wikipedia...")
            wiki_results = wikipedia_search.invoke({"query": query, "max_results": 2})
            if wiki_results:
                all_wiki_results.extend(wiki_results)
                print(f"    ✅ Wikipedia: {len(wiki_results)} results")
        except Exception as e:
            print(f"    ❌ Wikipedia error: {e}")
        
        # Small delay between queries
        if i < len(queries_to_search) - 1:
            time.sleep(0.5)
    
    # Combine and deduplicate
    all_results = all_web_results + all_wiki_results
    print(f"📊 Total: {len(all_web_results)} web + {len(all_wiki_results)} wiki = {len(all_results)} results")
    
    unique_sources = []
    seen_content = set()
    
    for source in all_results:
        content_hash = hash(source["content"][:100])
        if content_hash not in seen_content:
            unique_sources.append(source)
            seen_content.add(content_hash)
    
    return unique_sources[:15]


# ============================================================================
# PUBLIC API
# ============================================================================

async def execute_research(user_request: str) -> dict:
    """
    Execute the real multi-agent research workflow
    
    Returns:
        dict: Research results with sources
    """
    print(f"🎯 Starting REAL research for: {user_request}")
    
    # Step 1: Planner
    print("🎯 Planner Agent: Analyzing request...")
    plan = planner_agent_real(user_request)
    search_queries = plan.get("search_queries", [user_request])
    print(f"✅ Plan created with {len(search_queries)} queries")
    
    # Step 2: Retrieval
    print("🔍 Retrieval Agent: Searching...")
    sources = retrieval_agent_real(search_queries)
    print(f"✅ Found {len(sources)} unique sources")
    
    return {
        "plan": plan,
        "sources": sources,
        "queries": search_queries
    }


def is_agents_available() -> bool:
    """Check if real agents are available"""
    return AGENTS_AVAILABLE


def get_sqlite_checkpointer():
    """Get SqliteSaver checkpointer for persistence"""
    db_path = os.path.join(os.path.dirname(__file__), "..", "checkpoints.db")
    return SqliteSaver.from_conn_string(db_path)


def get_langfuse_handler():
    """Get Langfuse callback handler if available"""
    return langfuse_handler if LANGFUSE_AVAILABLE else None


def is_langfuse_available() -> bool:
    """Check if Langfuse monitoring is available"""
    return LANGFUSE_AVAILABLE

