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
