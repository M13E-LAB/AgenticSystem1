# 🚀 Guide pour pousser vers GitHub

## Étapes à suivre pour pousser vers https://github.com/M13E-LAB/AgenticSystem

### Option 1: Authentification avec Token (Recommandée)

1. **Créer un Personal Access Token sur GitHub:**
   - Allez sur GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Cliquez "Generate new token (classic)"
   - Sélectionnez les permissions: `repo`, `workflow`
   - Copiez le token généré

2. **Pousser avec le token:**
   ```bash
   cd "/Users/mae/Downloads/Agentic AI "
   git push https://YOUR_TOKEN@github.com/M13E-LAB/AgenticSystem.git main
   ```

### Option 2: SSH (Alternative)

1. **Configurer SSH:**
   ```bash
   # Générer une clé SSH si vous n'en avez pas
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Ajouter la clé à l'agent SSH
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Copier la clé publique
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Ajouter la clé SSH à GitHub:**
   - GitHub.com → Settings → SSH and GPG keys → New SSH key
   - Coller la clé publique

3. **Changer le remote en SSH:**
   ```bash
   git remote set-url origin git@github.com:M13E-LAB/AgenticSystem.git
   git push -u origin main
   ```

### Option 3: GitHub CLI (Plus simple)

1. **Installer GitHub CLI:**
   ```bash
   brew install gh  # Sur macOS
   ```

2. **S'authentifier et pousser:**
   ```bash
   gh auth login
   git push -u origin main
   ```

## 📁 Fichiers qui seront poussés:

- `Multi_Agent_Research_Assistant.ipynb` - Le système multi-agents complet
- `README.md` - Documentation du projet
- `requirements.txt` - Dépendances Python
- `.gitignore` - Fichiers à ignorer

## 🎯 Après le push:

Le repository contiendra votre système multi-agents complet avec:
- ✅ Architecture multi-agents (Planner, Retrieval, Writer, Critic)
- ✅ Workflow LangGraph avec routing logic
- ✅ RAG amélioré avec citations
- ✅ Recherche externe (Web + Wikipedia)
- ✅ Human-in-the-loop approval
- ✅ Persistance d'état
- ✅ Documentation complète

**Choisissez l'option qui vous convient le mieux et exécutez les commandes dans votre terminal !**
