import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, Loader, FileText, Download } from 'lucide-react'
import axios from 'axios'

export default function ResearchProgress() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [research, setResearch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSources, setSelectedSources] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const ws = useRef(null)

  useEffect(() => {
    // Initial status fetch
    fetchStatus()

    // Setup WebSocket
    connectWebSocket()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [id])

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/${id}`
    
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.current.onmessage = (event) => {
      const update = JSON.parse(event.data)
      console.log('WebSocket update:', update)
      
      if (update.type === 'status_update' || update.type === 'sources_ready' || update.type === 'completed') {
        // Update research state with progress
        const updatedResearch = update.progress || {}
        
        // If sources are provided, add them to research state
        if (update.sources) {
          updatedResearch.sources = update.sources
          console.log('✅ Sources received:', update.sources.length)
        }
        
        // If briefing is provided, add it to research state
        if (update.briefing) {
          updatedResearch.briefing = update.briefing
          console.log('✅ Briefing received')
        }
        
        setResearch(updatedResearch)
        
        // Auto-select all sources when ready
        if (update.type === 'sources_ready' && update.sources) {
          setSelectedSources(update.sources.map(s => s.id))
          console.log('✅ Auto-selected sources:', update.sources.length)
        }
        
        // Mark as completed when done
        if (update.type === 'completed') {
          setIsCompleted(true)
          console.log('✅ Research completed!')
        }
      }
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
    }
  }

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`/api/research/${id}/status`)
      setResearch(response.data)
      
      // Auto-select all sources if waiting for approval
      if (response.data.status === 'waiting_approval' && response.data.sources) {
        setSelectedSources(response.data.sources.map(s => s.id))
      }
      
      // Check if already completed
      if (response.data.status === 'completed') {
        setIsCompleted(true)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching status:', error)
      setLoading(false)
    }
  }

  const handleApproveSources = async () => {
    try {
      await axios.post(`/api/research/${id}/approve-sources`, {
        research_id: id,
        approved_source_ids: selectedSources
      })
    } catch (error) {
      console.error('Error approving sources:', error)
      alert('Failed to approve sources. Please try again.')
    }
  }

  const toggleSource = (sourceId) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  const getStepStatus = (stepName) => {
    if (!research || !research.progress) return 'pending'
    const step = research.progress[stepName]
    return step?.status || 'pending'
  }

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'running':
        return <Loader className="h-6 w-6 text-primary-600 animate-spin" />
      default:
        return <Clock className="h-6 w-6 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!research) {
    return <div className="text-center text-red-600">Research not found</div>
  }

  const steps = [
    { name: 'planner', label: 'Planner Agent', icon: '🎯', description: 'Analyzing request and creating plan' },
    { name: 'retrieval', label: 'Retrieval Agent', icon: '🔍', description: 'Searching for sources' },
    { name: 'human_approval', label: 'Human Approval', icon: '👤', description: 'Reviewing sources' },
    { name: 'writer', label: 'Writer Agent', icon: '✍️', description: 'Creating briefing' },
    { name: 'critic', label: 'Critic Agent', icon: '🔍', description: 'Reviewing and improving' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{research.query}</h2>
        <p className="text-gray-600">Research ID: {research.id}</p>
      </div>

      {/* Success Message */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-1">Research Completed Successfully! 🎉</h3>
              <p className="text-green-700">Your professional briefing is ready. Scroll down to view the results.</p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Research Pipeline</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.name)
            const isActive = research.current_step === step.name

            return (
              <div key={step.name} className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                isActive ? 'bg-primary-50 border-2 border-primary-300' : 'bg-gray-50'
              }`}>
                <div className="flex-shrink-0">
                  {getStepIcon(status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.label}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Source Approval */}
      {research.status === 'waiting_approval' && research.sources && research.sources.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Approve Sources</h3>
          <p className="text-gray-600 mb-6">
            {selectedSources.length} of {research.sources.length} sources selected
          </p>
          
          <div className="space-y-4 mb-6">
            {research.sources.map((source) => (
              <div
                key={source.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSources.includes(source.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSource(source.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={() => {}}
                    className="mt-1 h-5 w-5 text-primary-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        source.type === 'web' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {source.type.toUpperCase()}
                      </span>
                      <h4 className="font-semibold text-gray-900">{source.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{source.content.substring(0, 200)}...</p>
                    <a
                      href={source.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source.source}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSelectedSources(research.sources.map(s => s.id))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedSources([])}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Deselect All
            </button>
            <button
              onClick={handleApproveSources}
              disabled={selectedSources.length === 0}
              className="flex-1 px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve & Continue ({selectedSources.length} sources)
            </button>
          </div>
        </div>
      )}

      {/* Final Briefing */}
      {research.status === 'completed' && research.briefing && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Final Briefing</h3>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">
              {research.briefing.content}
            </pre>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Metadata</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sources Used:</span>
                <span className="ml-2 font-medium">{research.briefing.metadata.sources_used}</span>
              </div>
              <div>
                <span className="text-gray-600">Word Count:</span>
                <span className="ml-2 font-medium">{research.briefing.metadata.word_count}</span>
              </div>
              <div>
                <span className="text-gray-600">Citations:</span>
                <span className="ml-2 font-medium">{research.briefing.metadata.citations}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

