# Schema Coverage Analysis: Input Schema vs. Output Template

## ✅ FULLY SUPPORTED (Can Calculate from Current Schema)

### 1. Performance Analytics
- **Win/Loss Ratio:** ✅ `match_history.result`
- **Match Outcome Patterns:** ✅ `match_history.score` + `match_history.result`
- **Score Line Analysis:** ✅ `match_history.score` (can parse margins, decisive sets)
- **Tiebreak Performance:** ✅ `match_history.score` (contains `[9-11]`, `7-6` patterns)
- **Set Win Percentage:** ✅ `match_history.score` (can parse sets won/lost)

### 2. Competition Level Analysis (PARTIAL)
- **Tournament Level Performance:** ✅ `match_history.level`
- **Round Performance:** ✅ `match_history.round`
- **Opponent Quality Analysis:** ✅ `match_history.opponent.utr`, `match_history.opponent.national_rank`
- **Big Match Performance:** ✅ `match_history.round` (can filter for "F", "SF", "QF")
- **Age Division Performance:** ❌ **MISSING** - Need `age_division` field in `match_history`

### 3. Rating & Ranking Analytics (PARTIAL)
- **WTN Analysis:** ✅ `player_profile.wtn` + `match_history.opponent.wtn`
- **National Ranking Progression:** ❌ **MISSING** - Need historical `national_rank` snapshots (only have current)
- **Rating vs Performance Gap:** ✅ Can calculate from current ratings vs. win rate
- **Opponent Rating Analysis:** ✅ `match_history.opponent.utr/wtn/national_rank`
- **UTR Trajectory:** ❌ **MISSING** - Need historical UTR snapshots (only have current)

### 4. Surface Performance
- **Surface-Specific Records:** ✅ `match_history.surface`
- **Surface Preferences:** ✅ Can calculate from `match_history.surface` + win rates
- **Top 6 Results by Surface:** ✅ `ranking_snapshot.top_6_events` + `match_history.surface` (needs join)
- **Surface Adaptability:** ✅ Can calculate variance across surfaces

### 5. Point Defense & Pressure Analysis
- **Top 6 Points Breakdown:** ✅ `ranking_snapshot.top_6_events`
- **Points Expiration Timeline:** ✅ `ranking_snapshot.top_6_events.date` (calculate +52 weeks)
- **Point Defense Pressure:** ✅ `ranking_snapshot.next_drop_off` + `current_points`
- **Bonus Points Performance:** ✅ `ranking_snapshot.top_6_events.bonus_points`
- **Points per Tournament:** ✅ `ranking_snapshot.top_6_events.points_earned`

### 6. Temporal & Scheduling Analytics
- **Activity Level:** ✅ `match_history.date` (can calculate frequency)
- **Recent Form:** ✅ `match_history.date` + `result` (last 5/10/20)
- **Seasonal Performance:** ✅ `match_history.date` (can extract month/season)
- **Tournament Date Patterns:** ✅ `match_history.date`
- **Match Load Analysis:** ✅ `match_history.date` (can calculate consecutive days)

### 7. Strategic Pattern Recognition
- **Tournament Selection Strategy:** ✅ `match_history.level` (can analyze distribution)
- **Risk Tolerance:** ✅ `match_history.opponent.utr` vs. `player_profile.utr`
- **Point Optimization:** ✅ `ranking_snapshot.top_6_events` + `match_history.level`
- **Consistency Patterns:** ✅ `match_history.result` (can calculate variance)

### 8. Head-to-Head & Competitive Context
- **Direct H2H Record:** ✅ `match_history.opponent.name` (can group by opponent)
- **Common Opponent Analysis:** ✅ `match_history.opponent.name` (can find shared opponents)
- **Peer Group Performance:** ✅ `match_history.opponent.utr` (can filter similar UTR range)
- **Upset Frequency:** ✅ `match_history.opponent.utr` vs. `player_profile.utr` + `result`

### 9. Momentum & Confidence Indicators
- **Winning/Losing Streaks:** ✅ `match_history.date` + `result` (ordered by date)
- **Breakthrough Performance:** ✅ `match_history.opponent.national_rank` + `result` (can find big wins)
- **Slump Identification:** ✅ `match_history.date` + `result` (can find losing streaks)
- **Recovery Analysis:** ✅ `match_history.date` + `result` (can find bounce-back patterns)

### 10. Predictive & Confidence Metrics
- **Match Count Reliability:** ✅ `match_history.length` (array size)
- **Recency Weighting:** ✅ `match_history.date` (can calculate days since last match)
- **Performance Consistency:** ✅ `match_history.result` (can calculate variance)
- **Expected Outcome Probability:** ✅ Can calculate from historical win rates
- **Upset Risk Assessment:** ✅ Can calculate from opponent rating differentials

### 11. Comparative Analytics (PARTIAL)
- **Strength of Schedule:** ✅ `match_history.opponent.utr/wtn/national_rank` (can calculate average)
- **Points Efficiency:** ✅ `ranking_snapshot.current_points` / `match_history.length`
- **Ranking Efficiency:** ✅ `player_profile.national_rank` vs. `player_profile.utr/wtn`
- **Percentile Rankings:** ❌ **MISSING** - Would need external peer group dataset

### 12. Weakness & Vulnerability Identification
- **Performance Gaps:** ✅ Can identify from `match_history.level` + win rate drops
- **Level Ceiling:** ✅ `match_history.level` + `result` (find highest level with wins)
- **Pressure Performance:** ✅ `match_history.round` (finals, semis) + `result`
- **Inconsistency Patterns:** ✅ `match_history.result` + various filters (level, surface, etc.)

### Additional Analysis Sections

#### Ranking Inflation/Deflation Analysis
- **National Ranking vs. UTR/WTN Discrepancy:** ✅ `player_profile.national_rank` vs. `utr/wtn`
- **Opponent Quality Score:** ✅ `match_history.opponent.utr/wtn/national_rank`
- **Rating Velocity Discrepancy:** ❌ **MISSING** - Need historical snapshots

#### Competition Selection & Strategic Play Patterns
- **Tournament Tier Distribution:** ✅ `match_history.level` (can categorize tiers)
- **Geographic Competition Radius:** ❌ **MISSING** - Need `tournament_location` or `opponent.location`
- **Draw Position Advantage Rate:** ❌ **MISSING** - Need `seeding` or `draw_position` field
- **Bye & Walkover Rate:** ✅ `match_history.result` (can filter "Walkover")

#### Advanced Performance Metrics
- **Close Match Performance Index:** ✅ `match_history.score` (can parse tiebreaks, 3rd sets)
- **Upset Rate (Both Directions):** ✅ `match_history.opponent.utr` vs. `player_profile.utr` + `result`
- **Surface Transition Adaptability:** ✅ `match_history.surface` + `date` (can find surface switches)
- **Competition Density Impact:** ✅ `match_history.date` (can calculate matches per week)
- **Serve Hold Rate by Set Position:** ✅ `match_telemetry.sets` (can calculate per set)
- **Return Game Aggression Index:** ✅ `match_telemetry.totals` (break points, return stats)

#### Temporal & Situational Intelligence
- **Rest Days Optimal Window:** ✅ `match_history.date` (can calculate rest days between matches)
- **Tournament Week Position Performance:** ✅ `match_history.date` + `round` (can track progression)
- **Match Duration Tolerance:** ❌ **MISSING** - Need `match_duration` or `total_points_played`
- **Time-of-Day Performance:** ❌ **MISSING** - User explicitly removed weather/time data

#### Opponent Quality & Performance Level Analysis
- **Average Win Threshold Metrics:** ✅ `match_history.opponent.utr/wtn/national_rank` + `result="Win"`
- **Average Loss Threshold Metrics:** ✅ `match_history.opponent.utr/wtn/national_rank` + `result="Loss"`
- **Competitive Range Index:** ✅ Can calculate from win/loss thresholds
- **Rating System Performance Comparison:** ✅ Can compare across UTR/WTN/national_rank
- **Opponent Quality Trend Analysis:** ✅ `match_history.date` + `opponent.utr` (can track trends)

#### Consolation Draw (FIC) Performance Analysis
- **Main Draw vs. Consolation Win Rate:** ✅ `match_history.draw_type` ("Main" vs "FIC")
- **Consolation Draw Commitment Score:** ✅ `match_history.draw_type="FIC"` + `result` (can find withdrawals)
- **Bounce-Back Performance Index:** ✅ `match_history.date` + `draw_type` (can find FIC after Main loss)
- **Consolation Draw Opponent Quality:** ✅ `match_history.draw_type="FIC"` + `opponent.utr`
- **Point Recovery Strategy via Consolation:** ✅ `match_history.draw_type="FIC"` + points (if available)

---

## ❌ CRITICAL GAPS (Cannot Calculate from Current Schema)

### 1. **Age Division Field**
- **Missing:** `age_division` in `match_history` (e.g., "B18", "B16")
- **Impact:** Cannot analyze "Age Division Performance" (competing up/down)
- **Fix:** Add `"age_division": { "type": "string", "example": "B18" }` to `match_history` items

### 2. **Historical Rating Snapshots**
- **Missing:** Array of `{ date, utr, wtn, national_rank }` over time
- **Impact:** Cannot calculate "UTR Trajectory" or "National Ranking Progression"
- **Fix:** Add `"rating_history"` array to `player_profile`:
  ```json
  "rating_history": [
    { "date": "2025-01-01", "utr": 11.2, "wtn": 20.1, "national_rank": 180 },
    { "date": "2025-06-01", "utr": 11.4, "wtn": 19.9, "national_rank": 165 }
  ]
  ```

### 3. **Geographic Data**
- **Missing:** `tournament_location` or `opponent.location`
- **Impact:** Cannot analyze "Geographic Competition Radius"
- **Fix:** Add `"location": { "city": "Naples", "state": "FL", "country": "USA" }` to `match_history` items

### 4. **Draw Position/Seeding**
- **Missing:** `seeding` or `draw_position` field
- **Impact:** Cannot analyze "Draw Position Advantage Rate"
- **Fix:** Add `"seeding": { "type": "integer", "example": 8 }` to `match_history` items (optional, as not all tournaments seed)

### 5. **Match Duration**
- **Missing:** `match_duration` or `total_points_played`
- **Impact:** Cannot analyze "Match Duration Tolerance"
- **Fix:** Add `"match_duration_minutes": { "type": "integer" }` to `match_history` items (optional, may not always be available)

### 6. **Match Telemetry Enhancement**
- **Current:** Has basic totals, sets, games
- **Missing:** More granular return stats (FH/BH return winners/errors separately)
- **Impact:** "Return Game Aggression Index" can be calculated but less precise
- **Fix:** Enhance `match_telemetry.totals` to include:
  ```json
  "fh_return_winners": { "type": "integer" },
  "bh_return_winners": { "type": "integer" },
  "fh_return_errors": { "type": "integer" },
  "bh_return_errors": { "type": "integer" }
  ```

---

## 📊 COVERAGE SUMMARY

**Total Output Requirements:** ~50+ distinct metrics

**Fully Supported:** ~45 metrics (90%)
**Partially Supported:** ~3 metrics (6%) - Can calculate but missing some nuance
**Missing:** ~5 metrics (10%) - Cannot calculate without schema additions

**Recommendation:** Add the 6 critical gaps listed above to achieve 100% coverage.

