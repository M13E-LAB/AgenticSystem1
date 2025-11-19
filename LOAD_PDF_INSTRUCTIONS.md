# 📄 How to Load Your PDF into the Vector Database

## 🎯 Quick Guide

Your PDF **`RA_2024_en_web (1).pdf`** is ready to be loaded into ChromaDB!

---

## ⚡ Steps to Load the PDF

### 1. **Make sure your OpenAI API key is valid**

Edit `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-valid-key-here
```

Get a key from: https://platform.openai.com/api-keys

---

### 2. **Run the PDF loader script**

```bash
cd backend
source venv/bin/activate
python services/load_pdf_to_rag.py
```

**What it does:**
- ✅ Reads your PDF (50 pages)
- ✅ Splits into ~126 chunks
- ✅ Creates embeddings with OpenAI
- ✅ Stores in ChromaDB (`backend/chroma_db/`)
- ✅ Replaces the sample documents

**Expected output:**
```
📄 Loading PDF: RA_2024_en_web (1).pdf
✅ Loaded 50 pages
✅ Created 126 chunks
📚 Adding 126 chunks to Vector DB...
✅ SUCCESS! 126 chunks added
```

---

### 3. **Restart the backend**

```bash
python main.py
```

You should see:
```
✅ Vector DB loaded with 126 documents from PDF
```

---

## 🔄 Alternative: Use Local Embeddings (FREE, no OpenAI)

If you don't have an OpenAI key or want to save costs:

```bash
cd backend
source venv/bin/activate
python services/load_pdf_simple.py
```

This uses **sentence-transformers** (local, free, offline):
- ✅ No API costs
- ✅ Works without internet
- ⚠️ Slightly slower (2-3 min)
- ⚠️ Different embeddings than OpenAI

---

## 📊 Verify It Works

### Check the database exists:
```bash
ls backend/chroma_db/
# Should show: chroma.sqlite3 and other files
```

### Test a search:
```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vector_db = Chroma(
    embedding_function=embeddings,
    persist_directory="backend/chroma_db",
    collection_name="research_documents"
)

results = vector_db.similarity_search("rolex", k=2)
print(results[0].page_content[:200])
```

---

## 🎯 What Your PDF Contains

**File:** `RA_2024_en_web (1).pdf`
- **Pages:** 50
- **Type:** Rolex Annual Report 2024
- **Content:** Financial data, watch market analysis, brand information

Perfect for research queries about:
- Rolex watch prices
- Watch market trends
- Luxury watch industry
- Brand performance

---

## 🧪 Test the RAG System

### Create a research with:
```
"What are the trends in the Rolex watch market?"
```

**Expected flow:**
1. 📚 RAG searches your PDF first
2. 🌐 Then DuckDuckGo web search
3. 📖 Then Wikipedia
4. Combines all sources with citations

**In logs you'll see:**
```
📚 Searching Vector DB (RAG)...
✅ RAG: 2 documents
🌐 Searching DuckDuckGo...
✅ Web: 3 results
```

---

## 🔧 Troubleshooting

### Error: "Invalid API key"
- Check `backend/.env` has correct `OPENAI_API_KEY`
- Key should start with `sk-`
- Try regenerating the key on OpenAI platform

### Error: "PDF not found"
- Make sure `RA_2024_en_web (1).pdf` is in project root
- Check path in `load_pdf_to_rag.py` line 93

### Error: "Module not found"
- Install dependencies: `pip install pypdf langchain-community`

### Vector DB is empty after restart
- Run `python services/load_pdf_to_rag.py` again
- Check `backend/chroma_db/` directory exists

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `load_pdf_to_rag.py` | Main loader (uses OpenAI embeddings) |
| `load_pdf_simple.py` | Alternative loader (free, local embeddings) |
| `backend/chroma_db/` | Vector database storage |

---

## ✅ Summary

**Before loading PDF:**
- Vector DB has 5 sample documents about AI

**After loading PDF:**
- Vector DB has 126 chunks from your Rolex report
- RAG searches return actual PDF content
- Citations include page numbers from PDF

---

## 🚀 Next Steps

1. Get valid OpenAI API key
2. Run `python services/load_pdf_to_rag.py`
3. Restart backend
4. Test with Rolex-related queries
5. See your PDF content in search results!

---

**Ready to load your PDF!** 📄✨

