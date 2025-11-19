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
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    from langchain_core.messages import SystemMessage
    from langchain_core.tools import tool
    from langchain_community.vectorstores import Chroma
    from langchain_core.documents import Document
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
# VECTOR DATABASE (RAG SYSTEM)
# ============================================================================

# Initialize ChromaDB vector store
vector_db = None
RAG_AVAILABLE = False

try:
    if AGENTS_AVAILABLE:
        embeddings = OpenAIEmbeddings()
        db_path = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
        
        vector_db = Chroma(
            embedding_function=embeddings,
            persist_directory=db_path,
            collection_name="research_documents"
        )
        
        # Add some example documents about AI and research topics
        sample_docs = [
            Document(
                page_content="Artificial Intelligence (AI) has revolutionized various industries including healthcare, finance, and technology. Machine learning algorithms can now process vast amounts of data and make predictions with unprecedented accuracy.",
                metadata={"source": "AI Overview", "topic": "artificial_intelligence"}
            ),
            Document(
                page_content="Large Language Models (LLMs) like GPT-4 have demonstrated remarkable capabilities in natural language understanding, generation, and reasoning. They are trained on massive datasets and can perform tasks ranging from translation to code generation.",
                metadata={"source": "LLM Guide", "topic": "language_models"}
            ),
            Document(
                page_content="Multi-agent systems enable autonomous agents to collaborate and solve complex problems. Each agent has specific roles and can communicate with others to achieve common goals. LangGraph is a powerful framework for orchestrating such systems.",
                metadata={"source": "Multi-Agent Systems", "topic": "agent_systems"}
            ),
            Document(
                page_content="Vector databases like ChromaDB enable efficient similarity search and retrieval of documents based on semantic meaning. They use embeddings to represent text in high-dimensional space, making it possible to find relevant information quickly.",
                metadata={"source": "Vector DB Guide", "topic": "vector_databases"}
            ),
            Document(
                page_content="Research methodologies in AI involve systematic approaches to problem-solving, including data collection, experimentation, analysis, and peer review. Good research practices ensure reproducibility and validity of results.",
                metadata={"source": "Research Methods", "topic": "research_methodology"}
            )
        ]
        
        # Check if collection is empty and add documents
        try:
            existing_count = vector_db._collection.count()
            if existing_count == 0:
                vector_db.add_documents(sample_docs)
                print(f"✅ Vector DB initialized with {len(sample_docs)} sample documents")
            else:
                print(f"✅ Vector DB loaded with {existing_count} existing documents")
        except:
            # If collection doesn't exist, add documents
            vector_db.add_documents(sample_docs)
            print(f"✅ Vector DB created with {len(sample_docs)} sample documents")
        
        RAG_AVAILABLE = True
        
except Exception as e:
    RAG_AVAILABLE = False
    print(f"⚠️  Vector DB not available: {e}")
    print("💡 Continuing without RAG capabilities")


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

    @tool
    def rag_search(query: str, max_results: int = 3) -> List[dict]:
        """Search internal vector database (RAG) for relevant documents"""
        if not RAG_AVAILABLE or vector_db is None:
            print("    ⚠️ RAG not available")
            return []
        
        try:
            print(f"    📚 RAG search: '{query}'")
            
            # Similarity search in vector database
            docs_with_scores = vector_db.similarity_search_with_relevance_scores(
                query, 
                k=max_results
            )
            
            formatted_results = []
            for doc, score in docs_with_scores:
                formatted_results.append({
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "Internal KB"),
                    "title": f"{doc.metadata.get('topic', 'Document')} (Score: {score:.2f})",
                    "type": "rag",
                    "relevance_score": score
                })
            
            print(f"    ✅ RAG results: {len(formatted_results)} documents")
            return formatted_results
            
        except Exception as e:
            print(f"    ❌ RAG search error: {e}")
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
    """Real Retrieval Agent using RAG + DuckDuckGo + Wikipedia"""
    if not AGENTS_AVAILABLE:
        return []
    
    # Limit to first 2 queries for speed
    queries_to_search = search_queries[:2]
    print(f"📊 Searching {len(queries_to_search)} queries")
    print(f"🔍 Using RAG (Vector DB) + DuckDuckGo + Wikipedia")
    
    all_rag_results = []
    all_web_results = []
    all_wiki_results = []
    
    for i, query in enumerate(queries_to_search):
        print(f"  🔎 Query {i+1}/{len(queries_to_search)}: {query}")
        
        # 1. Search RAG (Vector Database) FIRST - Internal knowledge
        if RAG_AVAILABLE:
            try:
                print(f"    📚 Searching Vector DB (RAG)...")
                rag_results = rag_search.invoke({"query": query, "max_results": 2})
                if rag_results:
                    all_rag_results.extend(rag_results)
                    print(f"    ✅ RAG: {len(rag_results)} documents")
            except Exception as e:
                print(f"    ❌ RAG error: {e}")
        
        # 2. Search DuckDuckGo - External web sources
        try:
            print(f"    🌐 Searching DuckDuckGo...")
            web_results = web_search.invoke({"query": query, "max_results": 2})
            if web_results:
                all_web_results.extend(web_results)
                print(f"    ✅ Web: {len(web_results)} results")
            else:
                print(f"    ⚠️ DuckDuckGo: No results")
        except Exception as e:
            print(f"    ❌ DuckDuckGo error: {e}")
        
        # 3. Search Wikipedia - External knowledge base
        try:
            print(f"    📖 Searching Wikipedia...")
            wiki_results = wikipedia_search.invoke({"query": query, "max_results": 2})
            if wiki_results:
                all_wiki_results.extend(wiki_results)
                print(f"    ✅ Wikipedia: {len(wiki_results)} results")
        except Exception as e:
            print(f"    ❌ Wikipedia error: {e}")
        
        # Small delay between queries
        if i < len(queries_to_search) - 1:
            time.sleep(0.5)
    
    # Combine all sources (RAG first for priority)
    all_results = all_rag_results + all_web_results + all_wiki_results
    print(f"📊 Total: {len(all_rag_results)} RAG + {len(all_web_results)} web + {len(all_wiki_results)} wiki = {len(all_results)} results")
    
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

