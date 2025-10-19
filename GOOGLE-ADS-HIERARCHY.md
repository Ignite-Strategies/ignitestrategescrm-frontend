# Google Ads Hierarchy - The Structure

## 📊 The 3-Level Hierarchy

```
CAMPAIGN (top level - budget, dates, objective)
  └── AD GROUP (targeting, keywords, bids)
      └── AD CREATIVE (headlines, descriptions, landing page)
```

---

## 🏗️ 1. CAMPAIGN (The Container)

**What it is:** The main budget container and strategy wrapper

**Fields we need:**
- `name` - Campaign name (e.g., "F3 Disconnected Dads - Nov 2024")
- `objective` - What you're optimizing for (awareness, clicks, conversions)
- `dailyBudget` - How much you spend per day ($20, $50, etc.)
- `startDate` / `endDate` - When it runs
- `status` - draft, active, paused, completed

**What it controls:**
- Total budget
- When ads run
- High-level strategy

---

## 🎯 2. AD GROUP (The Targeting Layer)

**What it is:** Sits INSIDE a campaign. Defines WHO sees the ads and WHAT triggers them.

**Fields we need:**
- `name` - Ad Group name (e.g., "Men 30-50 Arlington")
- `keywords` - Array of search terms that trigger ads
  - Example: ["accountability group near me", "men's fitness challenge", "brotherhood community"]
- `negativeKeywords` - Array of terms you DON'T want to show for
  - Example: ["free", "women's group", "online only"]
- `locations` - Geographic targeting (e.g., ["Arlington VA", "DC Metro"])
- `ageRanges` - Age targeting (e.g., ["30-40", "40-50"])
- `genders` - Gender targeting (e.g., ["male"])
- `languages` - Languages (default: ["en"])

**What it controls:**
- What keywords trigger your ads
- Who sees your ads (age, location, gender)
- How much you bid per click (CPC)

**Key concept:** You can have MULTIPLE ad groups in one campaign to target different audiences or keywords.

---

## 🪄 3. AD CREATIVE (The Actual Ad)

**What it is:** The ad copy people see. Sits INSIDE an ad group.

**Fields we need:**
- `headline1` - First headline (max 30 chars) - "Find Your Brotherhood"
- `headline2` - Second headline (max 30 chars) - "Men's Accountability Group"
- `headline3` - Third headline (max 30 chars) - "Challenge Yourself Daily"
- `description` - First description (max 90 chars) - "Join a community of men committed to growth, challenge, and purpose."
- `description2` - Second description (max 90 chars) - "Weekly workouts, accountability partners, and real connection."
- `finalUrl` - Where they land when they click (e.g., "https://f3capital.com/join")
- `displayUrl` - What shows in the ad (e.g., "f3capital.com/join")
- `callToAction` - CTA text (e.g., "Join Now", "Learn More", "Sign Up")

**What it controls:**
- The actual copy people read
- Where they go when they click

**Key concept:** Google mixes and matches your headlines/descriptions to find the best combination. You give it options, it optimizes.

---

## 🔗 How They Work Together

**Example Flow:**

1. **User searches:** "men's accountability group near me"
2. **Ad Group checks:** Does this match our keywords? ✅ YES ("accountability group near me")
3. **Ad Group checks:** Is user in our target location? ✅ YES (Arlington VA)
4. **Ad Group checks:** Is user in our age range? ✅ YES (35 years old)
5. **Ad Creative shows:** Google shows one of our ads with our headlines/descriptions
6. **User clicks:** Goes to our `finalUrl`
7. **Campaign charges:** Deducts cost from our `dailyBudget`

---

## 📦 What We Store in Our DB

**GoogleAdCampaign table:**
- Campaign-level stuff (name, budget, dates, status)
- Links to: Organization, Persona (if used), GoogleAdAccount (OAuth)

**GoogleAdGroup table:**
- Targeting stuff (keywords, locations, ages)
- Links to: Campaign (parent)

**GoogleAdCreative table:**
- Ad copy (headlines, descriptions, URLs)
- Links to: Ad Group (parent)

---

## 🎯 Simplified for Our MVP

For our reverse engineering flow, we generate:
1. **ONE campaign** (from persona)
2. **ONE ad group** (with persona-based keywords and targeting)
3. **ONE ad creative** (with AI-generated headlines/descriptions)

Later, users can add more ad groups (different audiences) or creatives (A/B testing).

---

## 💡 Key Takeaways

- **Campaign = Budget container**
- **Ad Group = Keyword + targeting layer**
- **Ad Creative = The actual ad copy**

Think of it like:
- Campaign = Your budget for the whole party
- Ad Group = Which guests you invite
- Ad Creative = The invitation design they see

