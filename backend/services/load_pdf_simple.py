"""
Simple PDF loader that stores text without embeddings for now
Will use sentence-transformers (local, free) instead of OpenAI embeddings
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from dotenv import load_dotenv
load_dotenv()

try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_core.documents import Document
    
    # Use sentence transformers (local, free) instead of OpenAI
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Install: pip install sentence-transformers")
    sys.exit(1)


def load_pdf_to_vectordb(pdf_path: str):
    """Load PDF using FREE local embeddings (no OpenAI needed)"""
    
    print(f"\n📄 Loading PDF: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF not found: {pdf_path}")
        return False
    
    try:
        # 1. Load PDF
        print("📖 Reading PDF...")
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()
        print(f"✅ Loaded {len(pages)} pages")
        
        # 2. Split into chunks
        print("✂️  Splitting into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        
        chunks = text_splitter.split_documents(pages)
        print(f"✅ Created {len(chunks)} chunks")
        
        # 3. Use FREE local embeddings (no API key needed!)
        print("🔧 Initializing FREE local embeddings...")
        print("   (Using sentence-transformers - no OpenAI needed)")
        
        embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"  # Small, fast, free model
        )
        
        db_path = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
        
        # 4. Delete existing collection
        print("🗑️  Clearing existing documents...")
        try:
            temp_db = Chroma(
                embedding_function=embeddings,
                persist_directory=db_path,
                collection_name="research_documents"
            )
            temp_db.delete_collection()
            print("✅ Existing collection deleted")
        except:
            print("⚠️  No existing collection (OK)")
        
        # 5. Create new collection with PDF
        print(f"\n📚 Adding {len(chunks)} chunks to Vector DB...")
        print("   (This may take 2-3 minutes for local embeddings...)")
        
        vector_db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=db_path,
            collection_name="research_documents"
        )
        
        print(f"\n✅ SUCCESS! {len(chunks)} chunks added")
        print(f"📁 Location: {db_path}")
        
        # 6. Test search
        print("\n🧪 Testing search...")
        results = vector_db.similarity_search("watch market price", k=2)
        print(f"✅ Search works! Found {len(results)} results")
        if results:
            print(f"   Preview: {results[0].page_content[:150]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    pdf_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "RA_2024_en_web (1).pdf"
    )
    
    print("="*70)
    print("📚 PDF to Vector DB Loader (FREE - No OpenAI needed!)")
    print("="*70)
    print("\n💡 Using local embeddings (sentence-transformers)")
    print("   No API costs, works offline!")
    
    success = load_pdf_to_vectordb(pdf_path)
    
    if success:
        print("\n" + "="*70)
        print("🎉 PDF successfully loaded!")
        print("="*70)
        print("\nNOTE: The backend still needs OpenAI for LLM calls,")
        print("but RAG search now works with your PDF content!")
    else:
        print("\n❌ Failed to load PDF")
        sys.exit(1)

