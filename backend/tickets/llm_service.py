import os
import json
from django.conf import settings


def classify_ticket(description):
    """
    Call LLM API to classify ticket description.
    Returns dict with suggested_category and suggested_priority.
    Falls back to defaults on error.
    """
    provider = settings.LLM_PROVIDER
    api_key = settings.LLM_API_KEY
    
    # Default fallback
    default_response = {
        'suggested_category': 'general',
        'suggested_priority': 'medium'
    }
    
    if not api_key or api_key == 'your-api-key-here':
        return default_response
    
    prompt = f"""Analyze this support ticket description and classify it.

Description: {description}

Respond with ONLY a JSON object in this exact format:
{{"category": "one of: billing, technical, account, general", "priority": "one of: low, medium, high, critical"}}

Classification guidelines:
- billing: payment issues, invoices, refunds, pricing questions
- technical: bugs, errors, performance issues, technical problems
- account: login, password, profile, account settings
- general: everything else

Priority guidelines:
- critical: system down, data loss, security breach, blocking all work
- high: major feature broken, affecting multiple users, urgent business impact
- medium: feature partially working, workarounds available, moderate impact
- low: minor issues, cosmetic problems, feature requests, questions

Respond with ONLY the JSON, no other text."""

    try:
        if provider == 'openai':
            return _classify_openai(prompt, api_key)
        elif provider == 'anthropic':
            return _classify_anthropic(prompt, api_key)
        else:
            return default_response
    except Exception as e:
        print(f"LLM classification error: {e}")
        return default_response


def _classify_openai(prompt, api_key):
    """OpenAI API classification"""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a support ticket classifier. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=100
        )
        
        content = response.choices[0].message.content.strip()
        result = json.loads(content)
        
        return {
            'suggested_category': result.get('category', 'general'),
            'suggested_priority': result.get('priority', 'medium')
        }
    except Exception as e:
        print(f"OpenAI error: {e}")
        return {'suggested_category': 'general', 'suggested_priority': 'medium'}


def _classify_anthropic(prompt, api_key):
    """Anthropic API classification"""
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.content[0].text.strip()
        result = json.loads(content)
        
        return {
            'suggested_category': result.get('category', 'general'),
            'suggested_priority': result.get('priority', 'medium')
        }
    except Exception as e:
        print(f"Anthropic error: {e}")
        return {'suggested_category': 'general', 'suggested_priority': 'medium'}
