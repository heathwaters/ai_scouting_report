// Load environment variables from .env file
const dotenvPath = require('path').join(__dirname, '../../.env');
console.log('Loading .env from:', dotenvPath);
const result = require('dotenv').config({ path: dotenvPath });

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('.env loaded successfully');
}

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || 'anthropic/claude-sonnet-4.5'; // Default model
const SYSTEM_PROMPT_PATH = path.join(__dirname, 'scouting-prompt-v8.txt');
const INPUT_DATA_PATH = path.join(__dirname, 'max_freedman_input.json');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const OUTPUT_DIR = __dirname;

if (!API_KEY) {
  console.error('Error: OPENROUTER_API_KEY environment variable is required.');
  console.error('Usage: OPENROUTER_API_KEY=your_key node test_openrouter.js');
  process.exit(1);
}

// Simple Markdown to HTML parser
function parseMarkdown(markdown) {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Code blocks
    .replace(/```json([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Lists
    .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/gim, '') // Merge adjacent lists
    // Line breaks
    .replace(/\n/gim, '<br>');
}

async function main() {
  try {
    // 1. Read Files
    console.log('Reading input files...');
    const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
    const inputData = fs.readFileSync(INPUT_DATA_PATH, 'utf8');
    const htmlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // 2. Construct the Messages
    // Append explicit instruction for Markdown format
    const finalUserMessage = `
    Here is the raw player data in JSON format:
    
    ${inputData}
    
    IMPORTANT: Please generate the output in standard MARKDOWN format, not JSON. 
    Follow the structure:
    # Comprehensive Scouting Report
    ## [Player Name]
    ... (sections like Psychological Profile, Tactical Blueprint, etc.)
    `;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: finalUserMessage
      }
    ];

    // 3. Send to OpenRouter
    console.log(`Sending request to OpenRouter (Model: ${MODEL})...`);
    
    const requestBody = JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Tennis Scouting Report Dev'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = JSON.parse(data);
          const markdownContent = response.choices[0].message.content;
          
          // 4. Convert to HTML and Save
          const htmlContent = parseMarkdown(markdownContent);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const modelName = MODEL.replace(/\//g, '-');
          
          const finalHtml = htmlTemplate
            .replace('{{MODEL_NAME}}', MODEL)
            .replace('{{TIMESTAMP}}', new Date().toLocaleString())
            .replace('{{CONTENT}}', htmlContent);

          const filename = `report_${modelName}_${timestamp}.html`;
          const outputPath = path.join(OUTPUT_DIR, filename);

          fs.writeFileSync(outputPath, finalHtml);
          console.log(`Success! Report saved to: ${outputPath}`);
        } else {
          console.error(`API Error: ${res.statusCode}`);
          console.error(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
    });

    req.write(requestBody);
    req.end();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
