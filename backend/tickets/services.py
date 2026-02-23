"""Google Gemini API integration service for ticket classification."""
import json
import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)

CLASSIFICATION_PROMPT = """You are a support ticket classifier. Analyze the following support ticket description and classify it.

Categories (pick exactly one):
- billing: Payment issues, invoices, charges, subscriptions, refunds
- technical: Bugs, errors, crashes, performance issues, feature not working
- account: Login issues, password reset, profile changes, permissions
- general: General inquiries, feedback, feature requests, other

Priorities (pick exactly one):
- low: Minor issues, general questions, no urgency
- medium: Standard issues affecting normal usage
- high: Significant impact on user, needs prompt attention
- critical: System down, security breach, data loss, urgent

Respond with ONLY valid JSON in this exact format:
{{"suggested_category": "<category>", "suggested_priority": "<priority>", "confidence_score": <0.0-1.0>}}

Ticket description:
{description}"""

VALID_CATEGORIES = {'billing', 'technical', 'account', 'general'}
VALID_PRIORITIES = {'low', 'medium', 'high', 'critical'}

FALLBACK_RESPONSE = {
    'suggested_category': 'general',
    'suggested_priority': 'medium',
    'confidence_score': 0.0,
}


def classify_ticket(description: str, max_retries: int = 2, timeout: int = 30) -> dict:
    """
    Classify a ticket description using Google Gemini API.
    Includes retry mechanism, timeout handling, and graceful fallback.
    Tries multiple models if one is rate-limited.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — returning fallback classification.")
        return {**FALLBACK_RESPONSE, 'error': 'API key not configured'}

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return {**FALLBACK_RESPONSE, 'error': str(e)}

    prompt = CLASSIFICATION_PROMPT.format(description=description)
    models_to_try = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']

    for model_name in models_to_try:
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"Classification: model={model_name}, attempt {attempt}/{max_retries}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1,
                        max_output_tokens=150,
                    ),
                )

                content = response.text.strip()
                result = _parse_response(content)
                if result:
                    return result

                logger.warning(f"Could not parse response from {model_name}: {content}")

            except Exception as e:
                error_str = str(e).lower()
                logger.error(f"{model_name} attempt {attempt}: {e}")
                # If rate limited, skip remaining retries for this model
                if 'quota' in error_str or 'rate' in error_str or '429' in error_str:
                    logger.info(f"Rate limited on {model_name}, trying next model...")
                    break

            if attempt < max_retries:
                time.sleep(2)

    logger.error("All classification attempts failed — returning fallback.")
    return {**FALLBACK_RESPONSE, 'error': 'Classification failed after retries'}


def _parse_response(content: str) -> dict | None:
    """Parse and validate the LLM JSON response."""
    import re

    # Try direct JSON parse
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks or raw text
        match = re.search(r'\{[^}]+\}', content)
        if match:
            try:
                data = json.loads(match.group())
            except json.JSONDecodeError:
                return None
        else:
            return None

    # Validate fields
    category = data.get('suggested_category', '').lower()
    priority = data.get('suggested_priority', '').lower()
    confidence = data.get('confidence_score', 0.0)

    if category not in VALID_CATEGORIES:
        category = 'general'
    if priority not in VALID_PRIORITIES:
        priority = 'medium'

    try:
        confidence = float(confidence)
        confidence = max(0.0, min(1.0, confidence))
    except (TypeError, ValueError):
        confidence = 0.5

    return {
        'suggested_category': category,
        'suggested_priority': priority,
        'confidence_score': round(confidence, 2),
    }
