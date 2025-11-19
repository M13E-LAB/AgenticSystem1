# 🚀 Multi-Agent Research Assistant - Full Stack Application

Une application full-stack complète avec interface web moderne pour un système multi-agents de recherche et création de briefings intelligents.

## 📋 Vue d'ensemble

Ce système utilise **5 agents spécialisés** orchestrés par LangGraph pour produire des briefings de recherche professionnels avec citations et validation humaine.

### 🎯 Architecture

```
User Request → Planner → Retrieval → Human Approval → Writer → Critic → Final Briefing
```

**Agents:**
- 🎯 **Planner**: Analyse la demande et crée un plan de recherche
- 🔍 **Retrieval**: Recherche web (DuckDuckGo) + Wikipedia
- 👤 **Human Approval**: Validation des sources par l'utilisateur
- ✍️ **Writer**: Rédaction du briefing avec citations
- 🔍 **Critic**: Révision et amélioration du contenu

---

## 🚀 Installation & Démarrage

### Prérequis
- Python 3.9+
- Node.js 18+
- OpenAI API Key

### 1. Configuration Backend

```bash
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer dépendances
pip install -r requirements.txt

# Configurer les clés API (voir env_example.txt)
nano .env  # Ajouter OPENAI_API_KEY et LANGFUSE keys
```

**Variables d'environnement requises dans `.env`:**
```bash
OPENAI_API_KEY=sk-...
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 2. Configuration Frontend

```bash
cd frontend

# Installer dépendances
npm install
```

### 3. Démarrer l'Application

**Option A: Script automatique**
```bash
chmod +x start_app.sh
./start_app.sh
```

**Option B: Manuel (2 terminaux)**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 4. Accéder à l'Application

- 🎨 **Frontend**: http://localhost:3000
- 📊 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

---

## 📁 Structure du Projet

```
Agentic AI/
├── backend/
│   ├── main.py                    # API FastAPI
│   ├── services/
│   │   ├── agents_integration.py  # Système multi-agents (LangGraph)
│   │   ├── research_service.py    # Logique métier
│   │   └── websocket_manager.py   # WebSocket temps réel
│   ├── requirements.txt           # Dépendances Python
│   └── venv/                      # Environnement virtuel
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Page d'accueil
│   │   │   ├── NewResearch.jsx         # Créer recherche
│   │   │   ├── ResearchProgress.jsx    # Suivi temps réel
│   │   │   └── Architecture.jsx        # Explication système
│   │   ├── App.jsx                # Composant principal
│   │   └── main.jsx               # Point d'entrée
│   ├── package.json
│   └── vite.config.js
│
├── start_app.sh              # Script de démarrage
├── env_example.txt           # Template configuration
├── README.md                 # Ce fichier
└── FULLSTACK_README.md       # Documentation technique détaillée
```

---

## 🎨 Fonctionnalités

### ✅ Implémenté

- ✅ **API REST complète** (FastAPI)
- ✅ **WebSocket** pour mises à jour en temps réel
- ✅ **Interface React moderne** et responsive
- ✅ **Pipeline visuel** des agents
- ✅ **Approbation interactive** des sources
- ✅ **Recherche web** (DuckDuckGo + Wikipedia)
- ✅ **Citations professionnelles** dans les briefings
- ✅ **Gestion d'erreurs** robuste
- ✅ **Documentation live** de l'architecture

### 🔄 Flux de Travail Utilisateur

1. **Créer une recherche** → Formulaire avec options
2. **Suivre la progression** → Pipeline animé en temps réel
3. **Approuver les sources** → Sélection interactive
4. **Obtenir le briefing** → Document professionnel avec citations

---

## 📡 API Endpoints

### Principaux endpoints:

- `POST /api/research/create` - Créer une recherche
- `GET /api/research/:id/status` - Obtenir le statut
- `POST /api/research/:id/approve-sources` - Approuver les sources
- `GET /api/research/list` - Lister toutes les recherches
- `GET /api/architecture` - Documentation du système
- `WS /ws/:id` - WebSocket pour temps réel

📚 Documentation interactive complète: http://localhost:8000/docs

---

## 🛠️ Stack Technique

### Backend
- **FastAPI** - API REST moderne
- **Uvicorn** - Serveur ASGI
- **LangGraph** - Orchestration multi-agents
- **LangChain** - Framework LLM
- **OpenAI** - GPT-4o-mini
- **DuckDuckGo** - Recherche web
- **Wikipedia** - Base de connaissances

### Frontend
- **React 18** - UI library
- **Vite** - Build tool rapide
- **TailwindCSS** - Styling moderne
- **React Router** - Navigation
- **Axios** - HTTP client
- **WebSocket** - Temps réel

---

## 💡 Exemples d'Utilisation

### Via l'Interface Web

1. Aller sur http://localhost:3000
2. Cliquer "Start New Research"
3. Entrer votre question (ex: "Analyze the evolution of electric vehicle market")
4. Configurer les options si besoin
5. Suivre la progression en temps réel
6. Approuver les sources trouvées
7. Recevoir votre briefing professionnel

### Via l'API

```bash
# Créer une recherche
curl -X POST http://localhost:8000/api/research/create \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Evolution of AI in healthcare",
    "max_sources": 10,
    "enable_web": true,
    "enable_wikipedia": true
  }'

# Obtenir le statut
curl http://localhost:8000/api/research/{research_id}/status

# Approuver les sources
curl -X POST http://localhost:8000/api/research/{research_id}/approve-sources \
  -H "Content-Type: application/json" \
  -d '{
    "approved_source_ids": [0, 1, 2, 3, 4]
  }'
```

---

## 🚀 Améliorations Futures Possibles

- 📄 Export PDF professionnel
- 💾 Base de données (PostgreSQL)
- 🔐 Authentification utilisateurs
- 📊 Analytics et tableaux de bord
- 🌐 Support multilingue
- 🎨 Mode sombre
- 📱 Application mobile
- 🧪 Tests automatisés (Jest, Pytest)
- 🐳 Docker & Docker Compose
- ☁️ Déploiement cloud (AWS/GCP/Azure)

---

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier que l'environnement virtuel est activé
source backend/venv/bin/activate

# Réinstaller les dépendances
pip install -r backend/requirements.txt

# Vérifier la clé OpenAI
cat backend/.env
```

### Le frontend ne démarre pas
```bash
# Supprimer node_modules et réinstaller
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WebSocket ne se connecte pas
- Vérifier que le backend tourne sur le port 8000
- Vérifier la configuration proxy dans `frontend/vite.config.js`
- Regarder la console browser pour les erreurs

### Pas de résultats de recherche
- Vérifier votre connexion internet
- DuckDuckGo peut avoir des rate limits → Le système utilisera Wikipedia en fallback
- Vérifier les logs backend pour les erreurs détaillées

---

## 📞 Documentation & Support

### 📚 Documentation complète:
- **`INSTALLATION_GUIDE.md`** - Guide d'installation pas à pas ⭐ **COMMENCER ICI**
- **`ARCHITECTURE_DIAGRAM.md`** - Diagrammes et architecture détaillée
- **`PROJECT_COMPLIANCE_REPORT.md`** - Conformité aux exigences du Project A
- **`LANGFUSE_SETUP.md`** - Configuration du monitoring Langfuse
- **`FULLSTACK_README.md`** - Documentation technique avancée
- **`env_example.txt`** - Template des variables d'environnement
- **http://localhost:3000/architecture** - Explication visuelle en temps réel

### 🎯 Pour commencer rapidement:
1. Suivre `INSTALLATION_GUIDE.md` (10 minutes)
2. Lire `ARCHITECTURE_DIAGRAM.md` pour comprendre le système
3. Vérifier `PROJECT_COMPLIANCE_REPORT.md` pour l'évaluation

---

## 🎓 Project Information

**Course:** Multi-Agent AI Systems - Final Project  
**Project:** Project A - Multi-Agent Research & Briefing Assistant  
**Requirements Compliance:** 100% ✅ (7/7 core requirements COMPLETE)

**Key Features:**
- ✅ Multi-agent workflow (5 agents)
- ✅ LangGraph routing with StateGraph
- ✅ **Vector Database RAG** (ChromaDB + OpenAI Embeddings) 🆕
- ✅ External search tools (DuckDuckGo + Wikipedia)
- ✅ Human-in-the-loop approval system
- ✅ SqliteSaver persistence
- ✅ Langfuse monitoring with full traces
- ✅ Full-stack web application (bonus)

**🎉 100% Project A Compliance Achieved!**

See `PROJECT_COMPLIANCE_REPORT.md` and `VECTOR_DATABASE_GUIDE.md` for details.

---

## 📄 License

MIT License - Open source

---

**Built with ❤️ for intelligent research automation**

🚀 Prêt à transformer vos recherches en briefings professionnels !
