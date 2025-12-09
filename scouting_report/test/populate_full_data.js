const fs = require('fs');
const path = require('path');

const RAW_TEXT_PATH = path.join(__dirname, '../../max-freedman-tournament-match-results.txt');
const JSON_PATH = path.join(__dirname, 'max_freedman_input.json');

function parseMatchHistory(text) {
  const matches = [];
  const blocks = text.split('tennis\n').slice(1); // Split by 'tennis' keyword, skip header

  blocks.forEach(block => {
    try {
      const lines = block.trim().split('\n');
      if (lines.length < 10) return;

      // 1. Parse Header Line (e.g., "12:00 AM | Nov 1 | R1 Qualifier")
      const headerLine = lines[0];
      const parts = headerLine.split('|').map(s => s.trim());
      const dateStr = parts[1] + ' 2025'; // Assuming 2025 based on context
      const round = parts[2] || 'Unknown';

      // 2. Identify Player and Opponent
      // Structure usually:
      // USA
      // Max Freedman
      // 11.39
      // [Score Part 1]
      // [Country]
      // [Opponent Name]
      // [Opponent UTR]
      // [Score Part 2]
      
      let maxIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Max Freedman')) {
          maxIndex = i;
          break;
        }
      }

      if (maxIndex === -1) return;

      // Opponent is usually after Max's block
      // Max block is ~4 lines (Country, Name, UTR, Score)
      const opponentCountryIndex = maxIndex + 3; // Rough estimate, need to find next Country code usually
      
      // Better strategy: Filter lines that look like UTRs (numbers with decimals) or Names
      // Let's look for the line with the opponent's name. It's usually 3-4 lines after Max.
      
      let opponentName = "Unknown";
      let opponentUTR = null;
      let scoreLine = "";
      let result = "Unknown";

      // Simple extraction based on fixed offset often fails.
      // Let's try to find the Opponent Name line.
      // It is usually 3 lines after Max's name line if score is on the line after UTR.
      
      const lineAfterMaxUTR = lines[maxIndex + 2]; // Potentially score or part of score
      const potentialOpponentName = lines[maxIndex + 4]; // Country is at +3
      const potentialOpponentUTR = lines[maxIndex + 5];
      
      // Check if we have a valid opponent block
      if (lines[maxIndex + 3] && lines[maxIndex + 3].length === 3) { // Country code like USA, ITA
         opponentName = lines[maxIndex + 4];
         opponentUTR = parseFloat(lines[maxIndex + 5]);
         
         // Score is split. Max's score is at maxIndex+2, Opponent's at maxIndex+6
         // But the text file format is messy: "66" means 6-6? "6409"?
         // We might need to just capture the raw score string if possible.
         // Actually, looking at the file:
         // Max Freedman
         // 11.39
         // 66  <-- Max's games?
         // ITA
         // Vincenzo Loffredo
         // 7.96
         // 22 <-- Opponent's games?
         
         // If score is "66" vs "22", it likely means 6-2, 6-2.
         // Or "6409" vs "4609" -> 6-4, ?? 
         
         // Result Logic:
         // If Max's score line has "Walkover" or "Retired", use that.
         // If Opponent's score line has "Walkover" or "Retired", use that.
         
         const maxScoreRaw = lines[maxIndex + 2];
         const oppScoreRaw = lines[maxIndex + 6];
         
         scoreLine = `${maxScoreRaw || ''} - ${oppScoreRaw || ''}`;
         
         // Determine Result
         if (maxScoreRaw > oppScoreRaw) result = "Win";
         else if (maxScoreRaw < oppScoreRaw) result = "Loss";
         
         // Handle explicit status
         if (block.toLowerCase().includes('walkover')) {
            result = maxScoreRaw && maxScoreRaw.toLowerCase().includes('walkover') ? "Loss" : "Win"; // Rough guess
            scoreLine = "Walkover";
         }
         if (block.toLowerCase().includes('retired')) {
             scoreLine = "Retired";
             // If Max retired, loss.
             if (maxScoreRaw && maxScoreRaw.toLowerCase().includes('retired')) result = "Loss";
             else result = "Win"; 
         }
      }

      // Infer Level from Tournament Name (Not available in snippet, need to pass it in or infer)
      // Actually the tournament name is in the block header in the original file "J60 Boca Raton..."
      // But we split by 'tennis', removing that context.
      // We can regex the full text to map blocks to tournaments, but for now let's just set a generic level if unknown.
      
      matches.push({
        date: dateStr,
        tournament_name: "Tournament (See Source)", // Placeholder, hard to extract without better delimiters
        level: "L4", // Defaulting for test, ideally parsed
        round: round,
        opponent: {
          name: opponentName,
          utr: opponentUTR || 0,
          national_rank: null
        },
        score: scoreLine,
        result: result,
        surface: "Hard", // Most common
        age_division: "B18"
      });

    } catch (e) {
      console.error("Error parsing block:", e);
    }
  });

  return matches;
}

// Override with the simpler manual parsing since the text format is very unstructured
// I will create a simplified list of ~10 key matches from the file manually to ensure accuracy
// rather than writing a fragile parser for that specific messy text dump.
// This ensures the "Golden Sample" is clean.

const FULL_HISTORY = [
  // J60 Boca Raton
  { date: "2025-11-01", tournament_name: "J60 Boca Raton", level: "J60", round: "R1", opponent: { name: "Cristobal Plasencia Robles", utr: 11.45 }, score: "3-6 2-6", result: "Loss", surface: "Clay" },
  { date: "2025-11-01", tournament_name: "J60 Boca Raton (Q)", level: "J60", round: "Q-R3", opponent: { name: "Noah Vinbaytel", utr: 10.54 }, score: "6-1 6-4", result: "Win", surface: "Clay" },
  { date: "2025-11-01", tournament_name: "J60 Boca Raton (Q)", level: "J60", round: "Q-R2", opponent: { name: "Bardo Bucknell", utr: 11.37 }, score: "6-3 6-4", result: "Win", surface: "Clay" },
  
  // Naples L2
  { date: "2025-10-13", tournament_name: "Naples L2", level: "L2", round: "C-F", opponent: { name: "Dhakshish Aryan", utr: 11.65 }, score: "3-6 4-6", result: "Loss", surface: "Hard" },
  { date: "2025-10-13", tournament_name: "Naples L2", level: "L2", round: "C-SF", opponent: { name: "Ivan Rybak", utr: 11.37 }, score: "6-4 6-4", result: "Win", surface: "Hard" },
  { date: "2025-10-12", tournament_name: "Naples L2", level: "L2", round: "C-QF", opponent: { name: "Boden Willis", utr: 10.26 }, score: "6-3 6-1", result: "Win", surface: "Hard" },
  { date: "2025-10-11", tournament_name: "Naples L2", level: "L2", round: "R32", opponent: { name: "James Wakefield", utr: 11.37 }, score: "6-2 4-6 [9-11]", result: "Loss", surface: "Hard" },

  // Battle of Boca Oct
  { date: "2025-10-05", tournament_name: "Battle of Boca", level: "Open", round: "QF", opponent: { name: "Mwendwa Mbithi", utr: 13.34 }, score: "7-5 6-1 1-10", result: "Loss", surface: "Hard" },
  { date: "2025-10-05", tournament_name: "Battle of Boca", level: "Open", round: "R16", opponent: { name: "Yonatan Sagiv", utr: 11.38 }, score: "2-6 6-4 10-3", result: "Win", surface: "Hard" },

  // Battle of Boca Sept
  { date: "2025-09-28", tournament_name: "Battle of Boca", level: "Open", round: "R16", opponent: { name: "Geoff Kosseifi", utr: 10.91 }, score: "6-2 2-6 Retired", result: "Loss", surface: "Hard" },
  
  // Altamonte L3
  { date: "2025-09-13", tournament_name: "Altamonte Springs L3", level: "L3", round: "R16", opponent: { name: "Ivan Rybak", utr: 11.37 }, score: "6-4 0-6 0-6", result: "Loss", surface: "Hard" },
  
  // Kalamazoo Nationals
  { date: "2025-08-01", tournament_name: "Kalamazoo Nationals", level: "L1", round: "R128", opponent: { name: "Nischal Spurling", utr: 12.45 }, score: "1-6 3-6", result: "Loss", surface: "Hard" },
  { date: "2025-08-01", tournament_name: "Kalamazoo Nationals", level: "L1", round: "C-R32-Q", opponent: { name: "Rajat Shirur", utr: 12.57 }, score: "2-6 2-6", result: "Loss", surface: "Hard" },

  // Clay Courts
  { date: "2025-07-06", tournament_name: "Clay Court Nationals", level: "L1", round: "R32", opponent: { name: "Jens Holger Nissen", utr: 11.91 }, score: "5-7 7-6 0-5 Retired", result: "Loss", surface: "Clay" },
  { date: "2025-07-06", tournament_name: "Clay Court Nationals", level: "L1", round: "R64", opponent: { name: "Alexander Walker", utr: 10.43 }, score: "7-5 6-1", result: "Win", surface: "Clay" },

  // Bobby Curtis
  { date: "2025-06-07", tournament_name: "Bobby Curtis", level: "L3", round: "R16", opponent: { name: "Caleb Chow", utr: 11.37 }, score: "7-5 6-7 13-11", result: "Win", surface: "Hard" },
  { date: "2025-06-07", tournament_name: "Bobby Curtis", level: "L3", round: "R64", opponent: { name: "Francesco Padilla", utr: 8.51 }, score: "6-1 6-2", result: "Win", surface: "Hard" },

  // Delray L4
  { date: "2025-05-10", tournament_name: "Delray L4", level: "L4", round: "F", opponent: { name: "Saahil Gupte", utr: 11.41 }, score: "2-6 3-6", result: "Loss", surface: "Clay" },
  { date: "2025-05-10", tournament_name: "Delray L4", level: "L4", round: "QF", opponent: { name: "David Grigoryan", utr: 11.11 }, score: "6-2 6-2", result: "Win", surface: "Clay" }
];

// Read existing JSON
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

// Update Match History
data.match_history = FULL_HISTORY;

// Write back
fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));

console.log(`Successfully updated match_history with ${FULL_HISTORY.length} matches.`);

