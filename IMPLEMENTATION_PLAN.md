# 🚀 Match Tennis AI - Implementation Plan
## Detailed Execution Roadmap (Nov 2025 - Jan 2026)

---

## 📋 TABLE OF CONTENTS

1. [Sprint Planning Overview](#sprint-planning-overview)
2. [Technical Requirements](#technical-requirements)
3. [AI Feature Specifications](#ai-feature-specifications)
4. [Credit System Architecture](#credit-system-architecture)
5. [Payment Integration](#payment-integration)
6. [UX/UI Implementation](#uxui-implementation)
7. [Testing & QA Strategy](#testing--qa-strategy)
8. [Launch Checklist](#launch-checklist)
9. [Post-Launch Monitoring](#post-launch-monitoring)

---

## 🏃 SPRINT PLANNING OVERVIEW

### **Pre-Launch: 8-Week Sprint Plan**

```
┌─────────────────────────────────────────────────────────────────────┐
│  WEEK 1-2 (Nov 4-17): Foundation & Architecture                    │
│  ─────────────────────────────────────────────────────────────────  │
│  • Database schema design for credit system                        │
│  • AI API integration (OpenAI/Anthropic/Claude)                    │
│  • Prompt engineering for core features                            │
│  • UI/UX wireframes for AI dashboard                               │
│  • Beta user recruitment (target: 50 users)                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WEEK 3-4 (Nov 18 - Dec 1): Core AI Features                       │
│  ─────────────────────────────────────────────────────────────────  │
│  • AI Scouting Report (MVP version)                                │
│  • Match Win Probability calculator                                │
│  • Weekly Performance Summary generator                            │
│  • Credit deduction logic                                           │
│  • Loading states & progress indicators                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WEEK 5-6 (Dec 2-15): Payment & Subscription                       │
│  ─────────────────────────────────────────────────────────────────  │
│  • Stripe integration (subscriptions)                              │
│  • Apple In-App Purchase (iOS)                                     │
│  • Google Play Billing (Android)                                   │
│  • Subscription management (upgrade/downgrade/cancel)              │
│  • Weekend bonus logic (auto-refresh Sat-Sun)                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WEEK 7 (Dec 16-22): Beta Testing & Refinement                     │
│  ─────────────────────────────────────────────────────────────────  │
│  • Beta launch to 50 users                                         │
│  • Collect feedback & iterate                                      │
│  • Bug fixes & performance optimization                            │
│  • AI prompt tuning based on real usage                            │
│  • A/B test different report formats                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WEEK 8 (Dec 23-31): Launch Prep & Marketing                       │
│  ─────────────────────────────────────────────────────────────────  │
│  • Final QA & security audit                                       │
│  • App store submission (iOS/Android)                              │
│  • Marketing content creation (videos, graphics)                   │
│  • Email campaign preparation                                      │
│  • Press kit & launch announcement                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  JAN 1, 2026: 🚀 PUBLIC LAUNCH                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💻 TECHNICAL REQUIREMENTS

### **Technology Stack**

| Component | Recommended Technology | Alternative |
|-----------|------------------------|-------------|
| **Frontend** | React Native (cross-platform) | Flutter |
| **Backend** | Node.js (Express) or Python (FastAPI) | Ruby on Rails |
| **Database** | PostgreSQL (relational) + Redis (caching) | MongoDB + Memcached |
| **AI/LLM** | OpenAI GPT-4 API or Anthropic Claude | Google Gemini, Cohere |
| **Payments** | Stripe (subscriptions + one-time) | Paddle, RevenueCat |
| **In-App Purchase** | RevenueCat (wrapper for Apple/Google) | Native implementation |
| **Hosting** | AWS (EC2, RDS, S3) or Vercel + Supabase | Google Cloud, Azure |
| **Analytics** | Mixpanel or Amplitude | Google Analytics, PostHog |
| **Error Tracking** | Sentry | Rollbar, Bugsnag |
| **Email** | SendGrid or AWS SES | Mailgun, Postmark |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | OneSignal, Pusher |

---

### **Database Schema Design**

#### **Table: users**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  usta_id VARCHAR(50),
  utr_id VARCHAR(50),
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, elite, team
  subscription_status VARCHAR(20) DEFAULT 'inactive', -- active, canceled, expired, trial
  stripe_customer_id VARCHAR(255),
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: ai_credits**
```sql
CREATE TABLE ai_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  credits_available INTEGER DEFAULT 0,
  credits_rollover INTEGER DEFAULT 0, -- For Elite tier only
  credits_used_this_month INTEGER DEFAULT 0,
  monthly_allowance INTEGER DEFAULT 0, -- 100 for Pro, 500 for Elite
  billing_cycle_start DATE,
  billing_cycle_end DATE,
  weekend_bonus_used BOOLEAN DEFAULT FALSE,
  weekend_bonus_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table: ai_reports**
```sql
CREATE TABLE ai_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- scout, win_probability, utr_forecast, etc.
  opponent_id INTEGER, -- References player being analyzed
  opponent_name VARCHAR(255),
  credits_cost INTEGER NOT NULL,
  was_weekend_bonus BOOLEAN DEFAULT FALSE,
  report_data JSONB, -- Store full AI-generated report
  confidence_score FLOAT, -- AI confidence (0-1)
  generation_time_ms INTEGER, -- Track performance
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_reports_user_id ON ai_reports(user_id);
CREATE INDEX idx_ai_reports_created_at ON ai_reports(created_at DESC);
```

#### **Table: credit_transactions**
```sql
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- purchase, usage, refund, monthly_reset, rollover
  credits_change INTEGER NOT NULL, -- Positive for additions, negative for usage
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_report_id INTEGER REFERENCES ai_reports(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
```

#### **Table: subscriptions**
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(20) NOT NULL, -- pro_monthly, pro_annual, elite_monthly, elite_annual
  status VARCHAR(20) NOT NULL, -- active, trialing, past_due, canceled, unpaid
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **AI API Integration Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (React Native App)                                 │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ HTTPS Request
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  API GATEWAY (Express/FastAPI)                             │
│  ├─ Authentication middleware (JWT)                        │
│  ├─ Rate limiting (prevent abuse)                          │
│  └─ Request validation                                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC LAYER                                       │
│  ├─ Check user subscription status                         │
│  ├─ Verify credit balance                                  │
│  ├─ Deduct credits (atomic transaction)                    │
│  └─ Queue AI generation job                                │
└─────────────────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  SYNC PATH           │    │  ASYNC PATH          │
│  (Real-time <15s)    │    │  (Background job)    │
│                      │    │                      │
│  • Scouting reports  │    │  • Weekly summaries  │
│  • Win probability   │    │  • Batch processing  │
│  • UTR forecast      │    │  • Daily dashboards  │
└──────────────────────┘    └──────────────────────┘
          │                           │
          └─────────────┬─────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  AI ORCHESTRATION SERVICE                                   │
│  ├─ Prompt template selection                              │
│  ├─ Data fetching (opponent history, stats)                │
│  ├─ Prompt variable injection                              │
│  ├─ Cache check (avoid redundant generations)              │
│  └─ Cost tracking                                           │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  LLM API (OpenAI / Anthropic)                              │
│  ├─ Model: GPT-4 or Claude 3 Sonnet                        │
│  ├─ Temperature: 0.3 (balanced creativity/consistency)     │
│  ├─ Max tokens: 1500-2000 (scouting reports)               │
│  └─ Timeout: 30 seconds                                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  POST-PROCESSING                                            │
│  ├─ Format output (markdown → structured JSON)             │
│  ├─ Add confidence scores                                  │
│  ├─ Store in database (ai_reports table)                   │
│  ├─ Log generation time & cost                             │
│  └─ Return to client                                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CLIENT RECEIVES REPORT                                     │
│  • Display formatted report                                │
│  • Update credit balance UI                                │
│  • Enable actions (share, save, ask follow-up)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI FEATURE SPECIFICATIONS

### **Feature 1: AI Scouting Report**

#### **Input Requirements:**
- `opponent_id` (player ID from database)
- `user_id` (requesting player)
- `match_context` (optional: tournament, surface, date)

#### **Data Sources:**
1. Opponent's match history (last 50 matches)
2. Head-to-head record (if exists)
3. UTR rating & trend
4. Tournament performance (by level)
5. Surface preferences (clay vs hard)
6. Tiebreak record
7. Win/loss streaks

#### **Prompt Template:**
```
You are a professional tennis analyst specializing in junior competitive tennis.

TASK: Generate a comprehensive scouting report for {opponent_name} to help {user_name} prepare for their upcoming match.

OPPONENT DATA:
- Name: {opponent_name}
- UTR: {opponent_utr}
- Current Ranking: District {district_rank}, Section {section_rank}, National {national_rank}
- Recent Form: {win_loss_last_10}
- Head-to-Head vs {user_name}: {h2h_record}

MATCH HISTORY:
{match_history_json}

ANALYSIS REQUIREMENTS:
1. Matchup Advantage: Calculate win probability for {user_name} (be realistic, factor in UTR differential, H2H, form)
2. Key Insights: Identify 3-4 critical patterns (e.g., struggles in tiebreaks, strong on clay, vulnerable to net play)
3. Strengths vs {opponent_name}: Highlight {user_name}'s advantages in this specific matchup
4. Watch Out For: Flag recent improvements or hot streaks
5. Strategic Game Plan: Provide 4 tactical recommendations (be specific, actionable)

FORMAT:
Return a structured JSON with these fields:
{
  "matchup_advantage": {"user_win_probability": 0.52, "confidence": 0.87},
  "key_insights": [{"type": "strength/weakness/neutral", "insight": "...", "supporting_data": "..."}],
  "user_strengths": ["..."],
  "watch_out_for": ["..."],
  "game_plan": [{"step": 1, "tactic": "...", "rationale": "..."}]
}

TONE: Professional yet conversational. Avoid jargon. Be honest about win probability.
```

#### **Output Format (JSON):**
```json
{
  "report_id": "uuid",
  "generated_at": "2025-11-10T14:32:00Z",
  "opponent": {
    "name": "Ivan Rybak",
    "utr": 11.37,
    "recent_form": "5W-5L (last 10)"
  },
  "matchup_advantage": {
    "user_win_probability": 0.52,
    "opponent_win_probability": 0.48,
    "confidence": 0.87,
    "summary": "Even matchup - slight edge to you"
  },
  "key_insights": [
    {
      "type": "weakness",
      "insight": "Rybak struggles in tiebreaks",
      "supporting_data": "3-7 tiebreak record in 2025",
      "icon": "🔴"
    },
    {
      "type": "strength",
      "insight": "Excels in long rallies (10+ shots)",
      "supporting_data": "72% win rate when rally exceeds 10 shots",
      "icon": "🟢"
    }
  ],
  "user_strengths": [
    "You've won 100% of your tiebreaks against him (2/2)",
    "Your serve is 1.2 UTR stronger than average",
    "Better net play: 62% vs his 45%"
  ],
  "watch_out_for": [
    "Currently on 5-match win streak",
    "Improved forehand speed in last 10 matches",
    "Strong in 3rd sets (78% win rate)"
  ],
  "game_plan": [
    {
      "step": 1,
      "tactic": "Disrupt his rhythm",
      "description": "Vary pace: mix heavy topspin & flat drives",
      "rationale": "Prevents him from settling into long rally patterns"
    },
    {
      "step": 2,
      "tactic": "Attack the net",
      "description": "Serve-volley on important points",
      "rationale": "His passing shot success is only 38%"
    }
  ],
  "confidence_disclaimer": "Based on analysis of 47 match results. Predictions are estimates, not guarantees."
}
```

#### **Caching Strategy:**
- Cache opponent data for 24 hours (reduce redundant API calls)
- Cache generated reports for 48 hours (if opponent's data hasn't changed)
- Implement cache key: `scout_report:{opponent_id}:{date}`

#### **Cost Optimization:**
- Estimated tokens per request: ~3,000 input + 1,500 output = 4,500 total
- GPT-4 cost: $0.03/1K input + $0.06/1K output = ~$0.18 per report
- Target cost with optimization: **$0.12-$0.15 per report**

---

### **Feature 2: Match Win Probability**

#### **Input Requirements:**
- `user_id`
- `opponent_id`
- `surface` (clay, hard, grass)
- `tournament_level` (L1, L2, L3, L4, etc.)

#### **Calculation Method:**
```python
def calculate_win_probability(user_utr, opponent_utr, h2h_record, user_recent_form, opponent_recent_form, surface_preference):
    """
    Hybrid model: Statistical baseline + AI adjustment
    """
    
    # 1. BASE PROBABILITY (UTR differential)
    utr_diff = user_utr - opponent_utr
    base_prob = 1 / (1 + 10 ** (-utr_diff / 1.5))  # Logistic function
    
    # 2. HEAD-TO-HEAD ADJUSTMENT
    if h2h_record['matches'] >= 2:
        h2h_win_rate = h2h_record['wins'] / h2h_record['matches']
        base_prob = base_prob * 0.7 + h2h_win_rate * 0.3  # 30% weight to H2H
    
    # 3. RECENT FORM ADJUSTMENT
    user_form_factor = (user_recent_form['wins'] / 10) - 0.5  # -0.5 to +0.5
    opponent_form_factor = (opponent_recent_form['wins'] / 10) - 0.5
    form_adjustment = (user_form_factor - opponent_form_factor) * 0.1
    base_prob += form_adjustment
    
    # 4. SURFACE ADJUSTMENT
    if surface in user_surface_pref and user_surface_pref[surface] > opponent_surface_pref[surface]:
        base_prob += 0.05
    elif surface in opponent_surface_pref and opponent_surface_pref[surface] > user_surface_pref[surface]:
        base_prob -= 0.05
    
    # 5. AI REFINEMENT (optional, for complex cases)
    # Use lightweight LLM call to adjust for intangibles (e.g., playing style matchup)
    
    # Clamp probability to reasonable range
    final_prob = max(0.05, min(0.95, base_prob))
    
    return {
        "user_win_probability": round(final_prob, 2),
        "opponent_win_probability": round(1 - final_prob, 2),
        "confidence": calculate_confidence(data_quality)
    }
```

#### **Output Format:**
```json
{
  "user_win_probability": 0.58,
  "opponent_win_probability": 0.42,
  "confidence": 0.82,
  "summary": "You have a 58% chance to win",
  "key_factors": [
    {"factor": "UTR advantage", "impact": "+8%"},
    {"factor": "Recent form", "impact": "+5%"},
    {"factor": "Surface preference", "impact": "0%"}
  ]
}
```

**Cost:** $0.03-$0.05 per prediction (lightweight model or rule-based calculation)

---

### **Feature 3: Weekly Performance Summary**

#### **Trigger:** Automated (every Sunday evening)

#### **Input:** User's matches from past 7 days

#### **Prompt Template:**
```
Analyze {user_name}'s tennis performance this week:

MATCHES PLAYED:
{match_results_json}

Generate a concise weekly performance summary covering:
1. Win/Loss record this week
2. Standout performances (best wins)
3. Areas of concern (unexpected losses)
4. UTR change (if any)
5. One actionable recommendation for next week

Keep it encouraging yet honest. Max 150 words.
```

#### **Delivery:** Push notification + email + in-app dashboard

**Cost:** $0.02-$0.04 per summary (simple generation, low token count)

---

## 💳 CREDIT SYSTEM ARCHITECTURE

### **Credit Allocation Logic**

```python
class CreditManager:
    def __init__(self, user_id):
        self.user = User.get(user_id)
        self.credit_account = AICredit.get_by_user(user_id)
    
    def get_available_credits(self):
        """
        Returns total available credits (monthly allowance + rollover - used)
        """
        return self.credit_account.credits_available
    
    def deduct_credits(self, cost, report_type, is_weekend_bonus=False):
        """
        Atomic transaction to deduct credits and log usage
        """
        if is_weekend_bonus and self.can_use_weekend_bonus():
            # Free weekend report - no credit deduction
            self.mark_weekend_bonus_used()
            return {"success": True, "credits_used": 0, "balance": self.get_available_credits()}
        
        if self.get_available_credits() < cost:
            return {"success": False, "error": "Insufficient credits", "balance": self.get_available_credits()}
        
        # Deduct credits
        with db.transaction():
            self.credit_account.credits_available -= cost
            self.credit_account.credits_used_this_month += cost
            self.credit_account.save()
            
            # Log transaction
            CreditTransaction.create(
                user_id=self.user.id,
                transaction_type="usage",
                credits_change=-cost,
                balance_after=self.credit_account.credits_available,
                description=f"Used {cost} credits for {report_type}"
            )
        
        return {"success": True, "credits_used": cost, "balance": self.get_available_credits()}
    
    def reset_monthly_credits(self):
        """
        Called at billing cycle renewal (cron job)
        """
        # Elite tier: Allow 25% rollover (max 200 credits)
        if self.user.subscription_tier == "elite":
            unused = self.credit_account.credits_available
            rollover = min(unused * 0.25, 200)
            self.credit_account.credits_rollover = rollover
        else:
            rollover = 0
        
        # Reset to monthly allowance + rollover
        allowance = self.get_monthly_allowance()
        self.credit_account.credits_available = allowance + rollover
        self.credit_account.credits_used_this_month = 0
        self.credit_account.save()
    
    def can_use_weekend_bonus(self):
        """
        Pro tier: 1 free scout report per weekend
        """
        if self.user.subscription_tier != "pro":
            return False
        
        now = datetime.now()
        is_weekend = now.weekday() >= 5  # Saturday=5, Sunday=6
        bonus_not_used = not self.credit_account.weekend_bonus_used
        bonus_not_expired = now < self.credit_account.weekend_bonus_expires_at
        
        return is_weekend and bonus_not_used and bonus_not_expired
    
    def refresh_weekend_bonus(self):
        """
        Called every Friday at 6 PM (cron job)
        """
        if self.user.subscription_tier == "pro":
            self.credit_account.weekend_bonus_used = False
            self.credit_account.weekend_bonus_expires_at = datetime.now() + timedelta(days=2, hours=6)  # Sunday 11:59 PM
            self.credit_account.save()
```

---

### **Cron Jobs Required**

| Job Name | Schedule | Function | Priority |
|----------|----------|----------|----------|
| **Monthly Credit Reset** | 1st of month, 12:01 AM | Reset credits to monthly allowance + rollover | Critical |
| **Weekend Bonus Refresh** | Every Friday, 6:00 PM | Enable weekend free report for Pro users | High |
| **Weekend Bonus Expiry** | Every Monday, 12:01 AM | Expire unused weekend bonuses | Medium |
| **Weekly Summary Generator** | Every Sunday, 8:00 PM | Generate & send performance summaries | Medium |
| **Subscription Status Sync** | Every 6 hours | Sync with Stripe (handle failed payments, cancellations) | Critical |

---

## 💰 PAYMENT INTEGRATION

### **Stripe Setup (Recommended)**

#### **1. Product & Price Configuration**

```javascript
// Server-side: Create products in Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Pro Monthly
const proMonthly = await stripe.products.create({
  name: 'Match Tennis Pro - Monthly',
  description: '100 AI credits/month + 1 free weekend scout',
});
const proMonthlyPrice = await stripe.prices.create({
  product: proMonthly.id,
  unit_amount: 1299, // $12.99
  currency: 'usd',
  recurring: { interval: 'month' },
});

// Pro Annual
const proAnnual = await stripe.products.create({
  name: 'Match Tennis Pro - Annual',
  description: '100 AI credits/month + 1 free weekend scout (Save 11%)',
});
const proAnnualPrice = await stripe.prices.create({
  product: proAnnual.id,
  unit_amount: 13900, // $139/year
  currency: 'usd',
  recurring: { interval: 'year' },
});

// Elite Monthly
const eliteMonthly = await stripe.products.create({
  name: 'Match Tennis Elite - Monthly',
  description: '500 AI credits/month + 20 free scouts + advanced features',
});
const eliteMonthlyPrice = await stripe.prices.create({
  product: eliteMonthly.id,
  unit_amount: 2999, // $29.99
  currency: 'usd',
  recurring: { interval: 'month' },
});

// Elite Annual
const eliteAnnual = await stripe.products.create({
  name: 'Match Tennis Elite - Annual',
  description: '500 AI credits/month + 20 free scouts + advanced features (Save 17%)',
});
const eliteAnnualPrice = await stripe.prices.create({
  product: eliteAnnual.id,
  unit_amount: 29900, // $299/year
  currency: 'usd',
  recurring: { interval: 'year' },
});

// One-Time: Extra Scout Report
const extraScout = await stripe.products.create({
  name: 'Extra AI Scout Report',
  description: 'Additional scouting report (beyond weekend bonus)',
});
const extraScoutPrice = await stripe.prices.create({
  product: extraScout.id,
  unit_amount: 99, // $0.99
  currency: 'usd',
});
```

#### **2. Checkout Flow (Web-Based)**

```javascript
// Client-side: Create checkout session

async function handleSubscribe(priceId) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });
  
  const { sessionId } = await response.json();
  
  // Redirect to Stripe Checkout
  const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
  await stripe.redirectToCheckout({ sessionId });
}

// Server-side: Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;
  const userId = req.user.id; // From JWT auth
  
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: 'https://matchtennisapp.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://matchtennisapp.com/pricing',
    metadata: { userId },
  });
  
  res.json({ sessionId: session.id });
});
```

#### **3. Webhook Handling (Critical!)**

```javascript
// Server-side: Handle Stripe webhooks

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      // User completed checkout → activate subscription
      const session = event.data.object;
      await activateSubscription(session);
      break;
    
    case 'customer.subscription.updated':
      // Subscription changed (upgrade/downgrade)
      const subscription = event.data.object;
      await updateUserSubscription(subscription);
      break;
    
    case 'customer.subscription.deleted':
      // Subscription canceled → revoke access
      await deactivateSubscription(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      // Payment failed → notify user
      await handleFailedPayment(event.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      // Renewal successful → reset credits
      await handleSuccessfulRenewal(event.data.object);
      break;
  }
  
  res.json({ received: true });
});

async function activateSubscription(session) {
  const userId = session.metadata.userId;
  const subscriptionId = session.subscription;
  
  // Update user record
  await User.update(userId, {
    subscription_tier: getPlanTier(session.line_items[0].price.id),
    subscription_status: 'active',
    stripe_customer_id: session.customer,
  });
  
  // Create subscription record
  await Subscription.create({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    plan_type: getPlanType(session.line_items[0].price.id),
    status: 'active',
  });
  
  // Initialize credit account
  const monthlyAllowance = getPlanTier(session.line_items[0].price.id) === 'pro' ? 100 : 500;
  await AICredit.create({
    user_id: userId,
    credits_available: monthlyAllowance,
    monthly_allowance: monthlyAllowance,
  });
  
  // Send welcome email
  await sendEmail(userId, 'welcome_to_pro');
}
```

---

### **In-App Purchase (iOS & Android)**

#### **Recommended Tool: RevenueCat**

RevenueCat handles the complexity of Apple/Google IAP:
- Subscription management
- Receipt validation
- Cross-platform support
- Webhook notifications

```javascript
// Client-side (React Native)
import Purchases from 'react-native-purchases';

// Initialize RevenueCat
await Purchases.configure({ apiKey: 'your_revenuecat_api_key' });

// Fetch available products
const offerings = await Purchases.getOfferings();
const proMonthly = offerings.current.availablePackages.find(pkg => pkg.identifier === 'pro_monthly');

// Purchase
try {
  const purchaseResult = await Purchases.purchasePackage(proMonthly);
  
  if (purchaseResult.customerInfo.entitlements.active.pro) {
    // User now has Pro access
    await syncSubscriptionWithBackend(purchaseResult);
  }
} catch (error) {
  if (error.userCancelled) {
    // User canceled purchase
  }
}

// Server-side: Webhook from RevenueCat
app.post('/api/revenuecat-webhook', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    // Activate subscription
    await activateSubscription(event.app_user_id, event.product_id);
  } else if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
    // Deactivate subscription
    await deactivateSubscription(event.app_user_id);
  }
  
  res.sendStatus(200);
});
```

---

## 🎨 UX/UI IMPLEMENTATION

### **Component Library (Reusable)**

#### **1. AI Credit Badge**

```jsx
// components/AICreditBadge.jsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const AICreditBadge = ({ credits, maxCredits, onTopUp }) => {
  const percentage = (credits / maxCredits) * 100;
  const badgeColor = percentage > 50 ? '#4CAF50' : percentage > 20 ? '#FFC107' : '#F44336';
  
  return (
    <TouchableOpacity onPress={onTopUp} style={styles.container}>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.creditsText}>💳 {credits}/{maxCredits}</Text>
      </View>
      {credits < 20 && (
        <Text style={styles.warningText}>Running low!</Text>
      )}
    </TouchableOpacity>
  );
};
```

#### **2. AI Loading Indicator**

```jsx
// components/AILoadingIndicator.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, ProgressBar } from 'react-native';

const AILoadingIndicator = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 0.1, 0.95)); // Never reach 100% until done
      
      if (progress > 0.3 && currentStep === 0) setCurrentStep(1);
      if (progress > 0.6 && currentStep === 1) setCurrentStep(2);
      if (progress > 0.8 && currentStep === 2) setCurrentStep(3);
    }, 500);
    
    return () => clearInterval(interval);
  }, [progress, currentStep]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Analyzing {opponent}...</Text>
      <ProgressBar progress={progress} color="#6B5CE7" />
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <Text key={index} style={index <= currentStep ? styles.stepComplete : styles.stepPending}>
            {index <= currentStep ? '✓' : '○'} {step}
          </Text>
        ))}
      </View>
      <Text style={styles.eta}>⏱️ ~{Math.max(1, 15 - progress * 15)} seconds remaining</Text>
    </View>
  );
};

// Usage:
<AILoadingIndicator 
  opponent="Ivan Rybak" 
  steps={[
    'Reviewing 47 match results',
    'Identifying patterns',
    'Comparing to your style',
    'Generating insights'
  ]} 
/>
```

#### **3. Scout Report Card**

```jsx
// components/ScoutReportCard.jsx

const ScoutReportCard = ({ report }) => {
  return (
    <View style={styles.reportContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 AI SCOUTING REPORT</Text>
        <Text style={styles.subtitle}>{report.opponent.name} vs You</Text>
        <Text style={styles.timestamp}>Generated: {formatDate(report.generated_at)}</Text>
      </View>
      
      {/* Win Probability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 MATCHUP ADVANTAGE</Text>
        <ProgressBar 
          userProbability={report.matchup_advantage.user_win_probability} 
          opponentProbability={report.matchup_advantage.opponent_win_probability} 
        />
        <Text style={styles.summary}>{report.matchup_advantage.summary}</Text>
        <Text style={styles.confidence}>Confidence: {report.matchup_advantage.confidence * 100}%</Text>
      </View>
      
      {/* Key Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 KEY INSIGHTS</Text>
        {report.key_insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </View>
      
      {/* User Strengths */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 YOUR STRENGTHS vs {report.opponent.name}</Text>
        {report.user_strengths.map((strength, idx) => (
          <Text key={idx} style={styles.bulletPoint}>✓ {strength}</Text>
        ))}
      </View>
      
      {/* Watch Out For */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ WATCH OUT FOR</Text>
        {report.watch_out_for.map((warning, idx) => (
          <Text key={idx} style={styles.bulletPoint}>! {warning}</Text>
        ))}
      </View>
      
      {/* Game Plan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎾 STRATEGIC GAME PLAN</Text>
        {report.game_plan.map((step, idx) => (
          <GamePlanStep key={idx} step={step} />
        ))}
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        <Button title="📥 Save to Notes" onPress={() => saveReport(report)} />
        <Button title="📤 Share" onPress={() => shareReport(report)} />
        <Button title="💬 Ask AI Follow-up (5 credits)" onPress={() => openAIChat(report)} />
      </View>
      
      {/* Footer */}
      <Text style={styles.disclaimer}>{report.confidence_disclaimer}</Text>
      <Text style={styles.footer}>Generated by Match Tennis AI • Credits used: {report.credits_cost}</Text>
    </View>
  );
};
```

---

## ✅ TESTING & QA STRATEGY

### **Test Plan**

| Test Type | Scope | Tools | Priority |
|-----------|-------|-------|----------|
| **Unit Tests** | Credit system logic, AI prompt generation | Jest, Mocha | High |
| **Integration Tests** | Stripe webhooks, RevenueCat sync, AI API | Supertest, Postman | Critical |
| **E2E Tests** | Full user flows (signup → purchase → generate report) | Detox, Appium | High |
| **Load Tests** | AI generation under concurrent load (100+ users) | k6, Artillery | Medium |
| **Security Tests** | Payment handling, JWT auth, input validation | OWASP ZAP, Burp Suite | Critical |
| **UAT (Beta)** | Real users testing features, collecting feedback | 50 beta users | Critical |

### **Key Test Scenarios**

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 1: Free User Discovers AI Feature                     │
│ ───────────────────────────────────────────────────────────────  │
│ 1. User logs in as free tier                                   │
│ 2. User views opponent profile                                 │
│ 3. User taps "🤖 Generate AI Scout Report"                     │
│ 4. System shows upgrade modal with pricing                     │
│ 5. User taps "Start Free Trial"                                │
│ 6. User completes Stripe checkout                              │
│ 7. Webhook activates subscription                              │
│ 8. User redirected to app → credits available                  │
│ 9. User generates first scout report (should succeed)          │
│                                                                  │
│ EXPECTED: Seamless flow, no errors, report generated           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 2: Pro User Uses Weekend Bonus                        │
│ ───────────────────────────────────────────────────────────────  │
│ 1. System time set to Saturday 9:00 AM                         │
│ 2. Pro user logs in                                            │
│ 3. User sees banner: "🎁 Your FREE weekend scout is ready!"    │
│ 4. User taps "Claim Now"                                       │
│ 5. User selects opponent                                        │
│ 6. User generates scout report                                 │
│ 7. System deducts 0 credits (weekend bonus)                    │
│ 8. User credit balance unchanged                               │
│ 9. User tries to generate 2nd scout report same weekend        │
│ 10. System shows: "Weekend bonus used. $0.99 for extra report" │
│                                                                  │
│ EXPECTED: First report free, second report requires payment    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO 3: User Runs Out of Credits                           │
│ ───────────────────────────────────────────────────────────────  │
│ 1. Pro user has 15 credits remaining                           │
│ 2. User attempts to generate scout report (20 credits)         │
│ 3. System shows: "Insufficient credits" modal                  │
│ 4. Modal offers: "Buy 50 credits ($4.99)" or "Upgrade Elite"   │
│ 5. User taps "Buy 50 credits"                                  │
│ 6. User completes IAP purchase                                 │
│ 7. Credits added to account (15 + 50 = 65)                     │
│ 8. User retries scout report generation (should succeed)       │
│                                                                  │
│ EXPECTED: Clear upsell, smooth IAP flow, credits added         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 LAUNCH CHECKLIST

### **1 Week Before Launch (Dec 24-31, 2025)**

- [ ] **App Store Submissions**
  - [ ] iOS: Submit to Apple App Store (allow 3-5 days for review)
  - [ ] Android: Submit to Google Play Store (allow 1-2 days)
  - [ ] Prepare rejection contingencies (common issues: IAP disclosures, privacy policy)

- [ ] **Payment Setup**
  - [ ] Test Stripe webhooks in production
  - [ ] Verify RevenueCat integration (iOS/Android)
  - [ ] Test subscription cancellation flow
  - [ ] Test failed payment handling

- [ ] **AI Infrastructure**
  - [ ] Load test AI generation (100 concurrent requests)
  - [ ] Verify caching works (reduce redundant API calls)
  - [ ] Set up error monitoring (Sentry alerts for API failures)

- [ ] **Marketing Prep**
  - [ ] Landing page redesign (highlight AI features)
  - [ ] Demo videos (30-60 seconds each feature)
  - [ ] Email campaign drafted (3-email sequence)
  - [ ] Social media content calendar (launch week)
  - [ ] Press kit (screenshots, logo, founder bio)

- [ ] **Database & Backups**
  - [ ] Production database backup strategy
  - [ ] Migration scripts tested (upgrade existing users)
  - [ ] Rollback plan documented

- [ ] **Legal & Compliance**
  - [ ] Updated Terms of Service (subscription terms)
  - [ ] Privacy Policy (AI data usage disclosure)
  - [ ] Refund policy clearly stated
  - [ ] GDPR compliance (for international users)

---

### **Launch Day (Jan 1, 2026)**

**Morning (12:01 AM - 9:00 AM):**
- [ ] Deploy production code (backend + frontend)
- [ ] Enable AI features for all paid tiers
- [ ] Send launch email to existing users
- [ ] Post on social media (Instagram, TikTok, Twitter)
- [ ] Monitor error logs (watch for crashes)

**Afternoon (9:00 AM - 5:00 PM):**
- [ ] Monitor conversion funnel (free → trial → paid)
- [ ] Respond to support tickets within 2 hours
- [ ] Track KPIs: signups, trials started, AI features used
- [ ] A/B test pricing page (if traffic allows)

**Evening (5:00 PM - 11:59 PM):**
- [ ] Review analytics (Mixpanel/Amplitude dashboard)
- [ ] Check payment processing (Stripe dashboard)
- [ ] Identify & fix any urgent bugs
- [ ] Send thank-you email to first 100 subscribers

---

### **Week 1 Post-Launch (Jan 2-8, 2026)**

- [ ] **Daily Monitoring:**
  - [ ] Check churn rate (watch for trial cancellations)
  - [ ] Monitor AI feature usage (70%+ target)
  - [ ] Review user feedback (app store reviews, support tickets)
  - [ ] Track credit consumption patterns

- [ ] **Optimization:**
  - [ ] Iterate on AI prompts based on user feedback
  - [ ] Optimize loading times (target <10 seconds for scout reports)
  - [ ] Fix UI/UX issues reported by users

- [ ] **Outreach:**
  - [ ] Send personalized emails to trial users (encourage conversion)
  - [ ] Reach out to beta users for testimonials
  - [ ] Feature user success stories on social media

- [ ] **Data Analysis:**
  - [ ] Identify drop-off points in conversion funnel
  - [ ] Calculate LTV:CAC ratio (early estimate)
  - [ ] Survey users: "What feature do you want next?"

---

## 📊 POST-LAUNCH MONITORING

### **Key Dashboards to Build**

#### **1. Revenue Dashboard**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Run Rate)
- Churn rate (monthly)
- ARPU (Average Revenue Per User)
- LTV:CAC ratio

#### **2. Product Metrics Dashboard**
- AI feature usage (% of users, frequency)
- Credit consumption rate
- Weekend bonus claim rate (Pro tier)
- IAP conversion rate (Pro → Elite)
- Scout report generation time (performance)

#### **3. User Health Dashboard**
- Active users (DAU, WAU, MAU)
- Trial → Paid conversion rate
- Subscription cancellation reasons
- Support ticket volume & resolution time

---

### **Alert Thresholds**

| Metric | Alert Condition | Action |
|--------|-----------------|--------|
| **Churn Rate** | >10% monthly | Investigate reasons, improve retention tactics |
| **AI Error Rate** | >5% of requests | Check API status, review error logs |
| **Payment Failures** | >3% of transactions | Contact Stripe support, notify users |
| **Scout Report Time** | >20 seconds avg | Optimize prompts, cache more data |
| **Credit Depletion** | >30% of users run out mid-month | Consider increasing Pro tier allowance |

---

## 🎯 SUCCESS METRICS (6-Month Targets)

| Metric | Target | Stretch Goal |
|--------|--------|--------------|
| **Paid Subscribers** | 500 | 750 |
| **MRR** | $10,000 | $15,000 |
| **Free → Pro Conversion** | 10% | 12% |
| **Pro → Elite Upgrade** | 18% | 25% |
| **Monthly Churn** | <8% | <5% |
| **AI Feature Usage** | 70% | 85% |
| **NPS Score** | 50+ | 70+ |
| **App Store Rating** | 4.5⭐ | 4.7⭐ |

---

## 🎉 CONCLUSION

This implementation plan provides a **step-by-step roadmap** to launch Match Tennis AI successfully. 

**Critical Path:**
1. Nail the AI scouting report (hero feature)
2. Perfect the credit system UX (must be intuitive)
3. Seamless payment integration (reduce friction)
4. Weekend bonus hook (drive habit formation)
5. Obsessive monitoring (iterate based on data)

**Next Steps:**
1. Review and approve this plan
2. Assign engineering resources
3. Begin Week 1 sprint (architecture & design)
4. Recruit beta users (50-100 power users)
5. Execute with discipline and flexibility

Let's build the future of competitive tennis intelligence! 🚀🎾
