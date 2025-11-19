"""
Script to load PDF into ChromaDB Vector Database
Replaces sample documents with actual PDF content
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
    from langchain_openai import OpenAIEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain_core.documents import Document
    
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Install missing packages: pip install pypdf langchain-community")
    sys.exit(1)


def load_pdf_to_vectordb(pdf_path: str):
    """Load PDF and add to vector database"""
    
    print(f"\n📄 Loading PDF: {pdf_path}")
    
    # Check if PDF exists
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
            length_function=len,
        )
        
        chunks = text_splitter.split_documents(pages)
        print(f"✅ Created {len(chunks)} chunks")
        
        # 3. Initialize embeddings and vector DB
        print("🔧 Initializing Vector DB...")
        embeddings = OpenAIEmbeddings()
        db_path = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
        
        # 4. Delete existing collection and create new one
        print("🗑️  Clearing existing documents...")
        
        # Create new vector store (will replace existing)
        vector_db = Chroma(
            embedding_function=embeddings,
            persist_directory=db_path,
            collection_name="research_documents"
        )
        
        # Delete all existing documents
        try:
            vector_db.delete_collection()
            print("✅ Existing collection deleted")
        except:
            print("⚠️  No existing collection to delete")
        
        # Recreate collection
        vector_db = Chroma(
            embedding_function=embeddings,
            persist_directory=db_path,
            collection_name="research_documents"
        )
        
        # 5. Add chunks in batches (to avoid rate limits)
        print(f"📚 Adding {len(chunks)} chunks to Vector DB...")
        batch_size = 100
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            vector_db.add_documents(batch)
            print(f"   ✅ Added batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")
        
        print(f"\n✅ SUCCESS! {len(chunks)} chunks added to Vector DB")
        print(f"📁 Location: {db_path}")
        
        # 6. Test search
        print("\n🧪 Testing search...")
        results = vector_db.similarity_search("rolex watch", k=2)
        print(f"✅ Search works! Found {len(results)} results")
        if results:
            print(f"   Preview: {results[0].page_content[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # Path to PDF
    pdf_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "RA_2024_en_web (1).pdf"
    )
    
    print("="*60)
    print("📚 PDF to Vector DB Loader")
    print("="*60)
    
    success = load_pdf_to_vectordb(pdf_path)
    
    if success:
        print("\n" + "="*60)
        print("🎉 PDF successfully loaded into Vector DB!")
        print("="*60)
        print("\nYou can now:")
        print("1. Restart the backend: python main.py")
        print("2. The RAG system will use your PDF content")
        print("3. Search queries will find relevant sections")
    else:
        print("\n❌ Failed to load PDF")
        sys.exit(1)

