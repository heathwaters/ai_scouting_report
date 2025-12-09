const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'max_freedman_input.json');
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

let tbLosses = 0;
const details = [];

data.match_history.forEach(m => {
  if (m.result === 'Loss') {
    // Check for 3rd set TB patterns
    // 1. Bracket TB: [9-11]
    // 2. Set score: 6-7 or 7-6 in 3rd position
    // 3. Match TB: 1-0(X)
    
    // Normalize score string
    const s = m.score.replace(/\s+/g, ' ');
    
    // Match patterns
    const isBracketTB = s.match(/\[\d+-\d+\]/);
    const sets = s.split(' ');
    const isThirdSetTB = sets.length >= 3 && (sets[2].includes('7-6') || sets[2].includes('6-7') || sets[2].includes('1-0'));
    
    if (isBracketTB || isThirdSetTB) {
      tbLosses++;
      details.push(`${m.date}: Lost to ${m.opponent.name} (${m.score})`);
    }
  }
});

console.log(`Total 3rd Set/Match Tiebreak Losses: ${tbLosses}`);
console.log('Details:');
details.forEach(d => console.log(d));













