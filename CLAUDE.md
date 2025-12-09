# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Match Tennis AI - An AI-powered competitive intelligence platform for junior tennis players that provides opponent scouting reports, match predictions, and performance analytics using LLM technology.

## Development Commands

### Running Tests
```bash
# Test AI scouting report generation with OpenRouter API
node scouting_report/test/test_openrouter.js

# Test with different models
MODEL=anthropic/claude-3.5-sonnet node scouting_report/test/test_openrouter.js
MODEL=openai/gpt-4o node scouting_report/test/test_openrouter.js
MODEL=google/gemini-2.5-flash node scouting_report/test/test_openrouter.js
```

### Data Processing Scripts
```bash
# Parse USTA player records
node scouting_report/test/parse_usta_record.js

# Convert USTA records to match history format
node scouting_report/test/parse_usta_to_match_history.js

# Populate full data for testing
node scouting_report/test/populate_full_data_v2.js

# Count tiebreak losses in match data
node scouting_report/test/count_tb_losses.js
```

### Environment Setup
- Create `.env` file in project root with:
  - `OPENROUTER_API_KEY=sk-or-v1-your-api-key-here`
  - `MODEL=x-ai/grok-code-fast-1` (or preferred model)

## Architecture Overview

### Core Components

1. **AI Scouting System** (`/scouting_report/`)
   - Generates opponent analysis reports using LLMs
   - Processes USTA match history data
   - Creates HTML/Markdown formatted reports
   - Supports multiple AI models via OpenRouter API

2. **Data Schema** 
   - Input schema: `/scouting_report/raw_input_schema.json`
   - Player data format: USTA player records with match history
   - Supports UTR ratings, rankings, and detailed match results

3. **Pricing & Credit System**
   - Free tier: Basic features, no AI
   - Pro tier ($12.99/mo): 100 AI credits, weekend bonus
   - Elite tier ($29.99/mo): 500 credits, rollover, advanced features
   - Team/Coach tier ($99/mo): Unlimited AI for roster

4. **AI Features & Credit Costs**
   - AI Scouting Report: 20 credits
   - Match Win Probability: 5 credits  
   - UTR Trajectory Forecast: 8 credits
   - Tournament Difficulty: 4 credits
   - Weekly Summary: 3 credits

### Technology Stack

- **Backend**: Node.js (current test scripts)
- **AI Integration**: OpenRouter API for LLM access
- **Data Processing**: JavaScript utilities for USTA data parsing
- **Report Generation**: HTML/Markdown templates
- **Planned Stack** (from strategy docs):
  - Frontend: React Native
  - Database: PostgreSQL + Redis
  - Payments: Stripe + RevenueCat
  - Hosting: AWS/Vercel

### Key Files & Directories

- `/scouting_report/test/` - Testing scripts and sample data
- `/scouting_report/test/scouting-prompt-v*.txt` - AI prompt iterations
- `/scouting_report/test/max_freedman_input.json` - Sample player data
- `/scouting_report/raw_input_schema.json` - Data structure definition
- `IMPLEMENTATION_PLAN.md` - Detailed 8-week launch roadmap
- `AI_PRODUCT_STRATEGY.md` - Product vision and pricing tiers

### Development Guidelines

1. **AI Prompt Engineering**
   - Test prompts with multiple models for consistency
   - Optimize for token usage (target $0.12-0.15 per report)
   - Cache results to reduce API costs

2. **Data Processing**
   - Parse USTA records accurately
   - Handle missing/incomplete data gracefully
   - Validate against raw_input_schema.json

3. **Report Generation**
   - Generate both HTML and Markdown formats
   - Include confidence scores and disclaimers
   - Keep reports concise and actionable

4. **Testing**
   - Test with real player data when available
   - Validate AI outputs for accuracy
   - Monitor generation time (<15 seconds target)

## Important Notes

- API keys should never be committed (use .env file)
- Current focus: AI scouting report MVP
- Launch target: January 2026
- Beta testing planned with 50 users