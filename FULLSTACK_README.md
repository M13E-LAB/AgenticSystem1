# 🚀 Multi-Agent Research Assistant - Full Stack Application

Une application full-stack complète avec interface web pour le système multi-agents de recherche et création de briefings.

## 📋 Table des Matières

- [Architecture](#architecture)
- [Installation](#installation)
- [Démarrage Rapide](#démarrage-rapide)
- [Structure du Projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Technologies](#technologies)

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Dashboard │  │   New    │  │ Progress │  │  Archi.  │        │
│  │          │  │ Research │  │  (WS)    │  │  Explain │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTP/WebSocket
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (FastAPI)                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  /api/research/create                                   │     │
│  │  /api/research/:id/status                              │     │
│  │  /api/research/:id/approve-sources                     │     │
│  │  /api/architecture (explique le système)               │     │
│  │  /ws/:id (WebSocket updates)                           │     │
│  └────────────────────────────────────────────────────────┘     │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Python calls
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MULTI-AGENT SYSTEM (LangGraph)                      │
│                                                                   │
│  🎯 Planner → 🔍 Retrieval → 👤 Human → ✍️ Writer → 🔍 Critic   │
│                                                                   │
│  Technologies: LangGraph, LangChain, OpenAI, DuckDuckGo         │
└─────────────────────────────────────────────────────────────────┘
```

### Flux de Données

1. **User Request** → Frontend envoie requête à `/api/research/create`
2. **Backend** → Démarre le workflow multi-agents en arrière-plan
3. **WebSocket** → Envoie des updates en temps réel au frontend
4. **Human Approval** → Frontend affiche les sources, user approuve
5. **Continuation** → Backend continue le workflow après approbation
6. **Final Briefing** → Frontend affiche le briefing final

---

## 🚀 Installation

### Prérequis

- Python 3.9+
- Node.js 18+
- OpenAI API Key

### 1. Backend Setup

```bash
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer dépendances
pip install -r requirements.txt

# Configurer clé API
echo "OPENAI_API_KEY=your-key-here" > .env
```

### 2. Frontend Setup

```bash
cd frontend

# Installer dépendances
npm install
```

---

## ⚡ Démarrage Rapide

### Méthode 1: Démarrage Manuel

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
# API disponible sur http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend disponible sur http://localhost:3000
```

### Méthode 2: Script de Démarrage

```bash
# À la racine du projet
chmod +x start_app.sh
./start_app.sh
```

---

## 📁 Structure du Projet

```
Agentic AI/
├── backend/
│   ├── main.py                    # API FastAPI principale
│   ├── services/
│   │   ├── research_service.py    # Logique métier
│   │   └── websocket_manager.py   # Gestion WebSocket
│   └── requirements.txt           # Dépendances Python
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Page d'accueil
│   │   │   ├── NewResearch.jsx    # Création de recherche
│   │   │   ├── ResearchProgress.jsx  # Progression en temps réel
│   │   │   └── Architecture.jsx   # Explication du backend
│   │   ├── App.jsx                # Composant principal
│   │   └── main.jsx               # Point d'entrée
│   ├── package.json
│   └── vite.config.js
│
├── Multi_Agent_Research_Assistant.ipynb  # Système multi-agents
├── README.md                             # Documentation originale
└── FULLSTACK_README.md                   # Cette documentation
```

---

## 📡 API Documentation

### Endpoints Principaux

#### 1. Créer une Recherche
```http
POST /api/research/create
Content-Type: application/json

{
  "query": "Evolution of watch prices",
  "max_sources": 10,
  "search_depth": "normal",
  "enable_web": true,
  "enable_wikipedia": true
}

Response:
{
  "research_id": "uuid",
  "status": "started",
  "message": "Research started successfully"
}
```

#### 2. Obtenir le Status
```http
GET /api/research/{research_id}/status

Response:
{
  "id": "uuid",
  "query": "...",
  "status": "running|waiting_approval|completed",
  "current_step": "planner|retrieval|human_approval|writer|critic",
  "progress": {...},
  "sources": [...],
  "briefing": {...}
}
```

#### 3. Approuver les Sources
```http
POST /api/research/{research_id}/approve-sources
Content-Type: application/json

{
  "research_id": "uuid",
  "approved_source_ids": [0, 1, 2, 4]
}
```

#### 4. Obtenir l'Architecture
```http
GET /api/architecture

Response: Documentation complète du système backend
```

### WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/{research_id}')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  // Types: status_update, sources_ready, completed
}
```

---

## 🎨 Frontend Features

### 1. Dashboard
- **Vue d'ensemble** des recherches
- **Statistiques** (total, actives, complétées)
- **Liste des recherches** récentes
- Navigation rapide

### 2. New Research
- **Formulaire** intuitif pour créer une recherche
- **Exemples** de questions pré-remplis
- **Options avancées**:
  - Nombre de sources
  - Profondeur de recherche
  - Types de sources (Web/Wikipedia)

### 3. Research Progress
- **Pipeline visuel** des agents en temps réel
- **WebSocket updates** automatiques
- **Approbation des sources** interactive
- **Briefing final** avec métadonnées

### 4. Architecture Explained
- **Diagramme** du workflow
- **Détails de chaque agent**
- **Technologies** utilisées
- **Endpoints API** documentés

---

## 🛠️ Technologies

### Backend
- **FastAPI** - API web moderne et rapide
- **Uvicorn** - Serveur ASGI
- **WebSockets** - Communication temps réel
- **Pydantic** - Validation de données
- **LangGraph** - Orchestration multi-agents
- **LangChain** - Framework LLM
- **OpenAI** - Modèles de langage

### Frontend
- **React 18** - UI library
- **Vite** - Build tool rapide
- **React Router** - Navigation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons

### Multi-Agent System
- **LangGraph** - State machine et workflow
- **OpenAI GPT-4o-mini** - Génération de texte
- **DuckDuckGo** - Recherche web
- **Wikipedia** - Base de connaissances

---

## 🎯 Fonctionnalités Clés

### ✅ Implémenté
- ✅ API REST complète
- ✅ WebSocket pour temps réel
- ✅ Interface React moderne
- ✅ Pipeline visuel des agents
- ✅ Approbation interactive des sources
- ✅ Page d'explication de l'architecture
- ✅ Gestion d'erreurs robuste
- ✅ Fallback Wikipedia
- ✅ Export du briefing

### 🚀 Améliorations Futures
- 📄 Export PDF professionnel
- 💾 Persistence en base de données
- 👥 Multi-utilisateurs avec authentification
- 📊 Graphiques et analytics
- 🌐 Support multilingue
- 📱 Version mobile responsive
- 🎨 Thèmes (light/dark)

---

## 🐛 Debug & Logs

### Backend Logs
```bash
cd backend
python main.py
# Logs détaillés dans la console
```

### Frontend Dev Tools
```bash
cd frontend
npm run dev
# Console browser pour les logs React
```

### WebSocket Debugging
```javascript
// Dans la console browser
ws = new WebSocket('ws://localhost:8000/ws/test-id')
ws.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## 📝 Notes de Développement

### Proxy Configuration
Le frontend Vite est configuré pour proxyer les requêtes API:
- `/api/*` → `http://localhost:8000/api/*`
- `/ws/*` → `ws://localhost:8000/ws/*`

### CORS
Le backend accepte les requêtes de:
- `http://localhost:3000` (Vite)
- `http://localhost:5173` (Vite alternative)

### State Management
- Backend: In-memory dictionnaire (peut être remplacé par Redis/DB)
- Frontend: React useState + WebSocket updates

---

## 🤝 Contribution

Pour contribuer:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

MIT License - Voir LICENSE file

---

## 👥 Auteurs

- **Backend & Multi-Agent System** - Système intelligent de recherche
- **Frontend & API** - Interface web moderne

---

## 🙏 Remerciements

- LangChain & LangGraph pour l'orchestration
- OpenAI pour les modèles de langage
- FastAPI pour l'excellent framework
- React & Vite pour l'expérience développeur

---

**Built with ❤️ for intelligent research automation**

Pour plus d'informations sur le système multi-agents, voir `README.md`

