const fs = require('fs');
const path = require('path');

const RAW_TEXT_PATH = path.join(__dirname, '../../max-freedman-tournament-match-results.txt');
const JSON_PATH = path.join(__dirname, 'max_freedman_input.json');

function parseScore(maxScoreRaw, oppScoreRaw) {
  // Normalize
  const s1 = maxScoreRaw ? maxScoreRaw.trim() : "";
  const s2 = oppScoreRaw ? oppScoreRaw.trim() : "";

  // 1. Check for non-numeric status
  if (s1.toLowerCase().includes('walkover') || s2.toLowerCase().includes('walkover')) return "Walkover";
  if (s1.toLowerCase().includes('retired') || s2.toLowerCase().includes('retired') || s1.toLowerCase().includes('withdrew') || s2.toLowerCase().includes('withdrew')) return "Retired";

  // 2. Simple straight sets: "66" vs "22" -> 6-2 6-2
  if (s1.length === s2.length && s1.length > 0) {
    let result = [];
    // Chunk by single chars if length is even? No, "10" is 2 chars.
    // Heuristic: often it's single digit sets like "6" "6" vs "2" "2".
    // If length is 2, assume 2 sets.
    if (s1.length === 2) {
      result.push(`${s1[0]}-${s2[0]}`);
      result.push(`${s1[1]}-${s2[1]}`);
      return result.join(' ');
    }
    // If length is 3 (3 set match): "646" vs "464" -> 6-4 4-6 6-4
    if (s1.length === 3) {
      result.push(`${s1[0]}-${s2[0]}`);
      result.push(`${s1[1]}-${s2[1]}`);
      result.push(`${s1[2]}-${s2[2]}`);
      return result.join(' ');
    }
  }

  // 3. Tiebreaks or complex: "6409" vs "26111"
  // Heuristic: Align set by set.
  if (s1.length >= 3 && s2.length >= 3) {
      const sets = [];
      // Set 1
      sets.push(`${s1[0]}-${s2[0]}`);
      // Set 2
      sets.push(`${s1[1]}-${s2[1]}`);
      
      // Set 3 / TB
      const r1 = s1.substring(2);
      const r2 = s2.substring(2);
      
      // If remaining is numeric, treat as games or points
      if (r1.length > 0 && r2.length > 0) {
          // If it looks like a match tiebreak (high numbers), wrap in brackets?
          // Or just append.
          // Handle "09" vs "11" -> "9-11"
          const p1 = parseInt(r1);
          const p2 = parseInt(r2);
          
          // If it's a match tiebreak, usually it decides the match.
          // Let's format as [p1-p2] if it looks like points (e.g. > 7 or sum > 12)
          if (p1 > 6 || p2 > 6) {
             sets.push(`[${p1}-${p2}]`);
          } else {
             sets.push(`${p1}-${p2}`);
          }
      }
      return sets.join(' ');
  }

  return `${s1}-${s2}`; 
}

function determineResult(maxScoreRaw, oppScoreRaw) {
  const s1 = maxScoreRaw ? maxScoreRaw.trim() : "";
  const s2 = oppScoreRaw ? oppScoreRaw.trim() : "";

  // Walkover/Withdrawal Logic
  // Usually if the text "walkover" is under opponent, Max won.
  if (s2.toLowerCase().includes('walkover') || s2.toLowerCase().includes('withdrew')) return "Win";
  if (s1.toLowerCase().includes('walkover') || s1.toLowerCase().includes('withdrew')) return "Loss"; // Max gave WO

  // Retired Logic
  // If "Retired" appears in the block header (not captured here), we need to see who has fewer games? 
  // Or check if "Retired" is next to a name.
  // In the text:
  // Max Freedman
  // 62
  // Opponent
  // 26
  // (Retired above or below?)
  
  // Heuristic: Compare score length or values?
  // Let's assume if Max has higher numbers, he likely won.
  // "66" > "22" -> Win.
  // "34" < "66" -> Loss.
  
  // Remove non-digits
  const n1 = parseInt(s1.replace(/\D/g,'')) || 0;
  const n2 = parseInt(s2.replace(/\D/g,'')) || 0;
  
  if (n1 > n2) return "Win";
  if (n2 > n1) return "Loss";
  
  return "Unknown";
}

try {
  const rawText = fs.readFileSync(RAW_TEXT_PATH, 'utf8');
  
  // Split into blocks by 'tennis' keyword
  const rawBlocks = rawText.split(/\ntennis\n/);
  
  // First block is header/stats summary, skip or extract summary if needed
  // Subsequent blocks are matches.
  
  const matches = [];
  
  // Current Tournament Context (state machine)
  let currentTournament = "Unknown Tournament";
  
  for (let i = 1; i < rawBlocks.length; i++) { // Start at 1 to skip file header
    const block = rawBlocks[i];
    const lines = block.trim().split('\n').map(l => l.trim());
    
    if (lines.length < 5) continue;

    // 1. Extract Date/Round from first line (e.g. "12:00 AM | Nov 1 | R1 Qualifier")
    const headerParts = lines[0].split('|');
    const dateStr = headerParts[1] ? headerParts[1].trim() + " 2025" : "Unknown Date";
    const round = headerParts[2] ? headerParts[2].trim() : "Unknown Round";
    
    // 2. Attempt to find Tournament Name from previous block or context?
    // The tournament name appears in the text *between* match blocks sometimes.
    // But rawBlocks split removes that context if not careful.
    // Actually, the tournament name is usually at the END of the previous block if we split by 'tennis'.
    // Let's look at the tail of the PREVIOUS block.
    const prevBlock = rawBlocks[i-1];
    const prevLines = prevBlock.trim().split('\n');
    // Look for lines that look like headers (all caps, or dates) in the last few lines of prev block
    // E.g. "J60 Boca Raton Boys Qualifying Draw \n OCT 27 - NOV 1"
    
    // Heuristic: Check last 3 lines of previous block for Date Range pattern "MMM DD - DD"
    let foundTourney = false;
    for (let j = prevLines.length - 1; j >= Math.max(0, prevLines.length - 5); j--) {
        if (prevLines[j].match(/[A-Z]{3} \d+ -/)) {
            // The line BEFORE this date line is the tournament name
            if (j > 0) {
                currentTournament = prevLines[j-1];
                foundTourney = true;
            }
        }
    }
    
    // 3. Find Max Freedman and Opponent
    let maxIndex = -1;
    lines.forEach((line, idx) => {
        if (line.includes('Max Freedman')) maxIndex = idx;
    });
    
    if (maxIndex === -1) continue;
    
    // Max's Score is usually at maxIndex + 2 (after UTR)
    const maxScoreRaw = lines[maxIndex + 2];
    
    // Opponent Name is usually maxIndex + 4 (Country, Name)
    // Sometimes Country is missing?
    // Check line at maxIndex + 3. If len=3 (USA), Opponent is at +4.
    // If len > 3, maybe Opponent is at +3?
    let oppName = "Unknown";
    let oppUTR = 0;
    let oppScoreRaw = "";
    
    if (lines[maxIndex + 3] && lines[maxIndex + 3].length === 3 && lines[maxIndex + 3] === lines[maxIndex + 3].toUpperCase()) {
        oppName = lines[maxIndex + 4];
        oppUTR = parseFloat(lines[maxIndex + 5]);
        oppScoreRaw = lines[maxIndex + 6];
    } else {
        // Assume no country code?
        oppName = lines[maxIndex + 3];
        oppUTR = parseFloat(lines[maxIndex + 4]);
        oppScoreRaw = lines[maxIndex + 5];
    }
    
    // 4. Parse Score and Result
    const score = parseScore(maxScoreRaw, oppScoreRaw);
    const result = determineResult(maxScoreRaw, oppScoreRaw);
    
    // 5. Level Inference
    let level = "Other";
    const tName = currentTournament.toUpperCase();
    if (tName.includes('J60')) level = "J60";
    else if (tName.includes('J100')) level = "J100";
    else if (tName.includes('J30')) level = "J30";
    else if (tName.includes('L1')) level = "L1";
    else if (tName.includes('L2')) level = "L2";
    else if (tName.includes('L3')) level = "L3";
    else if (tName.includes('L4')) level = "L4";
    else if (tName.includes('OPEN')) level = "Open";
    else if (tName.includes('HS') || tName.includes('HIGH SCHOOL')) level = "High School";

    matches.push({
        date: dateStr,
        tournament_name: currentTournament,
        level: level,
        round: round,
        opponent: {
            name: oppName,
            utr: oppUTR,
            national_rank: null // Not available in this text dump
        },
        score: score,
        result: result,
        surface: "Hard", // Default, would need tourney metadata to know specifically
        age_division: "B18" // Default
    });
  }
  
  console.log(`Parsed ${matches.length} matches.`);
  
  // Write to JSON
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  data.match_history = matches;
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
  console.log("Updated max_freedman_input.json successfully.");

} catch (e) {
  console.error("Error:", e);
}

