#!/usr/bin/env python3
"""
Test script to verify embedding configuration and initialization
No PyTorch/GPU required - uses CPU via transformers library
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers.config import get_settings
from stores.llm.LLMProviderFactory import LLMProviderFactory
from stores.llm.LLMEnums import DocumentTypeEnum

def print_section(title):
    print("\n" + "=" * 60)
    print(title.center(60))
    print("=" * 60)

def test_embedding():
    print_section("EMBEDDING CONFIGURATION TEST (CPU Only)")
    
    # Load settings
    print("\n1. Loading configuration...")
    try:
        settings = get_settings()
        print("   ✓ Configuration loaded")
    except Exception as e:
        print(f"   ✗ Failed to load configuration: {e}")
        return False
    
    # Display configuration
    print("\n2. Configuration values:")
    print(f"   Embedding Backend: {settings.EMBEDDING_BACKEND}")
    print(f"   Embedding Model: {settings.EMBEDDING_MODEL_ID}")
    print(f"   Expected Size: {settings.EMBEDDING_MODEL_SIZE}")
    print(f"   HF Token: {'✓ Set' if settings.HF_TOKEN else '✗ Not Set'}")
    
    # Create embedding client
    print("\n3. Creating embedding client...")
    try:
        llm_factory = LLMProviderFactory(settings)
        embedding_client = llm_factory.create(provider=settings.EMBEDDING_BACKEND)
        
        if not embedding_client:
            print("   ✗ Failed to create embedding client")
            return False
        
        print("   ✓ Embedding client created")
    except Exception as e:
        print(f"   ✗ Error creating client: {e}")
        return False
    
    # Initialize embedding model
    print("\n4. Initializing embedding model...")
    print(f"   Model: {settings.EMBEDDING_MODEL_ID}")
    print(f"   (First run will download model - may take 1-2 minutes)")
    print(f"   (Using CPU - no GPU/PyTorch needed)")
    try:
        embedding_client.set_embedding_model(
            model_id=settings.EMBEDDING_MODEL_ID,
            embedding_size=settings.EMBEDDING_MODEL_SIZE
        )
        print("   ✓ Embedding model initialized")
    except Exception as e:
        print(f"   ✗ Error initializing model: {e}")
        print("\n   Common issues:")
        print("   - Missing packages: pip install sentence-transformers transformers")
        print("   - Network issue: model download failed")
        import traceback
        traceback.print_exc()
        return False
    
    # Test document embedding
    print("\n5. Testing document embedding...")
    test_doc = "This is a sample document for testing embeddings."
    print(f"   Text: '{test_doc}'")
    try:
        doc_embedding = embedding_client.embed_text(
            test_doc, 
            document_type=DocumentTypeEnum.DOCUMENT.value
        )
        
        if doc_embedding:
            print(f"   ✓ Document embedding generated")
            print(f"   Dimension: {len(doc_embedding)}")
            print(f"   Sample values: [{doc_embedding[0]:.4f}, {doc_embedding[1]:.4f}, {doc_embedding[2]:.4f}]")
        else:
            print("   ✗ Document embedding returned None")
            return False
    except Exception as e:
        print(f"   ✗ Error generating document embedding: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test query embedding
    print("\n6. Testing query embedding...")
    test_query = "sample query"
    print(f"   Text: '{test_query}'")
    try:
        query_embedding = embedding_client.embed_text(
            test_query,
            document_type=DocumentTypeEnum.QUERY.value
        )
        
        if query_embedding:
            print(f"   ✓ Query embedding generated")
            print(f"   Dimension: {len(query_embedding)}")
            print(f"   Sample values: [{query_embedding[0]:.4f}, {query_embedding[1]:.4f}, {query_embedding[2]:.4f}]")
        else:
            print("   ✗ Query embedding returned None")
            return False
    except Exception as e:
        print(f"   ✗ Error generating query embedding: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Verify dimensions
    print("\n7. Verifying dimensions...")
    if len(doc_embedding) == len(query_embedding):
        print(f"   ✓ Dimensions match: {len(doc_embedding)}")
    else:
        print(f"   ✗ Dimension mismatch!")
        print(f"     Document: {len(doc_embedding)}")
        print(f"     Query: {len(query_embedding)}")
        return False
    
    if len(doc_embedding) == settings.EMBEDDING_MODEL_SIZE:
        print(f"   ✓ Matches expected size: {settings.EMBEDDING_MODEL_SIZE}")
    else:
        print(f"   ⚠ Size mismatch (expected: {settings.EMBEDDING_MODEL_SIZE}, got: {len(doc_embedding)})")
        print(f"   → Update EMBEDDING_MODEL_SIZE in .env to: {len(doc_embedding)}")
    
    print_section("✓✓✓ ALL TESTS PASSED ✓✓✓")
    print("\nYour embedding setup is working correctly!")
    print("Running on CPU (no GPU/PyTorch needed)")
    print("\nNext steps:")
    print("1. Start your FastAPI server: uvicorn main:app --reload")
    print("2. Index your data: POST /api/v1/nlp/index/push/{project_id}")
    print("3. Search: POST /api/v1/nlp/index/search/{project_id}")
    
    return True

if __name__ == "__main__":
    try:
        success = test_embedding()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)