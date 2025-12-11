# Gap Analysis Report: `prompt-data1.txt` vs. Spec Documents

**Generated:** 2025-12-11  
**Player Sample:** Alana Berry  
**Compared Against:** DEV_SPEC_PRECOMPUTE_V8.md, scouting-prompt-v8.txt, raw_input_schema.json, scouting-report-output-template.txt

---

## Executive Summary

The `prompt-data1.txt` file is a PHP-exported player data payload. Comparing it against the spec documents reveals **several missing fields** that the AI prompt expects, as well as some structural differences.

**Overall Completeness: ~80%**

| Category | Status |
|----------|--------|
| Computed Metrics | 85% complete |
| Player Profile | 95% complete |
| Match Data Structure | 70% complete |
| Supporting Data | 50% complete |

---

## 1. Computed Metrics Comparison

### ✅ Fields Present & Correct

| Category | Field | Value in Data |
|----------|-------|---------------|
| performance_summary | `overall.wins` | 108 |
| performance_summary | `overall.losses` | 35 |
| performance_summary | `close_score.wins` | 16 |
| performance_summary | `close_score.losses` | 17 |
| competition_summary | `record_vs_higher_rated` | 0-0 |
| competition_summary | `matches_vs_higher_rated` | (empty) |
| competition_summary | `record_vs_12_plus` | 0-0 |
| competition_summary | `record_vs_11_5_plus` | 0-0 |
| competition_summary | `upset_losses` | (empty) |
| competition_summary | `upset_losses_count` | 0 |
| competition_summary | `worst_losses_top2` | (empty) |
| competition_summary | `record_by_round` | ✅ Full breakdown |
| rating_summary | `utr_trend` | "up" |
| rating_summary | `ranking_trend` | "flat" |
| rating_summary | `utr_history` | 6 entries |
| rating_summary | `current_utr` | 7.75 |
| surface_summary | Hard/Clay/Grass | ✅ W/L/pct present |
| point_defense_stress | `is_under_stress_defending_points` | 1 (true) |
| point_defense_stress | `expiring_tournaments_count` | 2 |
| point_defense_stress | `expiring_events` | 2 events |
| temporal_summary | `activity.matches_last_30` | 0 |
| temporal_summary | `activity.matches_last_60` | 0 |
| temporal_summary | `activity.matches_last_90` | 37 |
| temporal_summary | `activity.avg_days_between_matches` | 1.4 |
| temporal_summary | `fatigue_pattern` | 97-33 |
| temporal_summary | `rust_pattern` | 2-1 |
| strategic_summary | `record_by_level` | ✅ Full breakdown |
| head_to_head_summary | `repeated_opponents` | 10 opponents |
| head_to_head_summary | `common_opponents` | (empty) |
| head_to_head_summary | `weak_vs_styles` | (empty) |
| momentum_summary | `last10.wins` | 7 |
| momentum_summary | `last10.losses` | 3 |
| momentum_summary | `last10.matches` | 10 entries |
| momentum_summary | `last10_upset_losses` | (empty) |
| momentum_summary | `current_streak` | winning, count: 1 |

### 🔴 Fields MISSING (Critical)

| Category | Missing Field | Required By | Impact |
|----------|---------------|-------------|--------|
| point_defense_stress | `total_points_at_risk` | DEV_SPEC V8 §7.1 | Point defense analysis incomplete |
| vulnerability_flags | ALL FLAGS | DEV_SPEC V8 §12 | Section 10 weakness ID won't work |

**Note:** `vulnerability_flags` exists but is an empty array. Per spec, should contain:
```json
{
  "upset_vs_lower": true|false,
  "close_score": true|false,
  "surface": true|false,
  "form_slump": true|false,
  "time_based": true|false
}
```

### ⚠️ Fields Present but NULL/Empty (Should Populate)

| Category | Field | Current Value | Should Be |
|----------|-------|---------------|-----------|
| competition_summary | `average_utr_in_wins` | NULL | Calculated average |
| competition_summary | `average_utr_in_losses` | NULL | Calculated average |
| rating_summary | `average_opponent_utr` | NULL | Calculated average |
| strategic_summary | `soft_level_not_dominant` | NULL | true/false flag |
| strategic_summary | `high_level_struggle` | NULL | true/false flag |
| head_to_head_summary | `user_style` | NULL | Style string if known |

---

## 2. Top-Level Player Profile Fields

### ✅ Present & Correct

| Schema Field | Data Field | Value |
|--------------|------------|-------|
| `utr` | `player_utr` | 7.75 |
| `wtn` | `player_wtn` | 26.2 |
| `national_rank` | `national_rank` | 1210 |
| `national_points` | `player_national_pts` | 538 |
| `district_rank` | `district_rank` | 22 |
| `section_rank` | `section_rank` | 48 |
| `age_group` | `player_age_group` | Girls' 18 Singles |
| `location` | `player_city` + `player_state` | Cambridge, MA |
| `birth_year` | Derivable from `player_dob` | 2011-03-06 |

### ⚠️ Format Differences

| Schema Expects | Data Has | Notes |
|----------------|----------|-------|
| `player_profile.name` (single field) | `player_first` + `player_last` | Need to concatenate |

---

## 3. Match History Structure

### 🔴 Critical Issue: No Flattened `match_history` Array

The schema requires a top-level `match_history` array with flattened match objects.

**Current State:** Match data is embedded in `ranking_snap.events[].rounds[]` (nested structure)

**Required Fix:** Extract and flatten into array like:
```json
{
  "match_history": [
    {
      "date": "2025-10-11",
      "tournament_name": "...",
      "level": "L2",
      "surface": "Hard",
      "round": "QF",
      "draw_type": "Main",
      "opponent": { "name": "...", "utr": 7.5 },
      "score": "6-4 6-2",
      "result": "Win"
    }
  ]
}
```

### Match Field Mapping Issues

| Schema Field | Data Field | Status |
|--------------|------------|--------|
| `date` | In `rounds[]` | ✅ Present |
| `opponent.utr` | `opponents[].utrDec` | ✅ Present |
| `result` | `outcome` (W/L) | ⚠️ Different name |
| `score` | `results` | ⚠️ Different name |
| `surface` | NOT PRESENT | 🔴 MISSING |
| `level` | Present | ✅ OK |
| `draw_type` | `drawType` | ✅ OK |
| `round` | Present | ✅ OK |

---

## 4. Missing Required Sections

| Section | Schema Requirement | Data Status | Priority |
|---------|-------------------|-------------|----------|
| `match_history` (flattened array) | Required | ❌ Not flattened | 🔴 HIGH |
| `match_stats` (telemetry) | Required | ❌ NOT PRESENT | 🔴 HIGH (if available) |
| `match_book` (user notes) | Required | ❌ NOT PRESENT | 🔴 HIGH |
| `ranking_snapshot.top_6_events` | Required | ⚠️ Partial | ⚠️ MEDIUM |
| `ranking_snapshot.next_drop_off` | Optional | ❌ Not present | ⚠️ LOW |

---

## 5. Extra Fields in Data (Not in Spec)

These fields exist in `prompt-data1.txt` but aren't defined in the spec:

| Field | Description | Recommendation |
|-------|-------------|----------------|
| `wtn_doubles` | Doubles WTN (30.09) | Consider adding to spec |
| `utrDoubles` | Doubles UTR (7.81) | Consider adding to spec |
| `te_overall_rank` | Tennis Express rank (1210) | Optional - recruiting |
| `te_u14_rank` | TE U14 rank (3) | Optional - recruiting |
| `player_trn_ranking` | TRN ranking (4) | Optional - recruiting |
| `player_sat_math/verbal/act/gpa` | Academic scores | Recruiting focus only |
| `player_te_id`, `player_rtn_id` | External IDs | System use only |

---

## 6. Data Quality Issues Found

### Duplicate Match Entries
**Location:** `head_to_head_summary.repeated_opponents[].matches`

**Example:** Kiera DELIMA shows 6 matches but several are duplicates:
```
[0] 2025-08-30, Loss, 4-6 6-4 4-6
[1] 2025-08-30, Loss, 4-6 6-4 4-6  ← DUPLICATE
[2] 2025-01-31, Win, 8-3
[3] 2025-01-31, Win, 8-3           ← DUPLICATE
```

### NULL Opponent UTRs
**Location:** All `repeated_opponents[].opponent.utr` values are NULL

**Impact:** Can't do UTR-based analysis on head-to-head data

### Zero Higher-Rated Matches
**Issue:** `record_vs_higher_rated` shows 0-0
**Possible Cause:** UTR comparison logic may not be running, or player genuinely hasn't faced higher-rated opponents

---

## 7. Priority Fix List

### 🔴 MUST FIX (Required by Prompt v8)

| # | Gap | Location | Fix |
|---|-----|----------|-----|
| 1 | `total_points_at_risk` missing | `point_defense_stress` | Sum points from `expiring_events[].points` |
| 2 | `vulnerability_flags` empty | Root of `computed_metrics` | Populate 5 boolean flags per spec |
| 3 | `match_history` not flattened | Root level | Extract from `ranking_snap.events[].rounds[]` |
| 4 | `average_utr_in_wins` NULL | `competition_summary` | Calculate from matches with valid UTR |
| 5 | `average_utr_in_losses` NULL | `competition_summary` | Calculate from matches with valid UTR |
| 6 | `average_opponent_utr` NULL | `rating_summary` | Calculate mean of all opponent UTRs |
| 7 | `surface` missing in matches | Each match record | Add surface field |
| 8 | `match_book` missing | Root level | Add user notes array |

### ⚠️ SHOULD FIX (Recommended)

| # | Gap | Location | Fix |
|---|-----|----------|-----|
| 9 | Field naming: `outcome` vs `result` | Match records | Standardize to `result` |
| 10 | Field naming: `results` vs `score` | Match records | Standardize to `score` |
| 11 | `soft_level_not_dominant` NULL | `strategic_summary` | Calculate from `record_by_level` |
| 12 | `high_level_struggle` NULL | `strategic_summary` | Calculate from `record_by_level` |
| 13 | Duplicate matches | `head_to_head_summary` | De-duplicate by date+opponent |
| 14 | NULL opponent UTRs in H2H | `repeated_opponents` | Populate from opponent lookup |
| 15 | `match_stats` missing | Root level | Add if telemetry data available |

---

## 8. Spec Reference Quick Links

| Document | Key Sections |
|----------|--------------|
| DEV_SPEC_PRECOMPUTE_V8.md | §3-12 define all computed_metrics fields |
| scouting-prompt-v8.txt | Lines 209-343 define expected input structure |
| raw_input_schema.json | Full JSON schema with required/optional fields |
| scouting-report-output-template.txt | 12 report sections that consume this data |

---

## 9. Validation Checklist

Before sending data to AI, verify:

- [ ] `computed_metrics.vulnerability_flags` has 5 boolean fields
- [ ] `computed_metrics.point_defense_stress.total_points_at_risk` is calculated
- [ ] `computed_metrics.competition_summary.average_utr_in_wins` is not NULL
- [ ] `computed_metrics.competition_summary.average_utr_in_losses` is not NULL
- [ ] `computed_metrics.rating_summary.average_opponent_utr` is not NULL
- [ ] `match_history` array exists at root level with flattened matches
- [ ] Each match in `match_history` has `surface` field
- [ ] Each match uses `result` (not `outcome`) and `score` (not `results`)
- [ ] `match_book` array exists (can be empty if no notes)
- [ ] No duplicate entries in `head_to_head_summary.repeated_opponents[].matches`

---

---

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 10: WTN DATA GAP ANALYSIS (V2 Addition)
# ═══════════════════════════════════════════════════════════════════════════════

---

## 10. WTN Data Gap Analysis

This section analyzes the WTN-related data in `prompt-data1.txt` against the new V9 spec requirements for dual UTR/WTN reporting.

### 10.1 WTN Fields Present in prompt-data1.txt

#### ✅ Player Profile WTN Data (Present)

| Field | Data Location | Value | Status |
|-------|---------------|-------|--------|
| `player_wtn` | `[player_wtn]` | 26.2 | ✅ Present |
| `wtn_singles` | `[wtn_singles]` | 26.2 | ✅ Present (duplicate) |
| `wtn_doubles` | `[wtn_doubles]` | 30.09 | ✅ Present |

#### ✅ WTN in Ranking History (Present)

| Field | Location | Sample Values | Status |
|-------|----------|---------------|--------|
| `wtn_singles` | `ranking_history[].wtn_singles` | 26.51, 26.2, etc. | ✅ Present |

**Sample from data:**
```
[ranking_history] => Array (
    [0] => Array (
        [wtn_singles] => 26.51
        [list_date] => 2025-05-20
    )
    [1] => Array (
        [wtn_singles] => 26.2
        [list_date] => 2025-11-19
    )
)
```

---

### 10.2 WTN Fields MISSING (Critical for V9)

#### 🔴 Missing in Match/Opponent Data

| Required Field | Expected Location | Current Status | Impact |
|----------------|-------------------|----------------|--------|
| `opponent.wtn` | Each match in `match_history` | ❌ NOT PRESENT | Cannot do WTN-based competition analysis |
| `opponent.wtn` | `matches_vs_higher_rated[]` | ❌ NOT PRESENT | Cannot identify higher-rated by WTN |
| `opponent.wtn` | `repeated_opponents[].opponent` | ❌ NOT PRESENT | No H2H WTN analysis |
| `opponent.wtn` | `last10.matches[]` | ❌ NOT PRESENT | No momentum WTN analysis |

**Current opponent object structure:**
```php
[opponent] => Array (
    [name] => "Kiera DELIMA"
    [utr] =>                    // NULL - already an issue
    // [wtn] => NOT PRESENT
)
```

#### 🔴 Missing Computed Metrics (WTN)

| Required Field | Spec Reference | Status |
|----------------|----------------|--------|
| `record_vs_higher_rated_wtn` | V9 §15.3.1 | ❌ NOT PRESENT |
| `matches_vs_higher_rated_wtn` | V9 §15.3.1 | ❌ NOT PRESENT |
| `record_vs_higher_rated_wtn_bands` | V9 §15.2.2 | ❌ NOT PRESENT |
| `upset_losses_wtn` | V9 §15.3.2 | ❌ NOT PRESENT |
| `upset_losses_wtn_count` | V9 §15.3.2 | ❌ NOT PRESENT |
| `worst_losses_wtn_top2` | V9 §15.3.3 | ❌ NOT PRESENT |
| `average_wtn_in_wins` | V9 §15.3.4 | ❌ NOT PRESENT |
| `average_wtn_in_losses` | V9 §15.3.4 | ❌ NOT PRESENT |
| `wtn_trend` | V9 §15.4.1 | ❌ NOT PRESENT |
| `current_wtn` | V9 §15.4.1 | ⚠️ Available but not in rating_summary |
| `wtn_history` | V9 §15.4.1 | ⚠️ Available but not structured per spec |
| `average_opponent_wtn` | V9 §15.4.2 | ❌ NOT PRESENT |

#### 🔴 Missing Relative UTR Band Metrics

| Required Field | Spec Reference | Status |
|----------------|----------------|--------|
| `record_vs_higher_rated_utr_bands.band_0_to_0.5` | V9 §15.2.1 | ❌ NOT PRESENT |
| `record_vs_higher_rated_utr_bands.band_0.6_to_1` | V9 §15.2.1 | ❌ NOT PRESENT |
| `record_vs_higher_rated_utr_bands.band_1.1_to_2` | V9 §15.2.1 | ❌ NOT PRESENT |
| `record_vs_higher_rated_utr_bands.band_over_2` | V9 §15.2.1 | ❌ NOT PRESENT |

---

### 10.3 WTN Data Availability Assessment

#### Data Source Analysis

| Data Type | UTR Available | WTN Available | Notes |
|-----------|---------------|---------------|-------|
| Player profile | ✅ Yes (7.75) | ✅ Yes (26.2) | Both present |
| Player history | ✅ Yes (6 entries) | ✅ Yes (in ranking_history) | Needs restructuring |
| Opponent ratings | ⚠️ Partial (many NULL) | ❌ No | WTN not fetched for opponents |
| Match-level data | ❌ Missing in many | ❌ Not present | Both systems need work |

#### Root Cause of WTN Gaps

1. **API Integration Gap**: Opponent WTN is not being fetched from USTA/ITF APIs
2. **Data Model Gap**: `opponent` object schema doesn't include `wtn` field
3. **Precompute Gap**: No WTN-specific computed metrics are being generated

---

### 10.4 WTN Priority Fix List

#### 🔴 MUST FIX for V9 Dual Reporting

| # | Gap | Location | Fix | Priority |
|---|-----|----------|-----|----------|
| 1 | `opponent.wtn` missing | All match records | Fetch WTN for each opponent from API | 🔴 HIGH |
| 2 | `record_vs_higher_rated_wtn` | `competition_summary` | Compute from matches where `opponent.wtn < player_wtn` | 🔴 HIGH |
| 3 | `record_vs_higher_rated_wtn_bands` | `competition_summary` | Compute using relative WTN bands | 🔴 HIGH |
| 4 | `record_vs_higher_rated_utr_bands` | `competition_summary` | Compute using relative UTR bands | 🔴 HIGH |
| 5 | `wtn_trend` | `rating_summary` | Calculate from `wtn_history` (lower = improving) | 🔴 HIGH |
| 6 | `current_wtn` | `rating_summary` | Copy from `player_wtn` | 🟡 MEDIUM |
| 7 | `wtn_history` | `rating_summary` | Restructure from `ranking_history[].wtn_singles` | 🟡 MEDIUM |
| 8 | `average_opponent_wtn` | `rating_summary` | Calculate mean of all `opponent.wtn` | 🟡 MEDIUM |
| 9 | `average_wtn_in_wins` | `competition_summary` | Calculate from winning matches | 🟡 MEDIUM |
| 10 | `average_wtn_in_losses` | `competition_summary` | Calculate from losing matches | 🟡 MEDIUM |
| 11 | `upset_losses_wtn` | `competition_summary` | Filter losses where `opponent.wtn >= player_wtn + 0.5` | 🟡 MEDIUM |
| 12 | `worst_losses_wtn_top2` | `competition_summary` | Sort losses by `opponent.wtn` descending, take 2 | 🟡 MEDIUM |

---

### 10.5 Extended Opponent Object Schema

**Current Schema:**
```json
{
  "opponent": {
    "name": "string",
    "utr": "number|null"
  }
}
```

**Required V9 Schema:**
```json
{
  "opponent": {
    "name": "string",
    "utr": "number|null",
    "wtn": "number|null"
  }
}
```

---

### 10.6 WTN Trend Calculation Logic

**Important:** WTN scale is inverted (lower = better), so trend logic is opposite of UTR.

```php
// WTN Trend Calculation
$wtn_oldest = $wtn_history[0]['wtn'];  // e.g., 27.1 (6 months ago)
$wtn_latest = $wtn_history[count($wtn_history)-1]['wtn'];  // e.g., 26.2 (now)

$wtn_change = $wtn_latest - $wtn_oldest;  // -0.9 (negative = improvement)

if ($wtn_change <= -0.3) {
    $wtn_trend = "up";      // Improving (lower WTN)
} else if ($wtn_change >= 0.3) {
    $wtn_trend = "down";    // Declining (higher WTN)
} else {
    $wtn_trend = "flat";
}
```

---

### 10.7 Updated Validation Checklist (V2 with WTN)

Before sending data to AI, verify:

#### UTR Metrics (from V1)
- [ ] `computed_metrics.vulnerability_flags` has 5 boolean fields
- [ ] `computed_metrics.point_defense_stress.total_points_at_risk` is calculated
- [ ] `computed_metrics.competition_summary.average_utr_in_wins` is not NULL
- [ ] `computed_metrics.competition_summary.average_utr_in_losses` is not NULL
- [ ] `computed_metrics.rating_summary.average_opponent_utr` is not NULL
- [ ] `match_history` array exists at root level with flattened matches
- [ ] Each match in `match_history` has `surface` field
- [ ] Each match uses `result` (not `outcome`) and `score` (not `results`)
- [ ] `match_book` array exists (can be empty if no notes)
- [ ] No duplicate entries in `head_to_head_summary.repeated_opponents[].matches`

#### WTN Metrics (NEW for V2)
- [ ] `player_profile.wtn` or `player_wtn` is present
- [ ] `opponent.wtn` field exists in match records (can be null)
- [ ] `computed_metrics.rating_summary.current_wtn` is populated
- [ ] `computed_metrics.rating_summary.wtn_trend` is calculated ("up"|"down"|"flat")
- [ ] `computed_metrics.rating_summary.wtn_history` has structured entries
- [ ] `computed_metrics.rating_summary.average_opponent_wtn` is calculated (or null if no data)
- [ ] `computed_metrics.competition_summary.record_vs_higher_rated_wtn` exists
- [ ] `computed_metrics.competition_summary.record_vs_higher_rated_wtn_bands` has 4 bands
- [ ] `computed_metrics.competition_summary.average_wtn_in_wins` is calculated
- [ ] `computed_metrics.competition_summary.average_wtn_in_losses` is calculated

#### Relative Rating Bands (NEW for V2)
- [ ] `computed_metrics.competition_summary.record_vs_higher_rated_utr_bands` has 4 bands
- [ ] Each UTR band has `wins`, `losses`, `win_pct`, and `utr_range`
- [ ] `computed_metrics.competition_summary.record_vs_higher_rated_wtn_bands` has 4 bands
- [ ] Each WTN band has `wins`, `losses`, `win_pct`, and `wtn_range`

---

### 10.8 Sample Expected Output (V9 Compliant)

```json
{
  "player_profile": {
    "name": "Alana Berry",
    "utr": 7.75,
    "wtn": 26.2
  },
  "computed_metrics": {
    "rating_summary": {
      "utr_trend": "up",
      "current_utr": 7.75,
      "utr_history": [...],
      "average_opponent_utr": 7.2,
      
      "wtn_trend": "up",
      "current_wtn": 26.2,
      "wtn_history": [
        { "date": "2025-05-20", "wtn": 27.1 },
        { "date": "2025-11-19", "wtn": 26.2 }
      ],
      "average_opponent_wtn": 27.5
    },
    "competition_summary": {
      "record_vs_higher_rated": { "wins": 3, "losses": 5 },
      "record_vs_higher_rated_utr_bands": {
        "band_0_to_0.5": { "wins": 2, "losses": 1, "win_pct": 0.667, "utr_range": "7.85-8.25" },
        "band_0.6_to_1": { "wins": 1, "losses": 2, "win_pct": 0.333, "utr_range": "8.35-8.75" },
        "band_1.1_to_2": { "wins": 0, "losses": 2, "win_pct": 0.0, "utr_range": "8.85-9.75" },
        "band_over_2": { "wins": 0, "losses": 0, "win_pct": null, "utr_range": "9.75+" }
      },
      
      "record_vs_higher_rated_wtn": { "wins": 2, "losses": 4 },
      "record_vs_higher_rated_wtn_bands": {
        "band_0_to_2": { "wins": 2, "losses": 1, "win_pct": 0.667, "wtn_range": "24.2-25.7" },
        "band_2.1_to_4": { "wins": 0, "losses": 2, "win_pct": 0.0, "wtn_range": "22.2-24.1" },
        "band_4.1_to_6": { "wins": 0, "losses": 1, "win_pct": 0.0, "wtn_range": "20.2-22.1" },
        "band_over_6": { "wins": 0, "losses": 0, "win_pct": null, "wtn_range": "<20.2" }
      },
      
      "average_utr_in_wins": 7.1,
      "average_utr_in_losses": 8.3,
      "average_wtn_in_wins": 28.5,
      "average_wtn_in_losses": 24.8,
      
      "upset_losses_wtn": [],
      "upset_losses_wtn_count": 0
    }
  },
  "match_history": [
    {
      "date": "2025-10-11",
      "opponent": {
        "name": "Sarah Chen",
        "utr": 8.2,
        "wtn": 25.1
      },
      "result": "Loss",
      "score": "4-6 6-7"
    }
  ]
}
```

---

### 10.9 Implementation Dependency Order

For backend development, implement in this order:

1. **Phase 1: Data Collection**
   - Add `opponent.wtn` to API fetch for each opponent
   - Store WTN alongside UTR in match records

2. **Phase 2: Basic WTN Metrics**
   - `current_wtn`, `wtn_history`, `wtn_trend`
   - `average_opponent_wtn`
   - `record_vs_higher_rated_wtn`

3. **Phase 3: Relative Band Metrics**
   - `record_vs_higher_rated_utr_bands` (4 bands)
   - `record_vs_higher_rated_wtn_bands` (4 bands)

4. **Phase 4: Advanced WTN Metrics**
   - `average_wtn_in_wins/losses`
   - `upset_losses_wtn`
   - `worst_losses_wtn_top2`

5. **Phase 5: Report Template Updates**
   - Dual display format
   - Both rating systems in all sections
