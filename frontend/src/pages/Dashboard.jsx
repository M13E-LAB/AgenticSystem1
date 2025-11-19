import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, CheckCircle, PlayCircle, FileText } from 'lucide-react'
import axios from 'axios'

export default function Dashboard() {
  const navigate = useNavigate()
  const [researches, setResearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  })

  useEffect(() => {
    fetchResearches()
    
    // Auto-refresh every 3 seconds if there are active researches
    const interval = setInterval(() => {
      if (stats.active > 0) {
        fetchResearches()
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [stats.active])

  const fetchResearches = async () => {
    try {
      const response = await axios.get('/api/research/list')
      setResearches(response.data)
      
      // Calculate stats
      const total = response.data.length
      const active = response.data.filter(r => r.status === 'running' || r.status === 'waiting_approval').length
      const completed = response.data.filter(r => r.status === 'completed').length
      
      setStats({ total, active, completed })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching researches:', error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      running: { bg: 'bg-blue-100', text: 'text-blue-800', icon: PlayCircle, label: 'Running' },
      waiting_approval: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Waiting Approval' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Completed' }
    }
    
    const badge = badges[status] || badges.running
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Multi-Agent Research Assistant</h2>
        <p className="text-primary-100 mb-6">
          Create professional research briefings with AI-powered multi-agent collaboration
        </p>
        <button
          onClick={() => navigate('/new')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Start New Research
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Research</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <PlayCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Research */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Research</h3>
        </div>
        <div className="p-6">
          {researches.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No research yet</p>
              <button
                onClick={() => navigate('/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Research
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {researches.map((research) => (
                <div
                  key={research.id}
                  onClick={() => navigate(`/research/${research.id}`)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {research.query}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(research.started_at)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(research.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

