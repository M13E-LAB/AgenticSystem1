import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, ArrowRight } from 'lucide-react'
import axios from 'axios'

export default function NewResearch() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    query: '',
    max_sources: 10,
    search_depth: 'normal',
    enable_web: true,
    enable_wikipedia: true
  })
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/research/create', formData)
      const { research_id } = response.data
      
      // Navigate to research progress page
      navigate(`/research/${research_id}`)
    } catch (error) {
      console.error('Error creating research:', error)
      alert('Failed to create research. Please try again.')
      setLoading(false)
    }
  }

  const exampleQueries = [
    "Evolution of electric vehicle market prices",
    "Impact of AI on software development productivity",
    "Cryptocurrency market trends and regulation",
    "Sustainable energy adoption in developing countries"
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Research</h2>
        <p className="text-gray-600">
          Enter your research question and our AI agents will create a comprehensive briefing
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Research Query */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Research Question *
            </label>
            <textarea
              id="query"
              rows={4}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3 border"
              placeholder="E.g., Create a briefing on the evolution of watch prices in the market"
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
            />
            <p className="mt-2 text-sm text-gray-500">
              Be specific about what you want to research. The more detailed, the better results you'll get.
            </p>
          </div>

          {/* Example Queries */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Example queries:</p>
            <div className="space-y-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, query: example })}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Settings className="h-4 w-4 mr-1" />
              Advanced Options
              <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Max Sources */}
                <div>
                  <label htmlFor="max_sources" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Sources: {formData.max_sources}
                  </label>
                  <input
                    type="range"
                    id="max_sources"
                    min="5"
                    max="20"
                    value={formData.max_sources}
                    onChange={(e) => setFormData({ ...formData, max_sources: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Number of sources to search and retrieve
                  </p>
                </div>

                {/* Search Depth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Depth
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="search_depth"
                        value="normal"
                        checked={formData.search_depth === 'normal'}
                        onChange={(e) => setFormData({ ...formData, search_depth: e.target.value })}
                        className="form-radio h-4 w-4 text-primary-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Normal</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="search_depth"
                        value="deep"
                        checked={formData.search_depth === 'deep'}
                        onChange={(e) => setFormData({ ...formData, search_depth: e.target.value })}
                        className="form-radio h-4 w-4 text-primary-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Deep (slower, more thorough)</span>
                    </label>
                  </div>
                </div>

                {/* Source Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Types
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enable_web}
                        onChange={(e) => setFormData({ ...formData, enable_web: e.target.checked })}
                        className="form-checkbox h-4 w-4 text-primary-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Web Search (DuckDuckGo)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enable_wikipedia}
                        onChange={(e) => setFormData({ ...formData, enable_wikipedia: e.target.checked })}
                        className="form-checkbox h-4 w-4 text-primary-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Wikipedia</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.query.trim()}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Starting Research...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Start Research
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Planner Agent analyzes your request and creates search queries</li>
          <li>Retrieval Agent searches web and Wikipedia for sources</li>
          <li>You review and approve the sources found</li>
          <li>Writer Agent creates a professional briefing with citations</li>
          <li>Critic Agent reviews and improves the final content</li>
        </ol>
      </div>
    </div>
  )
}

