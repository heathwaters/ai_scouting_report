### Tennis Scouting Report – PHP Pre‑Compute Spec for Prompt v8

This document describes **all computations** the backend (PHP + MySQL) must perform **before** calling the LLM, so that the model only interprets structured data instead of recalculating from raw matches.

It is designed to correlate exactly with `scouting-prompt-v8.txt`.

No PHP code is provided here—only **inputs, filters, and JSON output fields** the LLM will consume.

---

## 0. High‑Level Design

- **Source of truth**: MySQL database containing player, match, ranking, and notes data.
- **Output to LLM**: A single JSON object per report that:
  - Already matches `raw_input_schema.json` for core fields (player profile, match_history, etc.).
  - Is extended with a `computed_metrics` block containing all pre‑computed stats described below.
- **Responsibility split**:
  - **PHP/MySQL**: All numeric / categorical calculations (records, filters, thresholds, flags).
  - **LLM**: Only **narrates and explains** these computed metrics, plus pulls example matches from lists we provide. It should **not** recompute numbers from raw data.

Unless explicitly stated otherwise, all stats below refer to **singles matches only**.

---

## 1. Data Model Assumptions

For each singles match in `match_history`, assume we have at least:

- `date` (ISO date string)
- `result` – one of: `"Win"`, `"Loss"`, `"Walkover"`, `"Retired"`, `"Completed"` (you can normalize internally)
- `score` – score string (e.g., `"6-4 6-4"`, `"6-2 4-6 [9-11]"`)
- `surface` – e.g., `"Hard"`, `"Clay"`, `"Grass"`, `"Indoor"`, `"Unknown"`
- `level` – e.g., `"Level 1"`, `"Level 2"`, `"Level 3 Open"`, `"J60"`, etc.
- `round` – standardized round codes (`"R64"`, `"R32"`, `"R16"`, `"QF"`, `"SF"`, `"F"`, `"C-R16"`, etc.)
- `opponent`:
  - `opponent.name`
  - `opponent.utr` (number, may be null if unknown)
- `player_utr` – the player's **current** UTR used as baseline for this report

Additional data:

- `ranking_snapshot` – list of events with:
  - `name`, `date`, `points`
- Optional `notes` / `match_book_notes` that may include style tags for players.

All computed metrics below assume you can filter/select on those fields.

---

## 2. JSON Shape for Computed Metrics

Add a top‑level key:

```json
{
  "computed_metrics": {
    "performance_summary": { ... },
    "competition_summary": { ... },
    "rating_summary": { ... },
    "surface_summary": { ... },
    "point_defense_stress": { ... },
    "temporal_summary": { ... },
    "strategic_summary": { ... },
    "head_to_head_summary": { ... },
    "momentum_summary": { ... },
    "vulnerability_flags": { ... }
  }
}
```

You can extend this as needed; the fields below define the **minimum contract** with the prompt.

---

## 3. Performance Analytics (Prompt Section 1)

### 3.1 Overall Singles Record

**CRITICAL COUNTING RULES:**
- **Include**: All matches with a **non-empty score string** (even if partial):
  - `result === "Win"` with score
  - `result === "Loss"` with score
  - `result === "Retirement"` with score (count as Loss - player retired while losing)
- **Exclude**: 
  - `result === "Walkover"` (no score or empty score)
  - Any match where `score` is `null`, empty string `""`, or whitespace-only

**Rationale**: Only count matches that were actually played (completed or partially completed with a score). Walkovers and matches without scores are excluded because they don't represent actual competition.

**Logic**

```php
// Pseudocode
$wins_overall = 0;
$losses_overall = 0;

foreach ($singles_matches as $match) {
    // Must have a non-empty score to count
    $hasScore = !empty($match['score']) && trim($match['score']) !== '';
    
    if (!$hasScore) {
        continue; // Skip walkovers and no-score matches
    }
    
    if ($match['result'] === 'Win') {
        $wins_overall++;
    } else if ($match['result'] === 'Loss' || $match['result'] === 'Retirement') {
        $losses_overall++; // Retirements with scores count as losses
    }
}
```

**Output**

```json
computed_metrics.performance_summary.overall = {
  "wins": wins_overall,
  "losses": losses_overall
}
```

---

### 3.2 Close‑Score Performance

We want to know how they do in **close-score situations** (for prompt Section 1).

**Close‑score match (developer definition)** – a singles match is considered "close-score" if **any** of:

- Score contains `"7-5"` or `"5-7"`, or
- Score contains `"7-6"` (any set), or
- Score clearly indicates a deciding set / match tiebreak (e.g., third set score like `"1-6"` in set 3, or a match tiebreak `"[10-8]"`, etc.—you can formalize detection).

**Logic**

- On this subset:
  - `wins_close` = count where `result === "Win"`.
  - `losses_close` = count where `result === "Loss"`.

**Output**

```json
computed_metrics.performance_summary.close_score = {
  "wins": wins_close,
  "losses": losses_close
}
```

The LLM will describe **current close‑score strengths/weaknesses** using this.

---

## 4. Competition Level Analysis (Prompt Section 2)

All metrics below are computed on **singles matches with valid `opponent.utr`** unless explicitly noted.

Let:

- `player_utr` = player's current UTR used as baseline.

### 4.1 Record vs Higher‑Rated Opponents

**Definition**: "Higher‑rated opponent" = `opponent.utr > player_utr`.

**Logic**

- Filter matches where:
  - `result` in `{"Win","Loss"}`, and
  - `opponent.utr > player_utr`.
- Count:
  - `wins_vs_higher` = wins in this subset.
  - `losses_vs_higher` = losses in this subset.
- Keep full list of these matches.

**Output**

```json
computed_metrics.competition_summary.record_vs_higher_rated = {
  "wins": wins_vs_higher,
  "losses": losses_vs_higher
}

computed_metrics.competition_summary.matches_vs_higher_rated = [
  {
    "date": "...",
    "round": "...",
    "level": "...",
    "opponent": { "name": "...", "utr": 11.8 },
    "result": "Loss",
    "score": "..."
  }
  // ...
]
```

---

### 4.2 Record vs 12.0+ and 11.5+ UTR

**Logic**

- `record_vs_12_plus`:
  - Filter where `opponent.utr >= 12.0` AND `result in {"Win","Loss"}`.
- `record_vs_11_5_plus`:
  - Filter where `opponent.utr >= 11.5` AND `result in {"Win","Loss"}`.

**Output**

```json
computed_metrics.competition_summary.record_vs_12_plus = {
  "wins": wins_12_plus,
  "losses": losses_12_plus
}

computed_metrics.competition_summary.record_vs_11_5_plus = {
  "wins": wins_11_5_plus,
  "losses": losses_11_5_plus
}
```

The LLM will describe **current level ceiling around a band** using these.

---

### 4.3 Upset Losses (vs Lower UTR) – **ALL**

This is one of the most important vulnerability metrics.

**Definition of Upset Loss (vs Lower UTR)**:

- Singles match
- `result === "Loss"`
- `opponent.utr <= player_utr - 0.2`  
  (example: player_utr = 11.4 → opponent.utr ≤ 11.2)
- `result` is **not** `"Walkover"` (must actually have been played).

**Logic**

- Filter all matches meeting the above.
- Do **not** omit any of them.

**Output**

```json
computed_metrics.competition_summary.upset_losses = [
  {
    "date": "...",
    "round": "...",
    "level": "...",
    "opponent": { "name": "...", "utr": 10.9 },
    "result": "Loss",
    "score": "6-7 5-7"
  }
  // ALL qualifying upset losses
]

computed_metrics.competition_summary.upset_losses_count = <number>
```

In the report, the LLM will be required to list **every** match in this array.

---

### 4.4 "Worst Losses" (Lowest UTR) – Top 2

For the "Top 2 worst losses (Lowest UTR)" section.

**Logic**

- Consider **all singles losses** with a valid `opponent.utr` and `result === "Loss"`, excluding walkovers.
- Sort this set by `opponent.utr` ascending (lowest first).
- Take the **first 2** entries (or fewer if fewer losses exist).

**Output**

```json
computed_metrics.competition_summary.worst_losses_top2 = [
  {
    "date": "...",
    "round": "...",
    "level": "...",
    "opponent": { "name": "...", "utr": 9.8 },
    "result": "Loss",
    "score": "1-6 4-6"
  },
  {
    "date": "...",
    "round": "...",
    "level": "...",
    "opponent": { "name": "...", "utr": 10.1 },
    "result": "Loss",
    "score": "6-7 5-7"
  }
]
```

---

### 4.5 Round Performance

We want to see where they tend to stall (early rounds vs higher‑stake later rounds).

**Logic**

- Group singles matches by **round code** (e.g., `"R64"`, `"R32"`, `"R16"`, `"QF"`, `"SF"`, `"F"`, plus any consolation codes you use).
- For each round:
  - `wins` = count with `result === "Win"`.
  - `losses` = count with `result === "Loss"`.

**Output**

```json
computed_metrics.competition_summary.record_by_round = {
  "R64": { "wins": 2, "losses": 0 },
  "R32": { "wins": 4, "losses": 3 },
  "R16": { "wins": 1, "losses": 4 },
  "QF":  { "wins": 0, "losses": 2 },
  "SF":  { "wins": 0, "losses": 1 },
  "F":   { "wins": 0, "losses": 0 },
  "...": { "...": "..." }
}
```

The model will interpret this as **current early‑round vs later‑round vulnerabilities**.

---

### 4.6 Average Win/Loss Thresholds

This supports the "current win ceiling / loss floor" narrative.

**Logic**

- For all singles matches with valid `opponent.utr`:
  - Compute:
    - `avg_utr_in_wins` = average `opponent.utr` over matches where `result === "Win"`.
    - `avg_utr_in_losses` = average `opponent.utr` over matches where `result === "Loss"`.

**Output**

```json
computed_metrics.competition_summary.average_utr_in_wins = <number or null>
computed_metrics.competition_summary.average_utr_in_losses = <number or null>
```

Handle cases with zero wins or zero losses by returning `null` or omitting field (but document your choice).

---

## 5. Rating & Ranking Analytics (Prompt Section 3)

### 5.1 UTR / Ranking Trajectory

**Inputs**

- Historical UTR values and national rankings over time.

**Logic (simple)**

- For UTR:
  - Compare latest UTR to UTR from X months ago (e.g., 6 months).
  - Label:
    - `"up"` if significantly higher,
    - `"down"` if significantly lower,
    - `"flat"` otherwise.
- For national ranking:
  - Similar comparison, remembering that lower rank number is better.

**Output**

```json
computed_metrics.rating_summary.utr_trend = "up" | "down" | "flat"
computed_metrics.rating_summary.ranking_trend = "up" | "down" | "flat"

computed_metrics.rating_summary.utr_history = [
  { "date": "...", "utr": 11.2 },
  { "date": "...", "utr": 11.4 }
  // optional
]
```

---

### 5.2 Strength of Schedule

**Logic**

- Over all singles matches with valid `opponent.utr`:
  - `avg_opponent_utr` = mean of opponent.utr.

**Output**

```json
computed_metrics.rating_summary.average_opponent_utr = <number>
```

---

## 6. Surface Performance (Prompt Section 4)

### 6.1 Surface Summary

**Logic**

- Group singles matches by `surface`.
- For each surface:
  - `wins` = count `result === "Win"`.
  - `losses` = count `result === "Loss"`.
  - `win_pct` = `wins / (wins + losses)`; if denominator is 0, set `win_pct = null` or 0 and document.

**Output**

```json
computed_metrics.surface_summary = {
  "Hard":  { "wins": 10, "losses": 5, "win_pct": 0.6667 },
  "Clay":  { "wins": 3,  "losses": 7, "win_pct": 0.3000 },
  "Grass": { "wins": 0,  "losses": 0, "win_pct": null },
  "Indoor": { ... },
  "Unknown": { ... }
}
```

The model will identify **current strongest** and **current weakest** surfaces from this.

---

## 7. Point Defense & Stress (Prompt Section 5)

### 7.1 Point‑Defense Stress Metrics

**Inputs**

- `ranking_snapshot` events: each has `name`, `date`, `points`.
- A reference "upcoming match date" (e.g., today or target match date).

**Logic**

For each ranking event:

1. Convert `event.date` to date `D`.
2. Compute `anniversary = D + 1 year`.
3. Compute `days_to_expiry = (anniversary - upcoming_match_date)` in days.
4. If `0 < days_to_expiry <= 30`, then:
   - Include this event in `expiring_events`.

Sum the `points` of all such events to get `total_points_at_risk`.

You may classify:

- `pressure_level = "HIGH"` if `points > 300`, else `"MODERATE"` (can tweak threshold).

**Output**

```json
computed_metrics.point_defense_stress = {
  "is_under_stress_defending_points": expiring_events.length > 0,
  "total_points_at_risk": <number>,
  "expiring_events": [
    {
      "name": "...",
      "date": "...",
      "points": 200,
      "days_to_expiry": 14,
      "pressure_level": "MODERATE"
    }
    // ...
  ]
}
```

---

## 8. Temporal & Scheduling Analytics (Prompt Section 6)

### 8.1 Activity Level

**Logic**

- From **today** (or target report date) count:
  - `matches_last_30` = singles matches with `date` in last 30 days.
  - `matches_last_60` = last 60 days.
  - `matches_last_90` = last 90 days.
- Compute:
  - `avg_days_between_matches` in the last 6 months:
    - Sort matches by date.
    - Compute consecutive date differences for matches in last 6 months.
    - Average those differences.

**Output**

```json
computed_metrics.temporal_summary.activity = {
  "matches_last_30": <int>,
  "matches_last_60": <int>,
  "matches_last_90": <int>,
  "avg_days_between_matches": <number or null>
}
```

---

### 8.2 Fatigue & Rust Patterns (Simple)

**Fatigue pattern (short‑rest matches)**

- Define "short rest" as matches where the previous singles match was within X days (e.g., 1–2 days).
- Among those "short‑rest" matches:
  - Count `wins_short_rest`, `losses_short_rest`.

**Rust pattern (long‑gap matches)**

- Define "long gap" as **no singles matches in the previous Y days** (e.g., 21+ days).
- For the first match after such a gap:
  - Count `wins_after_long_gap`, `losses_after_long_gap`.

**Output**

```json
computed_metrics.temporal_summary.fatigue_pattern = {
  "wins": wins_short_rest,
  "losses": losses_short_rest
}

computed_metrics.temporal_summary.rust_pattern = {
  "wins": wins_after_long_gap,
  "losses": losses_after_long_gap
}
```

The LLM will interpret these as **current time‑based vulnerabilities or strengths**.

---

## 9. Strategic Pattern Recognition (Prompt Section 7)

### 9.1 Record by Level

**Logic**

- Group singles matches by `level` (normalized into buckets you use, e.g., `"Level 1"`, `"Level 2"`, `"Level 3 Open"`, `"L3 Closed"`, `"L4"`, `"L5"`, `"L6"`, ITF `"J60"`, `"J30"`, etc.).
- For each level:
  - `wins` and `losses` (excluding walkovers).

**Output**

```json
computed_metrics.strategic_summary.record_by_level = {
  "Level 1": { "wins": 0, "losses": 4 },
  "Level 2": { "wins": 2, "losses": 5 },
  "Level 3 Open": { "wins": 3, "losses": 3 },
  "Level 6": { "wins": 5, "losses": 4 },
  "...": { ... }
}
```

You can optionally pre-compute flags:

```json
computed_metrics.vulnerability_flags.soft_level_not_dominant: true | false
computed_metrics.vulnerability_flags.high_level_struggle: true | false
```

Where:

- `soft_level_not_dominant` might mean low win% at lower levels (L6–L7).
- `high_level_struggle` might mean low win% at top levels (L1–L2/ITF).

---

## 10. Head‑to‑Head & Style (Prompt Section 8)

This depends on how much context you have about the **user** vs the opponent.

### 10.1 Common Opponents (If user data available)

**Input**

- User's own match history (vs various opponents).
- Target player's match history (vs various opponents).

**Logic**

- For each opponent name / ID both have played:
  - Compute:
    - `user_record_vs`: `{ wins, losses }`
    - `target_record_vs`: `{ wins, losses }`

**Output**

```json
computed_metrics.head_to_head_summary.common_opponents = [
  {
    "opponent": { "name": "Ivan RYBAK", "utr": 11.38 },
    "user_record":   { "wins": 1, "losses": 0 },
    "target_record": { "wins": 0, "losses": 2 }
  }
  // ...
]
```

### 10.2 Style Matchup (If styles are tracked)

**Input**

- Style tags for the target player (`target_styles`).
- Style tags for user (`user_style`).
- Style tags for past opponents and match outcomes.

**Logic**

- For each style category (e.g., `"aggressive baseliner"`, `"counterpuncher"`, `"big server"`), compute:
  - `wins` and `losses` for target player vs that style.
- If you know the user's style, the LLM will check the record vs that style.

**Output**

```json
computed_metrics.head_to_head_summary.user_style = "aggressive baseliner"  // optional

computed_metrics.head_to_head_summary.weak_vs_styles = [
  {
    "style": "aggressive baseliner",
    "wins": 1,
    "losses": 4
  }
  // ...
]
```

---

## 11. Momentum & Confidence Indicators (Prompt Section 9)

### 11.1 Last 10 Singles Matches

**Logic**

- Sort all singles matches by `date` descending.
- Take the **10 most recent**.
- Among those 10:
  - `wins_last10` = count `result === "Win"`.
  - `losses_last10` = count `result === "Loss"`.

**Output**

```json
computed_metrics.momentum_summary.last10 = {
  "wins": wins_last10,
  "losses": losses_last10,
  "matches": [
    {
      "date": "...",
      "opponent": { "name": "...", "utr": 11.1 },
      "result": "Loss",
      "score": "6-7 5-7"
    }
    // up to 10 matches
  ]
}
```

---

### 11.2 Upset Losses Within Last 10

Use the **same definition** as in Section 4.3 (Upset Loss vs Lower UTR), but apply only to `last10.matches`.

**Logic**

- Filter `last10.matches` where:
  - `result === "Loss"`
  - `opponent.utr <= player_utr - 0.2`
  - not a walkover.

**Output**

```json
computed_metrics.momentum_summary.last10_upset_losses = [
  {
    "date": "...",
    "opponent": { "name": "...", "utr": 10.9 },
    "result": "Loss",
    "score": "4-6 6-7"
  }
  // ...
]
```

The LLM will talk about **current low / high confidence** from this.

---

## 12. Weakness Identification & Flags (Prompt Section 10)

To help the model summarize "Top 2–3 primary current vulnerabilities", you can pre‑derive boolean flags or simple summaries.

### 12.1 Vulnerability Flags

Suggested (you can add more as you discover patterns):

- `upset_vs_lower`:
  - `true` if `upset_losses_count > 0`.
- `close_score`:
  - `true` if `performance_summary.close_score.losses > performance_summary.close_score.wins`.
- `surface`:
  - `true` if there is at least one surface with **significantly** worse win% and a meaningful number of matches (you choose thresholds).
- `form_slump`:
  - `true` if `last10.wins` is small (e.g., ≤3).
- `time_based`:
  - `true` if fatigue or rust patterns show clearly worse records.

**Output**

```json
computed_metrics.vulnerability_flags = {
  "upset_vs_lower": true,
  "close_score": false,
  "surface": true,
  "form_slump": false,
  "time_based": false
}
```

The prompt will instruct the model to use these **only as current, evidence‑backed vulnerabilities**.

---

## 13. Psychological Profile & Tactical Blueprint (Prompt Sections 11–12)

These sections are mostly **narrative**, but they rely heavily on the computed patterns above:

- Resilience / recovery:
  - Use:
    - `worst_losses_top2`
    - `last10.matches`
    - `fatigue_pattern`, `rust_pattern`
    - `consolation / FIC behavior` (derived from `level` / `round` tags for consolation draws, if you track them).
- Tactical blueprint:
  - Uses:
    - All of `competition_summary`, `surface_summary`, `temporal_summary`, `momentum_summary`, `head_to_head_summary`, and `vulnerability_flags`.

No extra numeric fields are strictly required here beyond those already specified; the model will reference these summaries by name in its plan.

---

## 14. Key Contract Summary (For You and the Dev)

1. **PHP/MySQL must compute and populate** all fields under:
   - `computed_metrics.performance_summary`
   - `computed_metrics.competition_summary`
   - `computed_metrics.rating_summary`
   - `computed_metrics.surface_summary`
   - `computed_metrics.point_defense_stress`
   - `computed_metrics.temporal_summary`
   - `computed_metrics.strategic_summary`
   - `computed_metrics.head_to_head_summary` (where data exists)
   - `computed_metrics.momentum_summary`
   - `computed_metrics.vulnerability_flags`

2. The **prompt v8** will be updated to:
   - Explicitly say: "Use these `computed_metrics` fields for all stats and records; **do not recompute** from `match_history` except to pull example matches and sanity‑check."
   - Require strict numeric consistency (e.g., no counting 11.38 as "higher than 11.40").

3. Once these are in place, the LLM will:
   - Only interpret and narrate **pre‑computed truth**,
   - Use raw matches to illustrate,
   - And focus on windows of opportunity / current vulnerabilities, without inventing numbers.


---

---

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 15: WTN DUAL REPORTING & RELATIVE RATING BANDS (V9 Addition)
# ═══════════════════════════════════════════════════════════════════════════════

---

## 15. WTN Dual Reporting & Relative Rating Bands

This section extends the pre-compute spec to support **dual UTR/WTN reporting** and introduces **relative rating bands** that scale to each player's level, replacing fixed absolute thresholds.

### 15.0 Partnership Context

Match Tennis AI maintains partnerships with both:
- **UTR (Universal Tennis Rating)** - Primary rating system in US junior tennis
- **WTN (World Tennis Number)** - ITF's official global rating via USTA

All scouting reports should display metrics for **both systems** to:
1. Demonstrate platform integration with both ecosystems
2. Provide complete coverage when opponent has only one rating
3. Enable cross-validation and discrepancy detection

---

## 15.1 Data Model Extensions

### 15.1.1 Extended Match Data

For each singles match in `match_history`, add:

```
- `opponent.wtn` (number, may be null if unknown) – World Tennis Number (lower is better)
```

### 15.1.2 Extended Player Profile

```
- `player_wtn` – the player's **current** WTN used as baseline for this report
```

### 15.1.3 Rating Scale Reference

| Rating System | Scale | Direction | Elite Level | Beginner Level |
|--------------|-------|-----------|-------------|----------------|
| **UTR** | 1.0 – 16.5 | Higher is better | 14+ | 1-3 |
| **WTN** | 1 – 40 | Lower is better | 1-10 | 35-40 |

**Approximate Equivalence Table:**

| UTR | WTN (approx) | Level Description |
|-----|--------------|-------------------|
| 14+ | 1-8 | Elite/Pro |
| 12 | 16-18 | National level |
| 10 | 22-24 | Strong sectional |
| 8 | 26-28 | Competitive junior |
| 6 | 32-34 | Developing junior |
| 4 | 38-40 | Beginner |

---

## 15.2 Relative Rating Bands (Replaces Absolute Thresholds)

**Problem with Fixed Thresholds:**
The existing `record_vs_12_plus` and `record_vs_11_5_plus` metrics are meaningless for players rated below those levels (e.g., a 5.0 UTR player will never face 12.0+ opponents).

**Solution: Relative Bands**
Compute performance based on opponent rating **relative to the player's own rating**.

### 15.2.1 UTR Relative Bands

Calculate record against opponents in bands relative to `player_utr`:

| Band ID | Band Range | Description | Example (player_utr=8.0) |
|---------|------------|-------------|--------------------------|
| `band_0_to_0.5` | +0.1 to +0.5 | Slightly higher | 8.1 – 8.5 |
| `band_0.6_to_1` | +0.6 to +1.0 | Moderately higher | 8.6 – 9.0 |
| `band_1.1_to_2` | +1.1 to +2.0 | Significantly higher | 9.1 – 10.0 |
| `band_over_2` | > +2.0 | Major stretch | 10.1+ |

**Logic**

```php
// For each match with valid opponent.utr
$utr_diff = $opponent_utr - $player_utr;

if ($utr_diff > 0 && $utr_diff <= 0.5) {
    $band = 'band_0_to_0.5';
} else if ($utr_diff > 0.5 && $utr_diff <= 1.0) {
    $band = 'band_0.6_to_1';
} else if ($utr_diff > 1.0 && $utr_diff <= 2.0) {
    $band = 'band_1.1_to_2';
} else if ($utr_diff > 2.0) {
    $band = 'band_over_2';
}
```

**Output**

```json
computed_metrics.competition_summary.record_vs_higher_rated_utr_bands = {
  "band_0_to_0.5": { 
    "wins": 5, 
    "losses": 3,
    "win_pct": 0.625,
    "utr_range": "8.1-8.5"  // dynamically calculated from player_utr
  },
  "band_0.6_to_1": { 
    "wins": 2, 
    "losses": 4,
    "win_pct": 0.333,
    "utr_range": "8.6-9.0"
  },
  "band_1.1_to_2": { 
    "wins": 0, 
    "losses": 2,
    "win_pct": 0.0,
    "utr_range": "9.1-10.0"
  },
  "band_over_2": { 
    "wins": 0, 
    "losses": 1,
    "win_pct": 0.0,
    "utr_range": "10.1+"
  }
}
```

### 15.2.2 WTN Relative Bands

**IMPORTANT:** WTN scale is inverted (lower = better), so bands work differently.

For WTN, a "higher-rated" opponent has a **lower** WTN number.

| Band ID | Band Range | Description | Example (player_wtn=26) |
|---------|------------|-------------|-------------------------|
| `band_0_to_2` | -0.5 to -2.0 | Slightly better | 24.0 – 25.5 |
| `band_2.1_to_4` | -2.1 to -4.0 | Moderately better | 22.0 – 23.9 |
| `band_4.1_to_6` | -4.1 to -6.0 | Significantly better | 20.0 – 21.9 |
| `band_over_6` | < -6.0 | Major stretch | < 20.0 |

**Logic**

```php
// For each match with valid opponent.wtn
// Note: negative diff means opponent is better (lower WTN)
$wtn_diff = $opponent_wtn - $player_wtn;

if ($wtn_diff < 0 && $wtn_diff >= -2.0) {
    $band = 'band_0_to_2';
} else if ($wtn_diff < -2.0 && $wtn_diff >= -4.0) {
    $band = 'band_2.1_to_4';
} else if ($wtn_diff < -4.0 && $wtn_diff >= -6.0) {
    $band = 'band_4.1_to_6';
} else if ($wtn_diff < -6.0) {
    $band = 'band_over_6';
}
```

**Output**

```json
computed_metrics.competition_summary.record_vs_higher_rated_wtn_bands = {
  "band_0_to_2": { 
    "wins": 4, 
    "losses": 2,
    "win_pct": 0.667,
    "wtn_range": "24.0-25.5"
  },
  "band_2.1_to_4": { 
    "wins": 1, 
    "losses": 3,
    "win_pct": 0.250,
    "wtn_range": "22.0-23.9"
  },
  "band_4.1_to_6": { 
    "wins": 0, 
    "losses": 2,
    "win_pct": 0.0,
    "wtn_range": "20.0-21.9"
  },
  "band_over_6": { 
    "wins": 0, 
    "losses": 0,
    "win_pct": null,
    "wtn_range": "<20.0"
  }
}
```

---

## 15.3 WTN Competition Summary (Parallel to UTR)

### 15.3.1 Record vs Higher-Rated (WTN)

**Definition**: "Higher-rated opponent (WTN)" = `opponent.wtn < player_wtn` (lower is better).

**Output**

```json
computed_metrics.competition_summary.record_vs_higher_rated_wtn = {
  "wins": wins_vs_higher_wtn,
  "losses": losses_vs_higher_wtn
}

computed_metrics.competition_summary.matches_vs_higher_rated_wtn = [
  {
    "date": "...",
    "round": "...",
    "level": "...",
    "opponent": { "name": "...", "wtn": 22.5 },
    "result": "Loss",
    "score": "..."
  }
]
```

### 15.3.2 Upset Losses (WTN-based)

**Definition of Upset Loss (WTN)**:
- `result === "Loss"`
- `opponent.wtn >= player_wtn + 0.5` (opponent is worse by 0.5+ WTN)

**Output**

```json
computed_metrics.competition_summary.upset_losses_wtn = [
  {
    "date": "...",
    "opponent": { "name": "...", "wtn": 28.5 },
    "result": "Loss",
    "score": "..."
  }
]

computed_metrics.competition_summary.upset_losses_wtn_count = <number>
```

### 15.3.3 Worst Losses (WTN-based) – Top 2

Sort by `opponent.wtn` **descending** (highest/worst WTN first).

**Output**

```json
computed_metrics.competition_summary.worst_losses_wtn_top2 = [
  {
    "date": "...",
    "opponent": { "name": "...", "wtn": 32.1 },
    "result": "Loss",
    "score": "..."
  }
]
```

### 15.3.4 Average WTN Thresholds

**Output**

```json
computed_metrics.competition_summary.average_wtn_in_wins = <number or null>
computed_metrics.competition_summary.average_wtn_in_losses = <number or null>
```

---

## 15.4 WTN Rating Summary & Trajectory

### 15.4.1 WTN Trajectory

**Logic**
- Compare latest WTN to WTN from 6 months ago
- Remember: **lower WTN is improvement**

**Output**

```json
computed_metrics.rating_summary.wtn_trend = "up" | "down" | "flat"
computed_metrics.rating_summary.current_wtn = <number>

computed_metrics.rating_summary.wtn_history = [
  { "date": "2025-06-01", "wtn": 27.1 },
  { "date": "2025-12-01", "wtn": 26.2 }
]
```

**Note:** `wtn_trend = "up"` means the player is **improving** (WTN number decreased).

### 15.4.2 Strength of Schedule (WTN)

**Output**

```json
computed_metrics.rating_summary.average_opponent_wtn = <number>
```

---

## 15.5 Dual Display Format for Report Output

### 15.5.1 Player Profile Display

```
Player: Alana Berry
UTR: 7.75 | WTN: 26.2
```

### 15.5.2 Opponent Display Format

Always show both ratings when available:

```
vs Ivan RYBAK (UTR: 11.38 | WTN: 19.5)
vs Sarah CHEN (UTR: 8.2 | WTN: —)      // WTN unavailable
vs Marco LOPEZ (UTR: — | WTN: 24.8)    // UTR unavailable
```

### 15.5.3 Competition Level Section Format

```markdown
## Competition Level Analysis

### Performance vs Higher-Rated Opponents

**UTR-Based Analysis:**
- vs +0.1 to +0.5 (UTR 7.85-8.25): 5-3 (62%) ✅ Competitive
- vs +0.6 to +1.0 (UTR 8.35-8.75): 2-4 (33%) ⚠️ Struggles
- vs +1.1 to +2.0 (UTR 8.85-9.75): 0-2 (0%) 🔴 Not ready

**WTN-Based Analysis:**
- vs -0.5 to -2 (WTN 24.2-25.7): 4-2 (67%) ✅ Competitive
- vs -2.1 to -4 (WTN 22.2-23.9): 1-3 (25%) ⚠️ Struggles
- vs -4.1 to -6 (WTN 20.2-21.9): 0-2 (0%) 🔴 Not ready
```

### 15.5.4 Rating Trajectory Section Format

```markdown
## Rating & Ranking Analytics

### UTR Trajectory
- Current: 7.75
- 6 months ago: 7.48
- Trend: ↑ Rising (+0.27)

### WTN Trajectory  
- Current: 26.2
- 6 months ago: 27.1
- Trend: ↑ Improving (-0.9)
```

---

## 15.6 Updated JSON Schema for computed_metrics

### 15.6.1 Extended competition_summary

```json
computed_metrics.competition_summary = {
  // Existing UTR fields (keep all from V8)
  "record_vs_higher_rated": { ... },
  "matches_vs_higher_rated": [ ... ],
  "record_vs_12_plus": { ... },
  "record_vs_11_5_plus": { ... },
  "upset_losses": [ ... ],
  "upset_losses_count": <number>,
  "worst_losses_top2": [ ... ],
  "record_by_round": { ... },
  "average_utr_in_wins": <number>,
  "average_utr_in_losses": <number>,
  
  // NEW: Relative UTR bands
  "record_vs_higher_rated_utr_bands": {
    "band_0_to_0.5": { "wins": 0, "losses": 0, "win_pct": null, "utr_range": "..." },
    "band_0.6_to_1": { "wins": 0, "losses": 0, "win_pct": null, "utr_range": "..." },
    "band_1.1_to_2": { "wins": 0, "losses": 0, "win_pct": null, "utr_range": "..." },
    "band_over_2": { "wins": 0, "losses": 0, "win_pct": null, "utr_range": "..." }
  },
  
  // NEW: WTN parallel metrics
  "record_vs_higher_rated_wtn": { "wins": 0, "losses": 0 },
  "matches_vs_higher_rated_wtn": [ ... ],
  "record_vs_higher_rated_wtn_bands": {
    "band_0_to_2": { "wins": 0, "losses": 0, "win_pct": null, "wtn_range": "..." },
    "band_2.1_to_4": { "wins": 0, "losses": 0, "win_pct": null, "wtn_range": "..." },
    "band_4.1_to_6": { "wins": 0, "losses": 0, "win_pct": null, "wtn_range": "..." },
    "band_over_6": { "wins": 0, "losses": 0, "win_pct": null, "wtn_range": "..." }
  },
  "upset_losses_wtn": [ ... ],
  "upset_losses_wtn_count": <number>,
  "worst_losses_wtn_top2": [ ... ],
  "average_wtn_in_wins": <number>,
  "average_wtn_in_losses": <number>
}
```

### 15.6.2 Extended rating_summary

```json
computed_metrics.rating_summary = {
  // Existing UTR fields
  "utr_trend": "up" | "down" | "flat",
  "ranking_trend": "up" | "down" | "flat",
  "utr_history": [ ... ],
  "current_utr": <number>,
  "average_opponent_utr": <number>,
  
  // NEW: WTN fields
  "wtn_trend": "up" | "down" | "flat",
  "wtn_history": [ ... ],
  "current_wtn": <number>,
  "average_opponent_wtn": <number>
}
```

### 15.6.3 Extended opponent object

```json
// In all match arrays (matches_vs_higher_rated, upset_losses, last10.matches, etc.)
"opponent": {
  "name": "...",
  "utr": <number or null>,
  "wtn": <number or null>
}
```

---

## 15.7 Handling Missing Data

### 15.7.1 When Opponent Has Only UTR

- Use UTR-based metrics only
- Set WTN fields to `null`
- Display as: `(UTR: 8.5 | WTN: —)`

### 15.7.2 When Opponent Has Only WTN

- Use WTN-based metrics only
- Set UTR fields to `null`
- Display as: `(UTR: — | WTN: 24.5)`

### 15.7.3 When Opponent Has Neither

- Exclude from rating-based competition analysis
- Include in other metrics (surface, round, level, etc.)
- Display as: `(UTR: — | WTN: —)`

### 15.7.4 Minimum Sample Size

For band-based analysis, consider flagging low-confidence bands:

```json
{
  "band_0.6_to_1": { 
    "wins": 1, 
    "losses": 0,
    "win_pct": 1.0,
    "sample_size": 1,
    "low_confidence": true  // flag if sample_size < 3
  }
}
```

---

## 15.8 Key Contract Summary (V9 Additions)

1. **PHP/MySQL must additionally compute:**
   - `computed_metrics.competition_summary.record_vs_higher_rated_utr_bands`
   - `computed_metrics.competition_summary.record_vs_higher_rated_wtn_bands`
   - All WTN parallel metrics under `competition_summary`
   - All WTN fields under `rating_summary`
   - Extended `opponent` objects with both `utr` and `wtn`

2. **Match data must include:**
   - `opponent.wtn` for each match (nullable)
   - `player_wtn` in player profile

3. **The prompt will be updated to:**
   - Reference both UTR and WTN in competition analysis
   - Use relative bands instead of absolute thresholds
   - Display dual ratings for all opponent references
   - Handle missing ratings gracefully

4. **Report output will show:**
   - Both rating systems in player profile
   - Both rating trajectories
   - Relative band performance for both systems
   - Dual ratings for all opponent mentions
