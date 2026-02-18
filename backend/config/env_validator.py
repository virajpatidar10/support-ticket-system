"""
Environment variable validation utility
"""
import os
import sys


def validate_environment():
    """Validate required environment variables"""
    
    required_vars = {
        'DATABASE_URL': 'Database connection string is required',
    }
    
    optional_vars = {
        'LLM_API_KEY': 'LLM API key not set - using default classification',
        'LLM_PROVIDER': 'LLM provider not set - defaulting to openai',
    }
    
    errors = []
    warnings = []
    
    # Check required variables
    for var, message in required_vars.items():
        if not os.environ.get(var):
            errors.append(f"❌ {var}: {message}")
    
    # Check optional variables
    for var, message in optional_vars.items():
        if not os.environ.get(var):
            warnings.append(f"⚠️  {var}: {message}")
    
    # Print results
    if errors:
        print("\n🚨 Environment Configuration Errors:")
        for error in errors:
            print(error)
        sys.exit(1)
    
    if warnings:
        print("\n⚠️  Environment Configuration Warnings:")
        for warning in warnings:
            print(warning)
    
    print("\n✅ Environment validation passed!")


if __name__ == '__main__':
    validate_environment()
