# Scouting Report Test Suite

This directory contains test files for generating AI-powered tennis scouting reports.

## Setup

1. **Create a `.env` file** in the project root (if you haven't already):
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   MODEL=x-ai/grok-code-fast-1
   ```

2. **Get your OpenRouter API key** from: https://openrouter.ai/keys

## Files

- `max_freedman_input.json` - Test data following the `raw_input_schema.json` structure
- `test_openrouter.js` - Script to generate reports using OpenRouter API
- `output_*.md` - Generated scouting reports (created when you run the script)

## Usage

Run the test script:

```bash
node scouting_report/test/test_openrouter.js
```

The script will:
1. Load your API key from `.env` file
2. Read the system prompt from `scouting-prompt1.txt`
3. Read the test data from `max_freedman_input.json`
4. Send request to OpenRouter (default: `x-ai/grok-code-fast-1`)
5. Save the generated report as `output_{model}_{timestamp}.md`

## Testing Different Models

You can override the model by setting the `MODEL` environment variable:

```bash
# Use Grok (default)
node scouting_report/test/test_openrouter.js

# Use Claude 3.5 Sonnet
MODEL=anthropic/claude-3.5-sonnet node scouting_report/test/test_openrouter.js

# Use GPT-4o
MODEL=openai/gpt-4o node scouting_report/test/test_openrouter.js

# Use Gemini Pro 1.5
MODEL=google/gemini-pro-1.5 node scouting_report/test/test_openrouter.js
```

Or add `MODEL=model-name` to your `.env` file to change the default.

## Security

⚠️ **Important**: The `.env` file is in `.gitignore` and should NEVER be committed to git. It contains your API key.

