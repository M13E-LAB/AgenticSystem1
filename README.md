# Multi-Agent Research & Briefing Assistant

A sophisticated multi-agent system that produces high-quality research briefings with citations and human approval loops.

## 🎯 Project Overview

This system implements **Project A** requirements with a complete multi-agent workflow for research and briefing generation.

### ✅ Features Implemented

- **Multi-agent workflow** (Planner, Retrieval, Writer, Critic)
- **Routing logic** with LangGraph orchestration
- **Vector database** with document embeddings and retrieval (ChromaDB)
- **External search** capabilities (Web + Wikipedia)
- **Human-in-the-loop** approval system with interrupts
- **Persistent execution state** across sessions
- **Citation support** for professional briefings

## 🏗️ Architecture

```
User Request → Planner Agent → Retrieval Agent → Human Approval → Writer Agent → Critic Agent → Final Briefing
```

### Agent Roles

1. **🎯 Planner Agent**: Analyzes requests and creates detailed research plans
2. **🔍 Retrieval Agent**: Searches RAG system + external sources (web, Wikipedia)
3. **👤 Human Approval**: Interactive review and approval of sources
4. **✍️ Writer Agent**: Creates professional briefings with proper citations
5. **🔍 Critic Agent**: Reviews and improves the final content

## 🚀 Quick Start

### Installation

```bash
pip install -qU langgraph langchain langchain-openai langchain-community chromadb duckduckgo-search wikipedia
```

### Configuration

1. **Set your OpenAI API key** (choose one method):
   ```bash
   # Method 1: Environment variable (recommended)
   export OPENAI_API_KEY="your-key-here"
   
   # Method 2: Create .env file
   echo "OPENAI_API_KEY=your-key-here" > .env
   
   # Method 3: Edit notebook directly (line 103)
   ```

2. **Run all cells** in order
3. **Test with the example** or create your own research request

```python
# Example usage
result = run_research_request("Create a briefing on the evolution of watch prices in the market")

# Review sources when prompted, then resume
final_result = resume_with_feedback("approve_all")

# Get your briefing
print(final_result["final_briefing"])
```

## 📊 Current Example: Watch Market Analysis

The system is currently configured to research **watch market price evolution** with:
- Luxury watch price trends
- Market analysis and investment data
- Industry reports and web sources
- Professional briefing generation

## 🔧 Customization

### Add Your Own Documents
```python
# Add your PDF content to RAG
your_docs = ["Content from your documents..."]
your_sources = ["Document names..."]
rag_system.add_documents(your_docs, your_sources)
```

### Modify Research Topics
- Update the `test_request` variable
- Customize search queries in the Planner Agent
- Adapt the RAG documents to your domain

## 📁 Project Structure

```
├── Multi_Agent_Research_Assistant.ipynb  # Main system implementation
├── README.md                            # This file
└── .DS_Store                           # macOS system file
```

## 🛠️ Technical Stack

- **LangGraph**: Multi-agent orchestration and workflow management
- **LangChain**: LLM integration and document processing
- **ChromaDB**: Vector database for RAG system
- **OpenAI**: GPT models and embeddings
- **DuckDuckGo**: Web search capabilities
- **Wikipedia**: Knowledge base integration

## 🎯 Use Cases

- **Market Research**: Analyze trends and generate reports
- **Academic Research**: Comprehensive literature reviews
- **Business Intelligence**: Competitive analysis and briefings
- **Investment Research**: Market analysis with citations
- **Policy Research**: Government and regulatory analysis

## 🔄 Workflow Details

1. **Planning Phase**: AI analyzes request and creates search strategy
2. **Research Phase**: Multi-source information gathering (RAG + Web)
3. **Human Review**: Interactive approval of sources and data
4. **Writing Phase**: Professional briefing creation with citations
5. **Quality Control**: AI-powered review and improvement

## 📈 Next Enhancements

- [ ] Langfuse monitoring integration
- [ ] Additional search sources (academic databases)
- [ ] Export options (PDF, Word)
- [ ] Advanced citation formatting
- [ ] Multi-language support

## 🤝 Contributing

Feel free to contribute by:
- Adding new search sources
- Improving agent prompts
- Enhancing the user interface
- Adding new output formats

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for intelligent research automation**
