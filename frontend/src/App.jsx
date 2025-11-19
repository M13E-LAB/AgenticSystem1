import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Activity, Info } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import NewResearch from './pages/NewResearch'
import ResearchProgress from './pages/ResearchProgress'
import Architecture from './pages/Architecture'

function App() {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'New Research', path: '/new', icon: BookOpen },
    { name: 'Architecture', path: '/architecture', icon: Info },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                Multi-Agent Research Assistant
              </h1>
            </div>
            
            <nav className="flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewResearch />} />
          <Route path="/research/:id" element={<ResearchProgress />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Multi-Agent Research Assistant v2.0 - Powered by LangGraph & OpenAI
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

