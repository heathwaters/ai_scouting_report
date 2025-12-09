const fs = require('fs');
const path = require('path');

// Paths
const RAW_PATH = path.join(__dirname, 'usta_player_record_raw.json');
const INPUT_JSON_PATH = path.join(__dirname, 'max_freedman_input.json');

function mapLevel(levelStr = '') {
  if (!levelStr) return 'Other';
  const s = levelStr.toUpperCase();
  if (s.includes('LEVEL 1')) return 'L1';
  if (s.includes('LEVEL 2')) return 'L2';
  if (s.includes('LEVEL 3')) return 'L3';
  if (s.includes('LEVEL 4')) return 'L4';
  if (s.includes('LEVEL 5')) return 'L5';
  if (s.includes('LEVEL 6')) return 'L6';
  if (s.includes('J30')) return 'J30';
  if (s.includes('J60')) return 'J60';
  if (s.includes('J100')) return 'J100';
  return 'Other';
}

function mapDrawType(drawType = '') {
  const s = drawType.toLowerCase();
  if (s.includes('full feed')) return 'FIC';
  if (s.includes('compass')) return 'Compass';
  if (s.includes('first match losers')) return 'FIC';
  if (s.includes('single elimination')) return 'Main';
  return 'Main';
}

function mapAgeDivision(division = '') {
  // e.g. "Boys' 18 & under singles" -> "B18"
  const m = division.match(/Boys'?\\s*(\\d+)/i);
  if (m) return `B${m[1]}`;
  const g = division.match(/Girls'?\\s*(\\d+)/i);
  if (g) return `G${g[1]}`;
  return 'Unknown';
}

function mapResult(outcome = '', status = '') {
  const o = (outcome || '').toUpperCase();
  const st = (status || '').toUpperCase();
  if (st === 'WALKOVER' || st.startsWith('WALKOVER')) return 'Walkover';
  if (st === 'RETIRED' || st === 'RJ') return 'Retirement';
  if (o === 'W') return 'Win';
  if (o === 'L') return 'Loss';
  return 'Loss';
}

try {
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
  const events = raw.events || [];

  const singlesMatches = [];

  for (const ev of events) {
    // Only Singles events
    if ((ev.matchFormat || '').toLowerCase() !== 'singles') continue;

    const rounds = ev.rounds || [];
    for (const r of rounds) {
      const opponents = r.opponents || [];
      const opp = opponents[0] || {};

      let dateStr = null;
      try {
      const matchDate = r.matchDate ? new Date(r.matchDate) : null;
        if (matchDate && !isNaN(matchDate.getTime())) {
          dateStr = matchDate.toISOString().slice(0, 10);
        }
      } catch (e) {
        console.warn(`Invalid date for match: ${r.matchDate}`, e.message);
      }

      const state = ev.organizationState || '';
      const stateCode = state.includes('-') ? state.split('-').pop() : state;
      const location =
        ev.organizationCity && stateCode
          ? `${ev.organizationCity}, ${stateCode}`
          : ev.organizationCity || '';

      singlesMatches.push({
        date: dateStr,
        tournament_name: ev.displayName || ev.name || '',
        level: mapLevel(ev.level),
        round: r.round || r.roundName || '',
        draw_type: mapDrawType(ev.drawType),
        age_division: mapAgeDivision(ev.division),
        location,
        opponent: {
          name: opp.name || null,
          utr: opp.utrDec ? parseFloat(opp.utrDec) : (opp.utr ? parseFloat(opp.utr) : null),
          wtn: opp.wtn_singles ? parseFloat(opp.wtn_singles) : null,
          national_rank: opp.nationalRank && opp.nationalRank !== '' ? parseInt(opp.nationalRank, 10) : null
        },
        score: r.results || '',
        result: mapResult(r.outcome, r.status || r.matchStatusCode),
        surface: 'Hard' // Default; USTA API doesn't expose surface here
      });
    }
  }

  console.log(`Parsed ${singlesMatches.length} singles matches from USTA record.`);

  const data = JSON.parse(fs.readFileSync(INPUT_JSON_PATH, 'utf8'));
  data.match_history = singlesMatches;
  fs.writeFileSync(INPUT_JSON_PATH, JSON.stringify(data, null, 2));

  console.log(`Updated match_history in max_freedman_input.json.`);
} catch (err) {
  console.error('Error parsing USTA player record:', err.message);
}


