import { useState, useEffect } from 'react'
import { Network, Zap, Database, Globe, User, FileText, CheckCircle, ArrowRight, Code, Terminal } from 'lucide-react'
import axios from 'axios'

export default function Architecture() {
  const [architecture, setArchitecture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedCode, setExpandedCode] = useState(null)

  useEffect(() => {
    fetchArchitecture()
  }, [])

  const fetchArchitecture = async () => {
    try {
      const response = await axios.get('/api/architecture')
      setArchitecture(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching architecture:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!architecture) {
    return <div className="text-center text-red-600">Failed to load architecture data</div>
  }

  const agentIcons = {
    '🎯': <FileText className="h-6 w-6" />,
    '🔍': <Globe className="h-6 w-6" />,
    '👤': <User className="h-6 w-6" />,
    '✍️': <FileText className="h-6 w-6" />,
  }

  const codeExamples = {
    planner: `def planner_agent_real(user_request: str) -> dict:
    """Real Planner Agent using GPT"""
    planning_prompt = f"""
    You are a research planner. Analyze this request and 
    create a detailed research plan.
    
    User Request: {user_request}
    
    Create a JSON response with:
    1. "topic": Main research topic
    2. "scope": Research scope and boundaries  
    3. "search_queries": List of 3-5 specific search queries
    4. "structure": Suggested briefing structure
    
    Respond ONLY with valid JSON.
    """
    
    response = llm.invoke([SystemMessage(content=planning_prompt)])
    plan = json.loads(response.content)
    return plan`,

    retrieval: `@tool
def web_search(query: str, max_results: int = 5) -> List[dict]:
    """Search the web using DuckDuckGo"""
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
    
    formatted_results = []
    for result in results:
        formatted_results.append({
            "content": result.get("body", ""),
            "source": result.get("href", ""),
            "title": result.get("title", ""),
            "type": "web"
        })
    
    return formatted_results

def retrieval_agent_real(search_queries: List[str]) -> List[dict]:
    """Real Retrieval Agent using DuckDuckGo + Wikipedia"""
    all_results = []
    
    for query in search_queries[:2]:  # Limit for speed
        web_results = web_search.invoke({"query": query})
        wiki_results = wikipedia_search.invoke({"query": query})
        all_results.extend(web_results + wiki_results)
    
    return unique_sources[:15]`,

    human_approval: `@app.post("/api/research/{research_id}/approve-sources")
async def approve_sources(research_id: str, approval: SourceApproval):
    """Approve sources and continue research"""
    result = await research_service.approve_sources(
        research_id=research_id,
        approved_ids=approval.approved_source_ids,
        websocket_manager=websocket_manager
    )
    
    # Continue to Writer Agent with approved sources
    return {"status": "approved", "message": "Continuing research"}`,

    writer: `async def _generate_briefing(self, query: str, sources: List[dict]) -> str:
    """Generate briefing using Writer Agent (GPT)"""
    # Prepare sources text
    sources_text = ""
    for i, source in enumerate(sources):
        sources_text += f"[{i+1}] {source['type']}: {source['title']}\\n"
        sources_text += f"Content: {source['content'][:500]}...\\n"
    
    prompt = f"""Create a comprehensive briefing based on sources.

USER REQUEST: {query}

SOURCES:
{sources_text}

STRUCTURE:
# Research Briefing: [Title]
## Executive Summary
## Main Findings
## Detailed Analysis
## Conclusions
## References"""
    
    response = llm.invoke([SystemMessage(content=prompt)])
    return response.content`,

    critic: `async def _improve_briefing(self, query: str, draft: str) -> str:
    """Improve briefing using Critic Agent (GPT)"""
    prompt = f"""You are a senior editor reviewing a research briefing.
    
ORIGINAL REQUEST: {query}

DRAFT BRIEFING:
{draft}

REVIEW CRITERIA:
1. Accuracy and completeness
2. Clear structure and flow
3. Proper citations
4. Professional language
5. Addresses the original request

Provide the IMPROVED VERSION of the briefing:"""
    
    response = llm.invoke([SystemMessage(content=prompt)])
    return response.content`,

    websocket: `class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, research_id: str):
        await websocket.accept()
        if research_id not in self.active_connections:
            self.active_connections[research_id] = []
        self.active_connections[research_id].append(websocket)
    
    async def send_update(self, research_id: str, message: dict):
        """Send real-time update to connected clients"""
        if research_id in self.active_connections:
            for connection in self.active_connections[research_id]:
                await connection.send_json(message)`,

    state_management: `class ResearchState(TypedDict, total=False):
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

# LangGraph workflow
workflow = StateGraph(ResearchState)
workflow.add_node("planner", planner_agent)
workflow.add_node("retrieval", retrieval_agent)
workflow.add_node("writer", writer_agent)
workflow.add_node("critic", critic_agent)

# Add edges with human-in-the-loop
workflow.add_edge(START, "planner")
workflow.add_edge("planner", "retrieval")
workflow.add_edge("retrieval", "writer")  # Human approval here
workflow.add_edge("writer", "critic")
workflow.add_edge("critic", END)`
  }

  const toggleCode = (key) => {
    setExpandedCode(expandedCode === key ? null : key)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Network className="h-8 w-8 text-primary-600" />
          <h2 className="text-3xl font-bold text-gray-900">Backend Architecture</h2>
        </div>
        <p className="text-gray-600">
          {architecture.overview.description}
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">{architecture.overview.agents_count}</p>
            <p className="text-sm text-gray-600">Specialized Agents</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">Sequential</p>
            <p className="text-sm text-gray-600">Workflow Type</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">LangGraph</p>
            <p className="text-sm text-gray-600">Orchestration</p>
          </div>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Workflow Pipeline</h3>
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {architecture.agents.map((agent, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center min-w-[180px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  agent.type === 'interrupt' 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-primary-100 text-primary-600'
                }`}>
                  <span className="text-3xl">{agent.icon}</span>
                </div>
                <p className="mt-2 font-semibold text-sm text-center">{agent.name}</p>
                <p className="text-xs text-gray-500 text-center mt-1">{agent.role.substring(0, 40)}...</p>
              </div>
              {index < architecture.agents.length - 1 && (
                <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Agents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Agent Details</h3>
        <div className="space-y-4">
          {architecture.agents.map((agent, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  agent.type === 'interrupt'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-primary-100 text-primary-600'
                }`}>
                  <span className="text-2xl">{agent.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{agent.name}</h4>
                  <p className="text-gray-600 mt-1">{agent.role}</p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Input:</span>
                      <p className="text-gray-600">{agent.input}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Output:</span>
                      <p className="text-gray-600">{agent.output}</p>
                    </div>
                  </div>
                  {agent.llm && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        LLM: {agent.llm}
                      </span>
                    </div>
                  )}
                  {agent.tools && (
                    <div className="mt-2">
                      {agent.tools.map((tool, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  {agent.type === 'interrupt' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Human-in-the-Loop (INTERRUPT)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Flow Diagram */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Network className="h-7 w-7 text-primary-600" />
          <h3 className="text-2xl font-bold text-gray-900">System Communication Flow</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Visual diagram showing how each component communicates with others
        </p>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 overflow-x-auto">
          {/* Frontend Layer */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm">
                FRONTEND LAYER
              </span>
            </div>
            <div className="flex justify-center gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-300 w-48">
                <div className="text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-sm">React App</p>
                  <p className="text-xs text-gray-500 mt-1">User Interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Arrows */}
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
                <div className="bg-yellow-100 px-3 py-1 rounded text-xs font-medium text-yellow-800 my-2">
                  HTTP REST API
                </div>
                <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
                <div className="bg-green-100 px-3 py-1 rounded text-xs font-medium text-green-800 my-2">
                  WebSocket (Real-time)
                </div>
                <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
              </div>
            </div>
          </div>

          {/* Backend API Layer */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg font-bold text-sm">
                BACKEND API LAYER
              </span>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-purple-300 w-48">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold text-sm">FastAPI</p>
                  <p className="text-xs text-gray-500 mt-1">REST Endpoints</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-teal-300 w-48">
                <div className="text-center">
                  <Database className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                  <p className="font-semibold text-sm">WebSocket Manager</p>
                  <p className="text-xs text-gray-500 mt-1">Real-time Updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Communication to Services */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-4">
              <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
              <div className="bg-blue-100 px-3 py-1 rounded text-xs font-medium text-blue-800">
                Internal Calls
              </div>
              <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
            </div>
          </div>

          {/* Service Layer */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm">
                SERVICE LAYER
              </span>
            </div>
            <div className="flex justify-center gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-indigo-300 w-56">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold text-sm">Research Service</p>
                  <p className="text-xs text-gray-500 mt-1">Orchestrates workflow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Communication to Multi-Agent System */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-4">
              <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
              <div className="bg-pink-100 px-3 py-1 rounded text-xs font-medium text-pink-800">
                Agent Invocations
              </div>
              <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
            </div>
          </div>

          {/* Multi-Agent System */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-sm">
                MULTI-AGENT SYSTEM (LangGraph)
              </span>
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-3 border-2 border-blue-400 w-36">
                <div className="text-center">
                  <span className="text-2xl">🎯</span>
                  <p className="font-semibold text-xs mt-1">Planner</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-green-600 mt-6" />
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-3 border-2 border-green-400 w-36">
                <div className="text-center">
                  <span className="text-2xl">🔍</span>
                  <p className="font-semibold text-xs mt-1">Retrieval</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-yellow-600 mt-6" />
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-3 border-2 border-yellow-400 w-36">
                <div className="text-center">
                  <span className="text-2xl">👤</span>
                  <p className="font-semibold text-xs mt-1">Human</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-purple-600 mt-6" />
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-3 border-2 border-purple-400 w-36">
                <div className="text-center">
                  <span className="text-2xl">✍️</span>
                  <p className="font-semibold text-xs mt-1">Writer</p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-red-600 mt-6" />
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-3 border-2 border-red-400 w-36">
                <div className="text-center">
                  <span className="text-2xl">🔍</span>
                  <p className="font-semibold text-xs mt-1">Critic</p>
                </div>
              </div>
            </div>
          </div>

          {/* Communication to External Services */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-4">
              <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
              <div className="bg-orange-100 px-3 py-1 rounded text-xs font-medium text-orange-800">
                API Calls
              </div>
              <ArrowRight className="h-6 w-6 text-gray-600 transform rotate-90" />
            </div>
          </div>

          {/* External Services */}
          <div>
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm">
                EXTERNAL SERVICES
              </span>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-orange-300 w-44">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">🤖</span>
                  <p className="font-semibold text-sm">OpenAI GPT</p>
                  <p className="text-xs text-gray-500 mt-1">LLM Processing</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-orange-300 w-44">
                <div className="text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold text-sm">DuckDuckGo</p>
                  <p className="text-xs text-gray-500 mt-1">Web Search</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-2 border-orange-300 w-44">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold text-sm">Wikipedia</p>
                  <p className="text-xs text-gray-500 mt-1">Knowledge Base</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <h4 className="font-semibold text-sm text-gray-700 mb-3 text-center">Communication Legend</h4>
            <div className="flex justify-center gap-6 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-yellow-400"></div>
                <span className="text-gray-600">REST API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-green-400"></div>
                <span className="text-gray-600">WebSocket</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-blue-400"></div>
                <span className="text-gray-600">Internal Call</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-pink-400"></div>
                <span className="text-gray-600">Agent Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-orange-400"></div>
                <span className="text-gray-600">External API</span>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Request Flow (Frontend → Backend)
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>User submits query via React UI</li>
              <li>POST /api/research/create to FastAPI</li>
              <li>FastAPI creates research task</li>
              <li>Research Service invokes agents</li>
              <li>LangGraph orchestrates agent workflow</li>
            </ol>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Response Flow (Backend → Frontend)
            </h4>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Agent completes step</li>
              <li>WebSocket Manager sends update</li>
              <li>React receives real-time update</li>
              <li>UI updates progress display</li>
              <li>Final briefing displayed to user</li>
            </ol>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Flow
            </h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• <strong>State:</strong> Managed by LangGraph</li>
              <li>• <strong>Sources:</strong> Stored in Research Service</li>
              <li>• <strong>Progress:</strong> Broadcast via WebSocket</li>
              <li>• <strong>Briefing:</strong> Generated by Writer Agent</li>
            </ul>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              External API Calls
            </h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• <strong>OpenAI:</strong> Planner, Writer, Critic agents</li>
              <li>• <strong>DuckDuckGo:</strong> Web search results</li>
              <li>• <strong>Wikipedia:</strong> Knowledge articles</li>
              <li>• <strong>Rate Limiting:</strong> Built-in delays</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backend Code Examples */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Code className="h-7 w-7 text-primary-600" />
          <h3 className="text-2xl font-bold text-gray-900">Backend Implementation Code</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Real backend code examples to understand how each component works
        </p>

        {/* Planner Agent Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('planner')}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-primary-600" />
              <span className="font-semibold text-gray-900">🎯 Planner Agent - Python Code</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'planner' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'planner' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.planner}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> The Planner Agent uses GPT-4o-mini to analyze the user query 
                and create a structured research plan with optimized search queries.
              </p>
            </div>
          )}
        </div>

        {/* Retrieval Agent Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('retrieval')}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">🔍 Retrieval Agent - Web Search</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'retrieval' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'retrieval' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.retrieval}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> Uses DuckDuckGo and Wikipedia to search for sources. 
                Results are formatted and deduplicated before being presented to the user.
              </p>
            </div>
          )}
        </div>

        {/* Human Approval Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('human_approval')}
            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-gray-900">👤 Human Approval - API Endpoint</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'human_approval' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'human_approval' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.human_approval}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> FastAPI endpoint that receives source approval. 
                This is the "Human-in-the-Loop" interaction point that pauses the workflow.
              </p>
            </div>
          )}
        </div>

        {/* Writer Agent Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('writer')}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-gray-900">✍️ Writer Agent - Briefing Generation</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'writer' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'writer' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.writer}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> The Writer Agent compiles approved sources and 
                uses GPT to create a professional structured briefing with citations.
              </p>
            </div>
          )}
        </div>

        {/* Critic Agent Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('critic')}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-gray-900">🔍 Critic Agent - Improvement</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'critic' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'critic' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.critic}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> The Critic Agent reviews the briefing and improves it 
                by checking accuracy, structure, citations, and overall quality.
              </p>
            </div>
          )}
        </div>

        {/* WebSocket Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('websocket')}
            className="w-full px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-teal-600" />
              <span className="font-semibold text-gray-900">🔌 WebSocket Manager - Real-Time Updates</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'websocket' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'websocket' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.websocket}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> Manages WebSocket connections to send real-time updates 
                to the frontend during workflow execution.
              </p>
            </div>
          )}
        </div>

        {/* State Management Code */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleCode('state_management')}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">🏗️ LangGraph - Workflow Orchestration</span>
            </div>
            <span className="text-gray-500">{expandedCode === 'state_management' ? '▼' : '▶'}</span>
          </button>
          {expandedCode === 'state_management' && (
            <div className="p-4 bg-gray-900">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{codeExamples.state_management}</code>
              </pre>
              <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-800 rounded">
                💡 <strong>Explanation:</strong> LangGraph orchestrates the workflow by managing shared state 
                between agents. The StateGraph defines nodes (agents) and edges (transitions).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Technologies Stack */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(architecture.technologies).map(([key, value]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase">{key.replace(/_/g, ' ')}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(architecture.features).map(([key, value]) => (
            <div key={key} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{key.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-sm text-gray-600">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Workflow Execution Steps</h3>
        <div className="space-y-3">
          {architecture.workflow.steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">State Management:</span> {architecture.workflow.state_management}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold">Persistence:</span> {architecture.workflow.persistence}
          </p>
        </div>
      </div>

      {/* API Information */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">API Integration</h3>
        <p className="text-gray-700 mb-4">
          This frontend communicates with the backend through a RESTful API and WebSocket connection:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary-600" />
            <span className="font-medium">POST /api/research/create</span> - Start new research
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary-600" />
            <span className="font-medium">GET /api/research/:id/status</span> - Get research status
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary-600" />
            <span className="font-medium">POST /api/research/:id/approve-sources</span> - Approve sources
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            <span className="font-medium">WS /ws/:id</span> - Real-time progress updates
          </div>
        </div>
      </div>
    </div>
  )
}

