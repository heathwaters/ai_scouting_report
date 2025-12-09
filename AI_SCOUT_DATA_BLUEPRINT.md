# 🎾 AI SCOUTING REPORT - DATA EXTRACTION & ANALYSIS BLUEPRINT

**Purpose:** Comprehensive mapping of all available data points and the meaningful analyses that can be derived from each contextual asset.

**For:** Development team to understand what data to provide to the AI prompt  
**For:** AI prompt design to ensure all insights are generated

---

## 📋 **TABLE OF CONTENTS**

1. [Player Profile Data](#1-player-profile-data)
2. [USTA Player Record (Match History)](#2-usta-player-record-match-history)
3. [Ranking History (6-7 Month Trends)](#3-ranking-history-6-7-month-trends)
4. [Ranking Snapshot (Top 6 Events)](#4-ranking-snapshot-top-6-events)
5. [Player Report Statistics (Optional Black Book)](#5-player-report-statistics-optional-black-book)
6. [User Profile Data](#6-user-profile-data)
7. [Match Context](#7-match-context)
8. [Pre-Computed Analyses](#8-pre-computed-analyses)
9. [AI-Generated Insights Matrix](#9-ai-generated-insights-matrix)

---

## 1. PLAYER PROFILE DATA

### **Data Points Available:**

| Field | Example Value | Data Type | Source |
|-------|---------------|-----------|--------|
| Player Name | "Max Freedman" | String | USTA API |
| Age Division | "Boys' 18 Singles" | String | USTA API |
| Location | "Boca Raton, FL" | String | USTA API |
| Class Year | 2027 | Integer | USTA API |
| UTR Singles | 11.38 | Float | UTR API |
| UTR Doubles | 10.61 | Float | UTR API |
| WTN Singles | 19.92 | Float | USTA API |
| WTN Doubles | 27.07 | Float | USTA API |
| USTA District Rank | 5 | Integer | USTA API |
| USTA Section Rank | 21 | Integer | USTA API |
| USTA National Rank | 154 | Integer | USTA API |
| Tennis Recruiting Rating | "4-star" or "Blue Chip" | String | TRN API |
| ITF Rank | null or Integer | Integer | ITF API |
| Win-Loss Record | "63-32" | String | USTA API |
| Walkover Count | 8 | Integer | USTA API |

---

### **Meaningful Analyses:**

#### **A. Competitive Level Assessment**

**From UTR Singles (11.38):**
- ✅ Compare to user's UTR → Calculate matchup probability
- ✅ Classify competitive level: "High-level junior (Top 200 nationally)"
- ✅ Identify if UTR matches ranking (e.g., #154 national → expected UTR ~11.2-11.5)

**From USTA Rankings:**
- ✅ District rank #5 → "Top regional player, dominates local tournaments"
- ✅ Section rank #21 → "Elite in Florida (highly competitive section)"
- ✅ National rank #154 → "Borderline top 150, cusp of national recognition"

**From WTN Ratings:**
- ✅ WTN Singles 19.92 → Compare to UTR (should correlate)
- ✅ WTN Doubles 27.07 → Identify if primarily singles player (huge gap = yes)

**From Tennis Recruiting Rating:**
- ✅ "4-star" → "D2/D3 recruit level, possible low D1"
- ✅ "Blue Chip" → "Top D1 recruit, potential pro prospect"

**From Win-Loss Record:**
- ✅ 63-32 (66% win rate) → "Solid winning record, competitive but not dominant"
- ✅ 8 walkovers → "Received 8 free wins (true competitive record: 55-32, 63% win rate)"

#### **B. Location-Based Insights**

**From Location (Boca Raton, FL):**
- ✅ "Florida-based player (used to hot/humid conditions)"
- ✅ "Likely plays year-round (warm climate advantage)"
- ✅ "Plays in one of the toughest sections nationally (Florida)"

#### **C. Age/Class Year Context**

**From Class Year (2027):**
- ✅ Currently ~16 years old (if in 2025)
- ✅ Playing in Boys' 18 division (playing up? or age-appropriate?)
- ✅ Has 2 years left in junior tennis (college recruitment window)

---

### **AI Insights Generated:**

```
OPPONENT PROFILE:
Max Freedman is a high-level junior (UTR 11.38, #154 nationally) based in 
Boca Raton, FL. He's a 4-star recruit competing in the highly competitive 
Florida section, where he ranks #21. His 63-32 record (66% win rate) shows 
he's competitive but beatable at this level. Note: 8 of his wins were walkovers, 
making his true competitive record 55-32 (63%).

COMPETITIVE CONTEXT:
Max primarily focuses on singles (WTN Singles 19.92 vs Doubles 27.07). His UTR 
of 11.38 aligns with his #154 national ranking, suggesting his rating accurately 
reflects his current level.
```

---

## 2. USTA PLAYER RECORD (MATCH HISTORY)

### **Data Points Available (Per Match):**

| Field | Example Value | Data Type | Notes |
|-------|---------------|-----------|-------|
| Match Date | "2025-11-01" | Date | When match was played |
| Tournament Name | "J60 Boca Raton" | String | Event name |
| Tournament Level | "J60" or "L2" or "L3" | String | Competition level |
| Round | "Round 1" or "QF" or "SF" | String | Stage of tournament |
| Draw Type | "Main Draw" or "Qualifier" or "Consolation" | String | Which draw |
| Opponent Name | "Vincenzo Loffredo" | String | Who they played |
| Opponent Country | "ITA" | String | Opponent's nationality |
| **Opponent UTR** | **7.96** | **Float** | **KEY: Opponent strength** |
| **Opponent WTN** | **Not shown in sample, but available** | **Float** | **Additional opponent rating** |
| Result | "Win" or "Loss" | String | Match outcome |
| Score Set 1 User | 6 | Integer | Max's score set 1 |
| Score Set 1 Opponent | 2 | Integer | Opponent's score set 1 |
| Score Set 2 User | 6 | Integer | Max's score set 2 |
| Score Set 2 Opponent | 2 | Integer | Opponent's score set 2 |
| Score Set 3 User | null or Integer | Integer | Max's score set 3 (if played) |
| Score Set 3 Opponent | null or Integer | Integer | Opponent's score set 3 |
| Match Tiebreak User | null or Integer | Integer | Match TB score (if played) |
| Match Tiebreak Opponent | null or Integer | Integer | Match TB score |
| Set Tiebreak Details | "7-6(8)" | String | Regular set TB scores |
| Retired | false or true | Boolean | Did someone retire? |
| Walkover | false or true | Boolean | Was it a walkover? |
| Verified Event | true | Boolean | USTA verified result |
| Used for UTR Calculation | true or false | Boolean | Counts toward UTR |
| Surface | "Hard" or "Clay" | String | Court surface |
| Indoor/Outdoor | "Outdoor" | String | Conditions |
| Event Points | 577 | Integer | USTA points earned (if won) |
| Bonus Points | 214 | Integer | Additional bonus points |

---

### **Meaningful Analyses:**

#### **A. Performance vs Similar UTR Opponents**

**Goal:** Identify how opponent performs against players at YOUR level.

**Analysis:**
1. Filter matches where `opponent_utr` is within ±0.5 of user's UTR
2. Calculate win-loss record in those matches
3. Identify patterns in losses:
   - Did they lose in tiebreaks?
   - Did they lose in 3 sets?
   - Did they retire?

**Example:**
```
Max vs 11.0-11.5 UTR opponents: 14-13 (52% win rate)
• Lost 4 of 7 match tiebreaks (43% win rate in TBs)
• Lost 8 of 19 three-setters (42% win rate in 3-set matches)
→ WEAKNESS: Struggles to close out tight matches
```

---

#### **B. Match Tiebreak Performance (First to 10)**

**Goal:** Identify clutch performance in decisive moments.

**Analysis:**
1. Count matches that went to match tiebreak (3rd set tiebreak, first to 10)
2. Calculate win-loss record in match tiebreaks
3. Note scores (did they lose 9-11, 8-10? Close losses = chokes under pressure)

**Example:**
```
Match Tiebreak Record: 3-4 (43% win rate)
• Lost to James Wakefield [9-11] (very close)
• Lost to Ivan Rybak [6-10] (dominated)
• Lost to Caleb Chow [10-15] (epic battle, couldn't close)
→ WEAKNESS: Vulnerable in match tiebreaks vs similar-level opponents
```

---

#### **C. Set Tiebreak Performance (First to 7)**

**Goal:** Identify composure in tight sets.

**Analysis:**
1. Identify sets that went to tiebreak (7-6)
2. Extract tiebreak scores (e.g., 7-6(8) means won 8-6 in TB)
3. Calculate win-loss record in set tiebreaks

**Example:**
```
Set Tiebreak Record: 5-4 (56% win rate)
• Tends to win 1st set TBs (3-1)
• Struggles in 3rd set TBs (1-3)
→ INSIGHT: Composure fades as match progresses
```

---

#### **D. Three-Set Match Performance**

**Goal:** Assess physical and mental endurance.

**Analysis:**
1. Count matches that went to 3 sets
2. Calculate win-loss record
3. Identify patterns:
   - Does he win more often when winning 1st set?
   - Does he come back from losing 1st set?
   - Does he blow leads (win set 1, lose match)?

**Example:**
```
3-Set Match Record: 18-13 (58% win rate)
• When winning 1st set: 12-4 (75% win rate)
• When losing 1st set: 6-9 (40% win rate)
→ INSIGHT: Struggles to come back from deficits
```

---

#### **E. Retirement Pattern Analysis**

**Goal:** Identify physical or mental fragility.

**Analysis:**
1. Count matches marked as "Retired: true"
2. Identify patterns:
   - What score when retired? (winning or losing?)
   - What stage of match? (early, late, 3rd set?)
   - What type of event? (pressure situations? hot days?)

**Example:**
```
Retirements: 5 in 2025
• 3 retirements in 3-set matches (physical fatigue)
• 2 retirements when losing badly (mental quit)
• All retirements in outdoor events (heat factor?)
→ WEAKNESS: Quits when matches get physically demanding
```

---

#### **F. Surface Performance Analysis**

**Goal:** Identify surface preferences.

**Analysis:**
1. Group matches by surface (Hard, Clay, Grass)
2. Calculate win-loss record per surface
3. Calculate average opponent UTR per surface (to normalize difficulty)

**Example:**
```
Surface Performance:
• Hard Court: 58-25 (70% win rate, avg opponent UTR: 10.2)
• Clay Court: 5-7 (42% win rate, avg opponent UTR: 10.8)
→ STRENGTH: Dominant on hard courts
→ WEAKNESS: Struggles on clay (especially vs stronger opponents)
```

---

#### **G. Tournament Level Performance**

**Goal:** Identify comfort zones and pressure situations.

**Analysis:**
1. Group matches by tournament level (L1, L2, L3, L4, J30, J60, J100, Nationals)
2. Calculate win-loss record per level
3. Identify "step-up" failures (e.g., 0-8 at National level)

**Example:**
```
Tournament Level Performance:
• L4 (Local): 22-5 (81% win rate) — Dominates weaker fields
• L3 (Sectional): 18-10 (64% win rate) — Competitive
• L2 (Regional): 12-8 (60% win rate) — Slight struggle
• L1 (National): 0-3 (0% win rate) — Can't break through
• J60/J100 (ITF): 3-6 (33% win rate) — Out of his depth
→ WEAKNESS: Struggles at elite levels (L1, ITF, Nationals)
```

---

#### **H. Draw Type Performance**

**Goal:** Understand qualifying vs main draw success.

**Analysis:**
1. Group matches by draw type (Main Draw, Qualifier, Consolation)
2. Calculate win-loss record per draw type
3. Identify if he "fights through qualifiers" or "collapses in consolation"

**Example:**
```
Draw Type Performance:
• Main Draw: 35-20 (64% win rate)
• Qualifiers: 18-6 (75% win rate) — Strong in qualies
• Consolation: 10-6 (62% win rate) — Still competes after main draw loss
→ STRENGTH: Mentally resilient (fights through qualifiers, stays focused in consolation)
```

---

#### **I. Opponent UTR Differential Analysis**

**Goal:** Identify how he performs vs stronger/weaker opponents.

**Analysis:**
1. Calculate UTR differential for each match (opponent UTR - player UTR)
2. Group matches by differential:
   - Weaker opponents (UTR -2.0 or lower)
   - Similar opponents (UTR -0.5 to +0.5)
   - Stronger opponents (UTR +0.5 to +2.0)
   - Elite opponents (UTR +2.0 or higher)
3. Calculate win-loss record per group

**Example:**
```
Performance vs Opponent Strength:
• Weaker opponents (UTR -2.0 or lower): 34-2 (94% win rate) — Dominates
• Similar opponents (±0.5 UTR): 14-13 (52% win rate) — Coin flip
• Stronger opponents (+0.5 to +2.0 UTR): 8-12 (40% win rate) — Struggles
• Elite opponents (+2.0 UTR): 0-5 (0% win rate) — Never beaten elite player
→ INSIGHT: Can't beat players significantly better than him
```

---

#### **J. Opponent WTN Analysis**

**Goal:** Cross-validate UTR findings with WTN data.

**Analysis:**
1. For each match, compare opponent's UTR and WTN
2. Identify if Max performs better/worse against certain WTN ranges
3. Use WTN as tiebreaker when UTR data is stale

**Example:**
```
Max vs Opponent WTN Ranges:
• WTN 15-20: 12-3 (80% win rate)
• WTN 20-25: 28-18 (61% win rate)
• WTN 25-30: 8-11 (42% win rate)
→ Correlates with UTR findings (struggles vs higher-rated players)
```

---

#### **K. Recent Form Analysis (Last 10 Matches)**

**Goal:** Identify current momentum and confidence.

**Analysis:**
1. Take last 10 matches chronologically
2. Calculate win-loss record
3. Identify trends:
   - On a win streak?
   - Coming off tough losses?
   - Playing up/down in tournament levels?

**Example:**
```
Recent Form (Last 10 Matches): 7-3 (70% win rate)
• 3 losses all to opponents UTR 11.4+ (lost to better players)
• 7 wins mostly vs UTR 10.0-10.5 (beating weaker opponents)
→ INSIGHT: Decent form, but hasn't beaten anyone at your level recently
```

---

#### **L. Head-to-Head Record (If Applicable)**

**Goal:** Identify specific matchup dynamics.

**Analysis:**
1. Check if user has played this opponent before
2. Extract H2H record, scores, dates
3. Identify if matchup favors one player

**Example:**
```
Head-to-Head: Max vs You (1-1)
• Nov 2024: You WON 6-4, 4-6, [10-8] (close match TB)
• May 2024: You LOST 3-6, 6-7(4) (struggled on his serve)
→ INSIGHT: Even matchup, both matches were tight
→ TACTICAL EDGE: You've proven you can beat him in tiebreaks
```

---

#### **M. Score Pattern Analysis**

**Goal:** Identify dominant wins vs grinding wins.

**Analysis:**
1. Categorize wins by dominance:
   - Bagels/Breadsticks (6-0, 6-1, 6-2): Dominant wins
   - Straight sets close (6-4, 7-5): Solid wins
   - Three-setters: Grinding wins
2. Calculate percentage of each type

**Example:**
```
Win Quality Breakdown:
• Dominant wins (6-0, 6-1): 18 matches (29% of wins)
• Straight set close wins: 25 matches (40% of wins)
• Three-set grinding wins: 20 matches (31% of wins)
→ INSIGHT: Mix of dominant and grinding wins (adaptable player)
```

---

#### **N. Time/Date Performance Patterns**

**Goal:** Identify if performance varies by season, time of year.

**Analysis:**
1. Group matches by month/season
2. Identify if win rate drops in certain periods (e.g., summer fatigue, back-to-school slump)

**Example:**
```
Seasonal Performance:
• Winter (Dec-Feb): 15-5 (75% win rate) — Peak form
• Spring (Mar-May): 18-12 (60% win rate) — Good but not peak
• Summer (Jun-Aug): 12-10 (55% win rate) — Struggles in heat?
• Fall (Sep-Nov): 18-5 (78% win rate) — Strong finish
→ INSIGHT: Weaker in summer months (heat/fatigue factor?)
```

---

## 3. RANKING HISTORY (6-7 MONTH TRENDS)

### **Data Points Available:**

| Field | Example Value | Data Type | Notes |
|-------|---------------|-----------|-------|
| Date | "2025-11-01" | Date | Monthly snapshot |
| USTA District Rank | 5 | Integer | District ranking |
| USTA Section Rank | 21 | Integer | Section ranking |
| USTA National Rank | 154 | Integer | National ranking |
| UTR Singles | 11.38 | Float | UTR rating |
| WTN Singles | 19.92 | Float | WTN rating |

**Sample Data (6 months):**
```
2025-11: District 5, Section 21, National 154, UTR 11.38, WTN 19.92
2025-10: District 7, Section 22, National 167, UTR 11.39, WTN 20.09
2025-09: District 7, Section 21, National 171, UTR 11.40, WTN 19.98
2025-08: District 6, Section 20, National 171, UTR 11.42, WTN 20.00
2025-07: District 7, Section 21, National 162, UTR 11.45, WTN 20.64
2025-06: District 7, Section 21, National 161, UTR 11.48, WTN 20.75
2025-05: District 7, Section 24, National 189, UTR 11.54, WTN 20.18
```

---

### **Meaningful Analyses:**

#### **A. National Ranking Trend**

**Goal:** Identify momentum (rising, falling, stagnant).

**Analysis:**
```
May 2025: #189
Nov 2025: #154
Change: +35 spots (improved)
Trend: RISING
```

**AI Insight:**
```
⚠️ RISING OPPONENT ALERT:
Max has improved +35 national ranking spots in 6 months (#189 → #154).
He's on an upward trajectory with growing confidence.

Psychological Profile:
• High confidence (consistent improvement)
• Dangerous opponent (momentum on his side)
• Likely playing fearless tennis (nothing to lose mentality)
```

---

#### **B. UTR Trend**

**Goal:** Identify if rating matches ranking trend.

**Analysis:**
```
May 2025: UTR 11.54
Nov 2025: UTR 11.38
Change: -0.16 (declined)
Trend: DECLINING
```

**AI Insight:**
```
🔴 CONTRADICTORY SIGNALS:
Max's national ranking improved (+35 spots), but his UTR declined (-0.16).

Possible Explanations:
• He's earning USTA points without beating strong opponents (playing down in level)
• His ranking is inflated (old points from 6-12 months ago)
• His recent competition has been weaker (UTR reflects recent strength of schedule)

TACTICAL ADVANTAGE:
His #154 ranking may overstate his current ability. His UTR (11.38) suggests he's 
actually closer to #170-180 level. Don't be intimidated by his ranking.
```

---

#### **C. WTN Trend**

**Goal:** Additional rating validation.

**Analysis:**
```
May 2025: WTN 20.18
Nov 2025: WTN 19.92
Change: -0.26 (improved, lower is better for WTN)
Trend: IMPROVING
```

**AI Insight:**
```
📊 MIXED SIGNALS:
• National Ranking: IMPROVING ↑
• UTR: DECLINING ↓
• WTN: IMPROVING ↑ (lower is better)

Interpretation: Max's ranking and WTN suggest improvement, but UTR decline 
indicates weaker strength of schedule recently. His true form may be between 
his peak (UTR 11.54) and current (UTR 11.38).
```

---

#### **D. Volatility Analysis**

**Goal:** Identify consistency vs boom/bust swings.

**Analysis:**
```
National Rank Range: #154 to #189 (35-spot swing)
UTR Range: 11.38 to 11.54 (0.16 swing)

Volatility: MODERATE
```

**AI Insight:**
```
Max's rankings show moderate volatility (35-spot swings), suggesting:
• Inconsistent tournament results (big wins followed by early losses)
• Not yet at a stable plateau
• Vulnerable to momentum shifts

TACTICAL ADVANTAGE:
If you can break his confidence early (e.g., win first set decisively), he may 
spiral downward (his volatility suggests mental inconsistency).
```

---

#### **E. Stagnation Detection**

**Goal:** Identify if player has plateaued.

**Analysis:**
```
Last 3 months: National #154, #167, #171 (average ~164)
Previous 3 months: National #162, #161, #189 (average ~170)
Overall trend: Slight improvement, but recent stagnation
```

**AI Insight:**
```
🟡 RECENT PLATEAU DETECTED:
Max improved from #189 (May) to #154 (Nov), but has stagnated around #160-170 
for the last 3 months.

Psychological Profile:
• May be stuck at current level (can't break through to next tier)
• Comfortable in #150-170 range (lacks urgency to improve)
• Beatable by players who want it more

YOUR EDGE:
Breakthrough mentality beats comfort zone mentality. Play with urgency.
```

---

#### **F. Projection Trend**

**Goal:** Predict future ranking trajectory.

**Analysis:**
```
6-month trend: +35 spots improvement
Monthly average: +5.8 spots/month
Projected 3-month outlook: #135-140 (if trend continues)
```

**AI Insight:**
```
FUTURE PROJECTION:
If Max maintains current trajectory, he'll be #135-140 by Feb 2026.
However, UTR decline suggests this projection may be optimistic.

IMPLICATION:
• Face him NOW while you can (he may be stronger in 3 months)
• Or, his ranking improvement is unsustainable (due to UTR decline)
```

---

## 4. RANKING SNAPSHOT (TOP 6 EVENTS)

### **Data Points Available (Per Event):**

| Field | Example Value | Data Type | Notes |
|-------|---------------|-----------|-------|
| Event Date | "2025-05-16" | Date | When event was played |
| Event Name | "Key Biscayne L2" | String | Tournament name |
| Total Points | 577 | Integer | Total USTA points earned |
| Singles Points | 363 | Integer | Points from singles (100%) |
| Doubles Points | 0 | Integer | Points from doubles (15% of total) |
| Bonus Points | 214 | Integer | Bonus points for level/performance |
| Title/Finish | "L2-Finals" or "L3-Champion" | String | How far they went |
| Event Level | "L2" | String | Tournament level |
| Surface | "Hard" | String | Court surface |
| Location | "Key Biscayne, FL" | String | Where it was played |
| Age Division | "Boys' 18" | String | Which division |

**Sample Top 6:**
```
1. May 16, 2025 - Key Biscayne L2 - 577 pts (S: 363, D: 0, Bonus: 214) - Finals - Hard
2. Apr 10, 2025 - Torneo Juvenil L4 - 540 pts (S: 540, D: 0, Bonus: 0) - Champion - Hard
3. Feb 7, 2025 - Key Biscayne L2 - 539 pts (S: 314, D: 0, Bonus: 225) - ? - Hard
4. Oct 10, 2025 - Naples L2 - 487 pts (S: 363, D: 0, Bonus: 124) - ? - Hard
5. May 9, 2025 - Delray Championships L4 - 427 pts (S: 405, D: 0, Bonus: 22) - ? - Hard
6. Jul 31, 2025 - USTA Nationals L1 - 424 pts (S: 210, D: 0, Bonus: 214) - ? - Hard
```

---

### **Meaningful Analyses:**

#### **A. Point Defense Pressure Analysis (CRITICAL)**

**Goal:** Identify which points are expiring soon (12-month rolling).

**Calculation:**
```
Today's Date: Nov 10, 2025
Match Date (from user): Nov 15, 2025

Event #1: Key Biscayne L2 (May 16, 2025) — 577 points
  Days since earned: Nov 15 - May 16 = 183 days
  Days until expiry: 365 - 183 = 182 days (expires May 16, 2026)
  Pressure Level: LOW (not expiring soon)

Event #2: Torneo Juvenil L4 (Apr 10, 2025) — 540 points
  Days since earned: Nov 15 - Apr 10 = 219 days
  Days until expiry: 365 - 219 = 146 days (expires Apr 10, 2026)
  Pressure Level: LOW

Event #3: Key Biscayne L2 (Feb 7, 2025) — 539 points
  Days since earned: Nov 15 - Feb 7 = 281 days
  Days until expiry: 365 - 281 = 84 days (expires Feb 7, 2026)
  Pressure Level: MEDIUM (expiring in ~12 weeks)

IF match was Feb 5, 2026 (2 days before expiry):
  Days until expiry: 2 days
  Pressure Level: CRITICAL (defending 539 points THIS WEEKEND)
```

**AI Insight (Example: HIGH PRESSURE):**
```
🔴 CRITICAL PSYCHOLOGICAL FACTOR:
Max is defending 539 points THIS WEEKEND (Key Biscayne L2, expires Feb 7).

If he loses early, he drops ~35-40 national ranking spots (#154 → #190s).
This is his 3rd-biggest result of the year.

Expect Max to be:
• Extremely tight/nervous (high-stakes situation)
• Possibly over-aggressive (trying too hard to defend)
• Vulnerable to early deficits (panic if down 0-3 in first set)
• Prone to mental spiral if losing (pressure compounding)

YOUR TACTICAL ADVANTAGE:
🎯 START AGGRESSIVELY — Put immediate pressure on him
🎯 If you break serve early, his confidence may crumble
🎯 Stay patient — Let the pressure work FOR you, not against you
🎯 He's thinking about rankings, you focus on winning points
```

**AI Insight (Example: LOW PRESSURE):**
```
✅ LOW PRESSURE SITUATION:
Max is NOT defending any major points this weekend.
His top 6 results are safe for 3-6 months.

Expect Max to be:
• Relaxed/confident (no pressure to defend ranking)
• Playing freely (nothing to lose mentality)
• Dangerous opponent (fearless tennis)

YOUR RESPONSE:
• Don't give him free points (he's confident, make him earn it)
• Match his intensity from Game 1
• Break his confidence early (take away his comfort)
```

---

#### **B. Surface Preference from Top Results**

**Goal:** Identify which surface produces his best results.

**Analysis:**
```
Top 6 Events by Surface:
• Hard Court: 6 events (100%)
• Clay: 0 events (0%)
• Grass: 0 events (0%)

Conclusion: HARD COURT SPECIALIST
```

**AI Insight:**
```
🎾 SURFACE ANALYSIS:
ALL of Max's top 6 results came on hard courts. He's a hard court specialist.

Match Context: You're playing on HARD COURT
→ This is Max's preferred surface (advantage: MAX)
→ Expect him to be confident and comfortable
→ You'll need to execute your game plan perfectly to win
```

---

#### **C. Tournament Level Preference**

**Goal:** Identify which level produces his best results.

**Analysis:**
```
Top 6 Events by Level:
• L2 (Regional): 3 events (577, 539, 487 pts) — 50% of top 6
• L4 (Local): 2 events (540, 427 pts) — 33% of top 6
• L1 (National): 1 event (424 pts) — 17% of top 6

Conclusion: Most comfortable at L2-L4 level
```

**AI Insight:**
```
🏆 TOURNAMENT LEVEL COMFORT ZONE:
Max's biggest results come from L2 (Regional) and L4 (Local) events.
His only L1 (National) result was 424 points (modest for that level).

Match Context: You're playing at L2 level
→ This is Max's comfort zone (advantage: MAX)
→ He has 3 of his top 6 results at L2 events
→ Expect him to feel at home at this level
```

---

#### **D. Recent vs Old Results Analysis**

**Goal:** Identify if ranking is "fresh" or "stale".

**Analysis:**
```
Top 6 Events by Recency:
1. Oct 10, 2025 (1 month ago) — 487 pts — FRESH
2. Jul 31, 2025 (3 months ago) — 424 pts — RECENT
3. May 16, 2025 (6 months ago) — 577 pts — AGING
4. May 9, 2025 (6 months ago) — 427 pts — AGING
5. Apr 10, 2025 (7 months ago) — 540 pts — OLD
6. Feb 7, 2025 (9 months ago) — 539 pts — VERY OLD

Average Age of Top 6: 5.3 months

Conclusion: MODERATELY STALE (most results 5-9 months old)
```

**AI Insight:**
```
⚠️ STALE RANKING WARNING:
Max's top 6 results average 5.3 months old. Only 1 result is from the last 3 months.

IMPLICATION:
• His #154 ranking reflects PAST performance (spring/summer 2025)
• He hasn't earned a major result recently (since October)
• His current form may not match his ranking

YOUR ADVANTAGE:
His ranking is inflated by old results. His recent play (UTR 11.38 declining) 
suggests he's actually closer to #170-180 level right now. Attack with confidence.
```

---

#### **E. Doubles vs Singles Focus**

**Goal:** Identify if player splits focus between singles and doubles.

**Analysis:**
```
Top 6 Singles Points: 363 + 540 + 314 + 363 + 405 + 210 = 2,195 pts
Top 6 Doubles Points: 0 + 0 + 0 + 0 + 0 + 0 = 0 pts

Conclusion: 100% SINGLES FOCUS
```

**AI Insight:**
```
Max is a pure singles player (0 doubles points in his top 6).
This means:
• All his training/focus is on singles (no energy split)
• He's likely tactically sound for singles (specialized)
• BUT: No doubles experience means he may struggle with net play/volleys
```

---

#### **F. Bonus Points Analysis**

**Goal:** Understand how he earned his points (dominance vs bonus points).

**Analysis:**
```
Event #1: 363 singles + 214 bonus = 577 total (37% bonus)
Event #2: 540 singles + 0 bonus = 540 total (0% bonus) — Won tournament
Event #3: 314 singles + 225 bonus = 539 total (42% bonus)

Conclusion: Mixed (some tournaments won, others bonus-heavy)
```

**AI Insight:**
```
Max's points breakdown:
• 1 tournament championship (L4 Torneo Juvenil — 540 pts, no bonus)
• 2 finals/semifinals with heavy bonus points (37-42% bonus)

INTERPRETATION:
• He CAN win tournaments at L4 level (dominance at local level)
• At L2 level, he reaches finals/semis but doesn't win (competitive but not dominant)
```

---

#### **G. Geographic Comfort Analysis**

**Goal:** Identify home court advantage.

**Analysis:**
```
Top 6 Events by Location:
• Florida: 5 events (Key Biscayne x2, Naples, Delray, Torneo Juvenil)
• National (out-of-state): 1 event (USTA Nationals)

Conclusion: FLORIDA-DOMINANT
```

**AI Insight:**
```
🏠 HOME COURT ADVANTAGE:
83% of Max's top results are from Florida tournaments.
Only 1 result from out-of-state (Nationals).

Match Context: You're playing in [LOCATION]
→ If in Florida: Max has home court advantage (familiar conditions, courts, competition)
→ If out-of-state: Max may be less comfortable (travel, unfamiliar setting)
```

---

## 5. PLAYER REPORT STATISTICS (OPTIONAL BLACK BOOK)

### **Data Points Available:**

| Field | Example Value | Data Type | Notes |
|-------|---------------|-----------|-------|
| First Serve % | 58% | Float | Percentage of first serves in |
| Second Serve % | 45% | Float | Percentage of second serves in |
| Double Faults (avg) | 5 per match | Float | Average double faults per match |
| Forehand Winners (avg) | 18 per match | Integer | Forehand winners |
| Backhand Winners (avg) | 8 per match | Integer | Backhand winners |
| Forehand Errors (avg) | 22 per match | Integer | Forehand unforced errors |
| Backhand Errors (avg) | 15 per match | Integer | Backhand unforced errors |
| Net Winners (avg) | 12 per match | Integer | Successful volleys/overheads |
| Net Errors (avg) | 6 per match | Integer | Missed volleys/overheads |
| Break Point Conversion % | 35% | Float | % of break points converted |
| Break Points Saved % | 62% | Float | % of break points saved |
| Aces (avg) | 3 per match | Integer | Aces per match |
| Rally Tolerance (avg) | 4.2 shots | Float | Average rally length |
| Tiebreak Record | 5-8 | String | Tiebreak win-loss record |
| Custom Notes | "Struggles with high balls to backhand" | String | User observations |

---

### **Meaningful Analyses:**

#### **A. Serve Quality Assessment**

**Analysis:**
```
First Serve %: 58% (Tour avg: 65%) → BELOW AVERAGE
Second Serve %: 45% (Tour avg: 50%) → BELOW AVERAGE
Double Faults: 5 per match (Tour avg: 3) → HIGH
Aces: 3 per match (Tour avg: 4) → BELOW AVERAGE
```

**AI Insight:**
```
🎯 SERVE WEAKNESS DETECTED:
Max's serve is his BIGGEST WEAKNESS:
• Low 1st serve % (58% vs 65% avg) — Inconsistent
• Low 2nd serve % (45% vs 50% avg) — Vulnerable
• High double fault rate (5 vs 3 avg) — Nerves under pressure
• Low ace rate (3 vs 4 avg) — Lacks power

TACTICAL ADVANTAGE:
🎾 Stand INSIDE the baseline on second serve returns
🎾 Attack his second serve aggressively (force errors)
🎾 Expect 5+ double faults (let him beat himself)
🎾 Don't give him free holds (pressure every service game)
```

---

#### **A. Groundstroke Analysis**

**Analysis:**
```
Forehand: 18 winners, 22 errors → Winner/Error Ratio: 0.82 (NEGATIVE)
Backhand: 8 winners, 15 errors → Winner/Error Ratio: 0.53 (VERY NEGATIVE)

Conclusion: ERROR-PRONE player (more errors than winners)
```

**AI Insight:**
```
🔴 GROUNDSTROKE WEAKNESS:
Max makes MORE errors than winners on both wings:
• Forehand: 22 errors vs 18 winners (net -4)
• Backhand: 15 errors vs 8 winners (net -7)

TACTICAL STRATEGY:
🎾 GRIND HIM DOWN — Long rallies favor you (he'll make errors)
🎾 Target his backhand (2:1 error ratio, clear weakness)
🎾 Don't go for low-percentage winners (let him make mistakes)
🎾 Consistency beats aggression in this matchup
```

---

#### **C. Net Play Analysis**

**Analysis:**
```
Net Winners: 12
Net Errors: 6
Net Success Rate: 67% (12 / 18 total)
Net Approach Frequency: 18 approaches per match

Conclusion: DECENT net player (67% success rate)
```

**AI Insight:**
```
⚠️ DECENT NET GAME:
Max approaches the net 18 times per match with 67% success rate.
This is ABOVE AVERAGE for junior players (avg: 55%).

TACTICAL RESPONSE:
🎾 Passing shots are risky (he's 67% successful at net)
🎾 Lob when he approaches (force him to hit overheads under pressure)
🎾 Hit low to his feet (hardest volley to handle)
🎾 If you approach net, expect him to try passing shots (he's used to being passed)
```

---

#### **D. Break Point Conversion Analysis**

**Analysis:**
```
Break Point Conversion: 35% (Tour avg: 40%) → BELOW AVERAGE
Break Points Saved: 62% (Tour avg: 60%) → AVERAGE

Conclusion: WEAK on opponent's serve (can't break), AVERAGE holding serve
```

**AI Insight:**
```
🎯 CLUTCH PERFORMANCE WEAKNESS:
Max converts only 35% of break points (below average).
This means he CHOKES under pressure when he has chances to break.

TACTICAL ADVANTAGE:
🎾 Stay solid on your serve (he struggles to break even when he has chances)
🎾 Fight off break points (he's only 35% likely to convert)
🎾 Be aggressive on HIS break points (attack his second serve, he'll tighten up)
```

---

#### **E. Rally Tolerance Analysis**

**Analysis:**
```
Average Rally Length: 4.2 shots
Interpretation: FIRST-STRIKE player (not a grinder)

Baseline: Typical junior avg: 5-6 shots
```

**AI Insight:**
```
Max prefers short points (avg 4.2 shots per rally).
He's a first-strike player, not a grinder.

TACTICAL COUNTER:
🎾 EXTEND RALLIES — Make him hit 8-12 shots (outside his comfort zone)
🎾 Don't let him dictate with early aggression
🎾 Moon balls, change of pace (frustrate his first-strike game)
🎾 Long matches favor you (he's not built for grinding)
```

---

#### **F. Custom Notes Integration**

**Analysis:**
```
User Note: "Struggles with high balls to backhand"
```

**AI Insight:**
```
📝 USER OBSERVATION (High-Value Intel):
You've noted that Max struggles with high balls to his backhand.

TACTICAL EXPLOITATION:
🎾 Hit heavy topspin to his backhand (shoulder height or higher)
🎾 Mix in moonballs to his backhand when he's behind baseline
🎾 Use slice approach shots to his backhand (forces low-to-high lift)
🎾 This is YOUR secret weapon — exploit it relentlessly
```

---

## 6. USER PROFILE DATA

### **Data Points Available:**

| Field | Example Value | Data Type | Notes |
|-------|---------------|-----------|-------|
| User UTR | 11.16 | Float | User's rating |
| Playing Style | "All-Court Aggressive" | String | User's self-reported style |
| Rally to Net | true | Boolean | User likes to develop points then attack net |
| Likes Long Rallies | true | Boolean | User comfortable in extended rallies |
| Strong Serve | false | Boolean | User doesn't have big serve |
| Good Volleys | true | Boolean | User solid at net |
| Recent Form | "7-3 (last 10)" | String | User's recent W-L record |
| Strengths | ["Net game", "Consistency"] | Array | User's strengths |
| Weaknesses | ["Backhand", "Movement"] | Array | User's weaknesses |

---

### **Meaningful Analyses:**

#### **A. UTR Matchup Probability**

**Analysis:**
```
User UTR: 11.16
Opponent UTR: 11.38
Differential: -0.22 (User is slightly lower)

Win Probability Calculation (Logistic Function):
P(win) = 1 / (1 + 10^((-0.22) / 1.5))
P(win) = 1 / (1 + 10^(-0.147))
P(win) = 1 / (1 + 0.713)
P(win) = 1 / 1.713
P(win) = 0.584 or 58%... wait, that's wrong direction.

Let me recalculate:
UTR differential from USER perspective: 11.16 - 11.38 = -0.22
P(win) = 1 / (1 + 10^((opponent_utr - user_utr) / 1.5))
P(win) = 1 / (1 + 10^((11.38 - 11.16) / 1.5))
P(win) = 1 / (1 + 10^(0.22 / 1.5))
P(win) = 1 / (1 + 10^0.147)
P(win) = 1 / (1 + 1.40)
P(win) = 1 / 2.40
P(win) = 0.417 or 42%

So: User 42%, Opponent 58%
```

**AI Insight:**
```
📊 BASE WIN PROBABILITY (UTR-Based):
You: 42% | Max: 58% (Max slight favorite due to +0.22 UTR edge)

However, this is just the statistical baseline. Your actual win probability 
is HIGHER because:
• Max struggles in match tiebreaks (43% win rate)
• Your net game exploits his baseline-only style
• Max has weak serve (58% 1st serve %, 5 DFs/match)
• You thrive in long rallies (Max prefers short points)

ADJUSTED WIN PROBABILITY: ~48-52% (EVEN MATCHUP)
```

---

#### **B. Style Matchup Analysis**

**Analysis:**
```
User Style: All-Court Aggressive (Rally → Net)
Opponent Style: Baseline Grinder (inferred from data)

Matchup Dynamic:
• User strengths (net game, volleys) vs Opponent weakness (no doubles, baseline-only)
• User weakness (backhand) vs Opponent strength (targets backhand, 15 BH errors/match from opponents)
```

**AI Insight:**
```
🎯 STYLE MATCHUP ADVANTAGE: YOU

Your all-court aggressive style is PERFECT counter to Max's baseline game:
• You develop rallies (his comfort zone initially)
• Then attack net (his nightmare — he has no doubles experience, 0 doubles points)
• Your net game forces him into low-percentage passing shots
• His error-prone groundstrokes (22 FH errors, 15 BH errors) = free points when you're at net

TACTICAL EDGE:
Your playing style is his kryptonite. Execute your game plan and you WIN.
```

---

#### **C. Strengths vs Weaknesses Matchup**

**Analysis:**
```
USER STRENGTHS vs OPPONENT WEAKNESSES:
✅ Your Net Game → Max's Baseline-Only Play (he can't handle net players)
✅ Your Consistency → Max's Error-Prone (22 FH errors, 15 BH errors)
✅ Your Long Rally Tolerance → Max's Short Point Preference (4.2 shot avg)

USER WEAKNESSES vs OPPONENT STRENGTHS:
⚠️ Your Backhand → Max Targets Backhands (but he makes 15 BH errors himself)
⚠️ Your Movement → Max's Aggressive Style (first-strike tennis)
```

**AI Insight:**
```
MATCHUP MATRIX:
Your strengths align PERFECTLY with his weaknesses.
Your weaknesses are MANAGEABLE against his strengths.

NET ASSESSMENT: FAVORABLE MATCHUP FOR YOU

Even though Max has higher UTR, your playing style gives you a significant edge.
```

---

## 7. MATCH CONTEXT

### **Data Points Available:**

| Field | Example Value | Data Type | Notes |
|-------|---------------|-----------|-------|
| Surface | "Hard" | String | Court surface |
| Tournament Level | "L2" | String | Competition level |
| Conditions | "Outdoor, Sunny" | String | Weather conditions |
| Match Date | "2025-11-15" | Date | When match is scheduled |
| Location | "Key Biscayne, FL" | String | Where match is |
| Temperature | "85°F" | String | Expected temp (optional) |
| Humidity | "70%" | String | Expected humidity (optional) |

---

### **Meaningful Analyses:**

#### **A. Surface Context**

**Analysis:**
```
Match Surface: Hard Court
Opponent's Hard Court Record: 58-25 (70% win rate)
Opponent's Top 6 Results: 6/6 on hard court (100%)

Conclusion: Max's PREFERRED SURFACE
```

**AI Insight:**
```
🎾 SURFACE ADVANTAGE: MAX

You're playing on Max's preferred surface (hard court).
ALL of his top 6 results came on hard courts.
He has 70% win rate on hard courts.

IMPLICATION:
• Expect Max to be confident and comfortable
• He knows how to play on hard courts (court speed, bounce, tactics)
• You'll need to execute your game plan perfectly

COUNTER:
• Your net game disrupts surface advantage (volleys minimize rallies)
• Force him out of his comfort zone (change pace, drop shots, lobs)
```

---

#### **B. Tournament Level Context**

**Analysis:**
```
Match Level: L2 (Regional)
Opponent's L2 Record: 12-8 (60% win rate)
Opponent's Top 6 Results: 3/6 at L2 level (50%)

Conclusion: Max's COMFORT ZONE
```

**AI Insight:**
```
🏆 TOURNAMENT LEVEL: MAX'S COMFORT ZONE

Max has 3 of his top 6 results at L2 level.
He's 12-8 (60% win rate) at L2 events.

IMPLICATION:
• This is Max's sweet spot (not too easy, not too hard)
• He's comfortable at this level of competition

YOUR RESPONSE:
• Don't be intimidated (60% win rate means he loses 40% of the time)
• You're in the 40% that can beat him at this level
• Believe in your game plan
```

---

#### **C. Weather/Conditions Context**

**Analysis:**
```
Conditions: Outdoor, Sunny, 85°F, 70% humidity
Opponent Location: Boca Raton, FL (used to heat/humidity)
Opponent Retirement Pattern: 5 retirements in 2025 (some in hot conditions?)

User Location: [Unknown]
```

**AI Insight:**
```
☀️ WEATHER CONDITIONS:

Hot and humid conditions (85°F, 70% humidity).

ADVANTAGE: MAX (Florida-based, used to heat)

However, Max has retired 5 times in 2025, some potentially in hot conditions.
If the match goes long (2+ hours), physical endurance becomes a factor.

TACTICAL RESPONSE:
• Stay hydrated (you may not be used to Florida heat)
• Extend points (make him work in the heat)
• Long rallies = physical warfare (test his endurance)
• Watch for retirement warning signs (slowing down, negative body language)
```

---

#### **D. Date/Point Defense Context (CRITICAL)**

**Analysis:**
```
Match Date: Nov 15, 2025
Opponent's Top 6 Events:
  1. May 16, 2025 — 577 pts — Expires May 16, 2026 (182 days away)
  2. Apr 10, 2025 — 540 pts — Expires Apr 10, 2026 (146 days away)
  3. Feb 7, 2025 — 539 pts — Expires Feb 7, 2026 (84 days away)

Conclusion: NO MAJOR POINTS EXPIRING SOON
```

**AI Insight:**
```
✅ LOW PRESSURE SITUATION:

Max is NOT defending any major points this weekend.
His closest expiring result is 84 days away (Feb 7 event).

IMPLICATION:
• Max will be relaxed (no ranking pressure)
• Playing freely (nothing to lose mentality)
• Dangerous opponent (fearless tennis)

YOUR RESPONSE:
• Match his intensity from Game 1
• Don't give him free confidence (stay aggressive)
• Break his rhythm early (take away his comfort)
```

---

## 8. PRE-COMPUTED ANALYSES

**These should be calculated by the backend BEFORE sending to AI (saves tokens, ensures consistency).**

### **Pre-Computation Functions:**

#### **A. Rating Trend Analysis**

**Function:**
```javascript
function analyzeRatingTrend(ratingHistory) {
  const oldest = ratingHistory[ratingHistory.length - 1];
  const newest = ratingHistory[0];
  
  const utrChange = newest.utr - oldest.utr;
  const natRankChange = oldest.nat_rank - newest.nat_rank; // Lower rank number = better
  
  let utrTrend = "stagnant";
  if (utrChange > 0.1) utrTrend = "improving";
  else if (utrChange < -0.1) utrTrend = "declining";
  
  let rankTrend = "stagnant";
  if (natRankChange > 15) rankTrend = "improving";
  else if (natRankChange < -15) rankTrend = "declining";
  
  let momentum = "neutral";
  if (utrTrend === "improving" && rankTrend === "improving") momentum = "positive";
  else if (utrTrend === "declining" && rankTrend === "declining") momentum = "negative";
  else if (utrTrend !== rankTrend) momentum = "mixed";
  
  return {
    utr_trend: utrTrend,
    utr_change: utrChange,
    rank_trend: rankTrend,
    rank_change: natRankChange,
    momentum: momentum
  };
}
```

**Output:**
```json
{
  "utr_trend": "declining",
  "utr_change": -0.16,
  "rank_trend": "improving",
  "rank_change": 35,
  "momentum": "mixed"
}
```

---

#### **B. Point Defense Pressure Calculation**

**Function:**
```javascript
function calculatePointPressure(top6Events, matchDate) {
  const matchDateObj = new Date(matchDate);
  
  return top6Events.map(event => {
    const eventDateObj = new Date(event.date);
    const daysSinceEvent = (matchDateObj - eventDateObj) / (1000 * 60 * 60 * 24);
    const daysUntilExpiry = 365 - daysSinceEvent;
    
    let pressureLevel = "low";
    if (daysUntilExpiry <= 14) pressureLevel = "critical";
    else if (daysUntilExpiry <= 60) pressureLevel = "high";
    else if (daysUntilExpiry <= 120) pressureLevel = "medium";
    
    return {
      ...event,
      days_until_expiry: Math.round(daysUntilExpiry),
      pressure_level: pressureLevel
    };
  });
}
```

**Output:**
```json
[
  {
    "date": "2025-05-16",
    "event": "Key Biscayne L2",
    "points": 577,
    "days_until_expiry": 182,
    "pressure_level": "low"
  },
  {
    "date": "2025-02-07",
    "event": "Key Biscayne L2",
    "points": 539,
    "days_until_expiry": 84,
    "pressure_level": "medium"
  }
]
```

---

#### **C. Surface Preference Analysis**

**Function:**
```javascript
function analyzeSurfacePerformance(matches) {
  const surfaceStats = {};
  
  matches.forEach(match => {
    if (!surfaceStats[match.surface]) {
      surfaceStats[match.surface] = { wins: 0, losses: 0, total: 0 };
    }
    surfaceStats[match.surface].total++;
    if (match.result === "win") surfaceStats[match.surface].wins++;
    else surfaceStats[match.surface].losses++;
  });
  
  Object.keys(surfaceStats).forEach(surface => {
    const stats = surfaceStats[surface];
    stats.win_pct = (stats.wins / stats.total * 100).toFixed(1);
  });
  
  return surfaceStats;
}
```

**Output:**
```json
{
  "hard": {
    "wins": 58,
    "losses": 25,
    "total": 83,
    "win_pct": "69.9"
  },
  "clay": {
    "wins": 5,
    "losses": 7,
    "total": 12,
    "win_pct": "41.7"
  }
}
```

---

#### **D. Tournament Level Performance**

**Function:**
```javascript
function analyzeTournamentLevelPerformance(matches) {
  const levelStats = {};
  
  matches.forEach(match => {
    if (!levelStats[match.level]) {
      levelStats[match.level] = { wins: 0, losses: 0, total: 0 };
    }
    levelStats[match.level].total++;
    if (match.result === "win") levelStats[match.level].wins++;
    else levelStats[match.level].losses++;
  });
  
  Object.keys(levelStats).forEach(level => {
    const stats = levelStats[level];
    stats.win_pct = (stats.wins / stats.total * 100).toFixed(1);
  });
  
  return levelStats;
}
```

**Output:**
```json
{
  "L4": {"wins": 22, "losses": 5, "total": 27, "win_pct": "81.5"},
  "L3": {"wins": 18, "losses": 10, "total": 28, "win_pct": "64.3"},
  "L2": {"wins": 12, "losses": 8, "total": 20, "win_pct": "60.0"},
  "L1": {"wins": 0, "losses": 3, "total": 3, "win_pct": "0.0"},
  "J60": {"wins": 2, "losses": 2, "total": 4, "win_pct": "50.0"},
  "J100": {"wins": 0, "losses": 2, "total": 2, "win_pct": "0.0"},
  "Nationals": {"wins": 0, "losses": 2, "total": 2, "win_pct": "0.0"}
}
```

---

#### **E. Recent Form (Last 10 Matches)**

**Function:**
```javascript
function calculateRecentForm(matches, count = 10) {
  const recent = matches.slice(0, count);
  const wins = recent.filter(m => m.result === "win").length;
  const losses = recent.filter(m => m.result === "loss").length;
  
  return {
    record: `${wins}-${losses}`,
    win_pct: (wins / count * 100).toFixed(1),
    matches: recent.map(m => ({
      date: m.date,
      opponent: m.opponent,
      opp_utr: m.opponent_utr,
      result: m.result,
      score: m.score
    }))
  };
}
```

**Output:**
```json
{
  "record": "7-3",
  "win_pct": "70.0",
  "matches": [
    {"date": "2025-11-01", "opponent": "Cristobal Plasencia Robles", "opp_utr": 11.45, "result": "loss"},
    {"date": "2025-11-01", "opponent": "Bardo Bucknell", "opp_utr": 11.37, "result": "win"},
    // ... (8 more matches)
  ]
}
```

---

#### **F. Match Tiebreak Record**

**Function:**
```javascript
function calculateMatchTiebreakRecord(matches) {
  const tiebreaks = matches.filter(m => m.match_tiebreak_user !== null);
  const wins = tiebreaks.filter(m => m.result === "win").length;
  const losses = tiebreaks.filter(m => m.result === "loss").length;
  
  return {
    record: `${wins}-${losses}`,
    win_pct: wins / (wins + losses) * 100,
    total: wins + losses,
    details: tiebreaks.map(m => ({
      opponent: m.opponent,
      opp_utr: m.opponent_utr,
      result: m.result,
      score: `[${m.match_tiebreak_user}-${m.match_tiebreak_opponent}]`
    }))
  };
}
```

**Output:**
```json
{
  "record": "3-4",
  "win_pct": 42.9,
  "total": 7,
  "details": [
    {"opponent": "James Wakefield", "opp_utr": 11.37, "result": "loss", "score": "[9-11]"},
    {"opponent": "Ivan Rybak", "opp_utr": 11.37, "result": "loss", "score": "[6-10]"},
    // ... (5 more)
  ]
}
```

---

#### **G. Confidence Score Calculation**

**Function:**
```javascript
function calculateConfidenceScore(data) {
  let score = 0;
  
  // Factor 1: Match count (max 40 points)
  const matchCount = data.matches.length;
  score += Math.min(40, (matchCount / 50) * 40);
  
  // Factor 2: Recency (max 30 points)
  const latestMatchDate = new Date(data.matches[0].date);
  const today = new Date();
  const daysSinceLastMatch = (today - latestMatchDate) / (1000 * 60 * 60 * 24);
  if (daysSinceLastMatch <= 30) score += 30;
  else if (daysSinceLastMatch <= 90) score += 20;
  else if (daysSinceLastMatch <= 180) score += 10;
  
  // Factor 3: UTR differential (max 20 points)
  const utrDiff = Math.abs(data.user.utr - data.opponent.ratings.utr_s);
  if (utrDiff <= 0.5) score += 20;
  else if (utrDiff <= 1.0) score += 15;
  else if (utrDiff <= 2.0) score += 10;
  else score += 5;
  
  // Factor 4: Player report stats availability (max 10 points)
  if (data.opponent.stats) score += 10;
  
  return Math.round(Math.min(100, score));
}
```

**Output:**
```json
{
  "confidence_score": 78,
  "rationale": "Based on 63 matches, recent activity (last match 9 days ago), similar UTR (0.22 diff), no player report stats"
}
```

---

## 9. AI-GENERATED INSIGHTS MATRIX

**This is what the AI should produce based on all the above data.**

### **A. Executive Summary**

```
OPPONENT: Max Freedman (UTR 11.38, #154 National)
USER: You (UTR 11.16)
MATCH CONTEXT: Hard Court, L2 Tournament, Outdoor/Sunny

WIN PROBABILITY: 48-52% (Even matchup, slight edge to Max on paper)

CONFIDENCE SCORE: 78/100 (High confidence based on 63 matches, recent data)
```

---

### **B. Top 3 Weaknesses**

```
1. MATCH TIEBREAK VULNERABILITY (CRITICAL)
   • Record: 3-4 (43% win rate) vs similar-level opponents
   • Lost to Wakefield [9-11], Rybak [6-10], Chow [10-15]
   • Chokes under pressure in decisive moments

2. WEAK SERVE (EXPLOITABLE)
   • First serve: 58% (below avg)
   • Second serve: 45% (below avg)
   • Double faults: 5 per match (high)
   • Attack his second serve aggressively

3. ERROR-PRONE GROUNDSTROKES
   • Forehand: 22 errors vs 18 winners (net -4)
   • Backhand: 15 errors vs 8 winners (net -7)
   • Grind him down with consistency
```

---

### **C. Your Tactical Game Plan**

```
PHASE 1: EARLY MATCH (First Set)
• Target his backhand 70% of the time
• Attack his second serve (stand inside baseline)
• Develop rallies (3-6 shots) then transition to net
• Test his passing shots early (expose his weakness)

PHASE 2: MID-MATCH (If Close)
• Execute "Rally → Net" pattern relentlessly
• Extend points to 8-12 shots (he prefers 4.2 shot avg)
• Use drop shots when he's behind baseline (sunny = hard to see)
• Stay patient (let his errors accumulate)

PHASE 3: TIEBREAKS / 3RD SETS
• Be ultra-aggressive in tiebreaks (he's 43% win rate)
• Take the net on ANY short ball (force passing shots under pressure)
• Stay positive (he's proven to fold in tight moments)
• Physical warfare (long rallies, make him run, he's retired 5 times)
```

---

### **D. Psychological Factors**

```
OPPONENT MENTAL STATE:
✅ No major points expiring this weekend (low pressure, relaxed)
✅ Recent form solid (7-3 last 10 matches)
⚠️ UTR declining despite ranking improving (contradictory signals, possible confidence issues)
⚠️ 5 retirements in 2025 (quits when frustrated or physically challenged)
⚠️ 0-2 in finals (pressure situations are his weakness)

YOUR MENTAL EDGE:
• You're the underdog (0.22 UTR behind) — play freely
• Your playing style counters his game perfectly
• His weaknesses align with your strengths
• Believe in your net game (his nightmare)
```

---

### **E. Match Context Insights**

```
SURFACE: Hard Court (Max's strength — 70% win rate, all top 6 results on hard)
LEVEL: L2 (Max's comfort zone — 3 of top 6 results at L2)
CONDITIONS: Sunny, Hot (Max used to Florida heat, but has retirement history)

OVERALL ASSESSMENT:
Max has surface and tournament level advantage, BUT your playing style 
neutralizes these advantages. Execute your game plan and you have excellent 
chance to win despite lower UTR.
```

---

## 📊 **SUMMARY: DATA → INSIGHTS FLOWCHART**

```
┌─────────────────────────────────────────────────────────────────┐
│  DATA SOURCES                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  1. Player Profile (UTR, rankings, W-L record)                  │
│  2. Match History (95 matches with scores, opponents, dates)    │
│  3. Ranking History (6-7 months of trends)                      │
│  4. Ranking Snapshot (Top 6 events, points, expiry dates)       │
│  5. Player Report Stats (serve%, errors, winners - if available)│
│  6. User Profile (UTR, playing style, strengths)                │
│  7. Match Context (surface, level, conditions, date)            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                  PRE-COMPUTATION
                  (Backend Processing)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  PRE-COMPUTED ANALYSES                                          │
│  ─────────────────────────────────────────────────────────────  │
│  • Rating trends (improving/declining/stagnant)                 │
│  • Point defense pressure (days until expiry)                   │
│  • Surface preferences (win% by surface)                        │
│  • Tournament level performance (win% by level)                 │
│  • Recent form (last 10 matches)                                │
│  • Match tiebreak record (win% in TBs)                          │
│  • 3-set record (win% in 3-setters)                             │
│  • H2H record (if applicable)                                   │
│  • Confidence score (0-100)                                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                  ULTRA-COMPACT JSON
                  (Sent to AI API)
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  AI PROMPT (GPT-4 / Claude)                                     │
│  ─────────────────────────────────────────────────────────────  │
│  "You are a professional tennis scout. Generate a scouting      │
│  report for [User] to beat [Opponent] based on the data..."     │
│                                                                  │
│  Input: JSON payload (opponent data + user profile + context)   │
│  Output: Markdown report (Standard 1.2K words or Deep 2.8K)     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                  AI GENERATES INSIGHTS
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  AI-GENERATED SCOUTING REPORT (Markdown)                        │
│  ─────────────────────────────────────────────────────────────  │
│  1. Executive Summary (win probability, top weaknesses)         │
│  2. Opponent Profile (competitive level, recent form)           │
│  3. Key Weaknesses (match TB%, serve%, errors)                  │
│  4. Your Strengths vs Opponent (style matchup)                  │
│  5. Tactical Game Plan (phase-by-phase)                         │
│  6. Psychological Factors (pressure, momentum, trends)          │
│  7. Match Context Analysis (surface, level, conditions)         │
│  8. Pre-Match Checklist                                         │
│  9. Confidence Score (with disclaimer)                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                  SAVE TO DATABASE
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  USER VIEWS REPORT IN APP                                       │
│  • Display full markdown report                                 │
│  • Save to "My Scout Reports" library                           │
│  • Export to PDF option                                         │
│  • Share with coach/parent option                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ **NEXT STEPS**

This blueprint document should now serve as the **complete reference** for:

1. ✅ **Developers:** Know exactly what data to fetch and pre-compute
2. ✅ **AI Prompt Designer:** Know what analyses to instruct AI to generate
3. ✅ **Product Team:** Understand the full depth of insights possible

**Once you review this blueprint and confirm it's comprehensive, I'll create:**
1. The production-ready AI prompt template (with all these insights baked in)
2. Complete JSON schema for the input payload
3. Sample outputs (Standard & Deep Dive reports)

**Does this blueprint capture everything? Any data points or analyses I missed?** 🎾🚀
