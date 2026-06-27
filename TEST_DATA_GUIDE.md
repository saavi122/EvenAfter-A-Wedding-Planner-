# EvenAfter AI Wedding Planner - Test Data Guide

This guide contains the preloaded test user credentials, database seeding command, and sample test datasets to verify the **AI Wedding Planner Assistant** without needing to register new accounts.

---

## 1. Seeding the Database
To clear the database and seed the preloaded test datasets (including client accounts, planners, and vendors), run the following command in the project root:

```bash
npm run db:seed
```

---

## 2. Test Login Credentials

### Client Account (Allowed to use the AI Wedding Planner)
- **Email:** `client@example.com`
- **Password:** `password123`
- **Name:** Sarah Miller
- **Wedding Details:** "Sarah & David's Royal Wedding" at Umaid Bhawan Palace, Jodhpur (Budget: ₹75 Lakhs).

### Planner Account (Access Denied to AI Assistant)
- **Email:** `pankaj@example.com`
- **Password:** `password123`
- **Name:** Pankaj Sharma

### Vendor Account (Access Denied to AI Assistant)
- **Email:** `caterer@example.com`
- **Password:** `password123`
- **Name:** Chef Pankaj & Royal Caterers

---

## 3. Test Cases for AI Assistant

Use the following queries to verify different categories of the AI planner's capabilities inside the Client Dashboard or on the **AI Planner Test** page.

### 1. Venue Suggestions
> "I have a budget of ₹15 Lakhs and expect 200 guests. Can you suggest wedding venues in Goa? Please compare beachfront vs resort options."

### 2. Budget Allocation
> "How should I allocate a ₹20 Lakh budget for a traditional wedding with 250 guests? What are some saving tips?"

### 3. Themes & Aesthetics
> "Recommend a wedding theme that combines minimal bohemian and traditional elements. Explain why it fits a garden setup."

### 4. Catering & Food
> "Design a vegetarian sangeet catering menu featuring regional North Indian cuisines and live chaat counters."

### 5. Outfits & Styling
> "Suggest outfit ideas for the bride, groom, bridesmaids, and groomsmen coordinating with a royal palace theme in winter."

### 6. Timeline & Checklists
> "Can you generate a detailed wedding day schedule starting from morning preparations to the reception dinner?"

### 7. Off-Topic Redirection (Allowed Off-Topic)
> "Hi there! I am planning a trip to a wedding next week and need some general packing and motivational tips."
* **Expected AI Behavior:** Answers the packing/greeting briefly and friendly, then redirects the conversation back to wedding planning.

### 8. Restricted Topics Refusal
> "What are your thoughts on the upcoming political election debates?"
* **Expected AI Behavior:** Politely refuses to discuss politics and redirects the conversation back to wedding planning.
