const fs = require('fs');
const path = require('path');

const RAW_USTA_PATH = path.join(__dirname, 'usta_player_record_raw.json');
const JSON_PATH = path.join(__dirname, 'max_freedman_input.json');

// Helper to normalize level codes
function normalizeLevel(level) {
  if (!level) return "Other";
  const l = level.toUpperCase();
  if (l.includes('LEVEL 1') || l.includes('L1')) return "L1";
  if (l.includes('LEVEL 2') || l.includes('L2')) return "L2";
  if (l.includes('LEVEL 3') || l.includes('L3')) return "L3";
  if (l.includes('LEVEL 4') || l.includes('L4')) return "L4";
  if (l.includes('LEVEL 5') || l.includes('L5')) return "L5";
  if (l.includes('LEVEL 6') || l.includes('L6')) return "L6";
  if (l.includes('J30')) return "J30";
  if (l.includes('J60')) return "J60";
  if (l.includes('J100')) return "J100";
  if (l.includes('J300')) return "J300";
  return "Other";
}

// Helper to normalize draw type
function normalizeDrawType(drawType) {
  if (!drawType) return "Main";
  const dt = drawType.toUpperCase();
  if (dt.includes('FULL FEED') || dt.includes('FIC')) return "FIC";
  if (dt.includes('COMPASS')) return "Compass";
  if (dt.includes('SINGLE ELIMINATION') || dt.includes('SE')) return "Main";
  if (dt.includes('CONSOLATION')) return "Consolation";
  if (dt.includes('QUALIFIER') || dt.includes('QUALIFYING')) return "Qualifier";
  return "Main";
}

// Helper to normalize age division
function normalizeAgeDivision(division) {
  if (!division) return "B18";
  if (division.includes("18")) return "B18";
  if (division.includes("16")) return "B16";
  if (division.includes("14")) return "B14";
  return "B18";
}

// Helper to determine result
function determineResult(outcome, status) {
  if (status === "WALKOVER" || status === "BYE") {
    return outcome === "W" ? "Win" : "Loss";
  }
  if (status === "RETIRED") {
    return "Retirement";
  }
  if (outcome === "W") return "Win";
  if (outcome === "L") return "Loss";
  return "Unknown";
}

// Helper to extract date from ISO string
function extractDate(isoString) {
  if (!isoString) return null;
  return isoString.split('T')[0]; // "2025-10-27"
}

try {
  // Read raw USTA data
  const rawData = JSON.parse(fs.readFileSync(RAW_USTA_PATH, 'utf8'));
  
  // Extract all SINGLES matches
  const singlesMatches = [];
  
  rawData.events.forEach(event => {
    // Only process SINGLES events
    if (event.matchFormat !== "Singles") return;
    
    const tournamentName = event.displayName || event.name;
    const level = normalizeLevel(event.level);
    const drawType = normalizeDrawType(event.drawType);
    const ageDivision = normalizeAgeDivision(event.division);
    const location = `${event.organizationCity || ''}, ${event.organizationState || ''}`.trim();
    
    // Process each round/match
    event.rounds.forEach(round => {
      if (!round.opponents || round.opponents.length === 0) return; // Skip BYEs
      
      const opponent = round.opponents[0]; // First opponent (singles has one)
      
      singlesMatches.push({
        date: extractDate(round.matchDate),
        tournament_name: tournamentName,
        level: level,
        round: round.round || round.roundName,
        draw_type: drawType,
        opponent: {
          name: opponent.name,
          utr: opponent.utrDec ? parseFloat(opponent.utrDec) : (opponent.utr ? parseFloat(opponent.utr) : null),
          wtn: opponent.wtn_singles ? parseFloat(opponent.wtn_singles) : null,
          national_rank: opponent.nationalRank && opponent.nationalRank !== "" ? parseInt(opponent.nationalRank) : null
        },
        score: round.results || "",
        result: determineResult(round.outcome, round.status),
        age_division: ageDivision,
        location: location,
        surface: "Hard" // Default, USTA API doesn't always provide this
      });
    });
  });
  
  // Sort by date (most recent first)
  singlesMatches.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date) - new Date(a.date);
  });
  
  console.log(`Extracted ${singlesMatches.length} singles matches from USTA record.`);
  
  // Read existing JSON
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  
  // Update match_history
  data.match_history = singlesMatches;
  
  // Write back
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
  
  console.log(`Successfully updated max_freedman_input.json with ${singlesMatches.length} singles matches.`);
  console.log(`Date range: ${singlesMatches[singlesMatches.length - 1]?.date} to ${singlesMatches[0]?.date}`);
  
} catch (error) {
  console.error("Error:", error.message);
  console.error(error.stack);
}













