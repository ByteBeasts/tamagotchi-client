# 🚀 ByteBeasts Mixpanel Analytics Setup

## 📋 Quick Setup Steps

### 1. **Get Mixpanel Token**
1. Go to [mixpanel.com](https://mixpanel.com) and create account
2. Create new project "ByteBeasts"
3. Copy your project token from Settings > Project Settings

### 2. **Add Environment Variable**
Add this to your `.env` file:
```bash
REACT_APP_MIXPANEL_TOKEN=your_actual_token_here
```

### 3. **Done! 🎉**
Analytics are already integrated and will start tracking:

## 📊 What Gets Tracked

### 🔥 **Core Engagement Events**
- `Beast Fed` - When users feed their beast
- `Beast Clean` - When users clean their beast  
- `Beast Sleep` / `Beast Wake` - Sleep cycle actions
- `Minigame Completed` - Game sessions with score/rewards
- `Daily Login` - User returns each day

### 🎯 **Growth Events**
- `Onboarding Step` - Beast creation progress
- `Purchase Intent` - When users need gems/food
- `Session End` - Session quality metrics

## 📈 **Key Dashboards to Create in Mixpanel**

### 1. **Growth Health Dashboard**
```
- Funnel: App Open → Beast Hatch → First Care Action
- Retention: Day 1, 7, 30 by user segment
- Daily Active Users trend
```

### 2. **Engagement Dashboard**  
```
- Beast care actions per user per day
- Session quality scores over time
- Feature discovery rates
```

### 3. **Monetization Dashboard**
```
- Purchase intent to conversion funnel
- Revenue per user by engagement level
- Churn risk distribution
```

## 🎯 **Strategic Questions You Can Answer**

✅ **"Which beast species have highest retention?"**
- Segment `Daily Login` by beast species
- Compare 7-day retention rates

✅ **"What predicts user churn?"**
- Analyze `Session End` quality scores
- Look at care_urgency patterns before churn

✅ **"When should we ask for purchases?"**  
- Track `Purchase Intent` conversion rates
- Segment by beast_urgency + user_engagement

✅ **"What onboarding step loses most users?"**
- Build funnel from `Onboarding Step` events
- Optimize the biggest drop-off point

## 🔧 **Advanced Analytics (Optional)**

### **Cohort Analysis**
```javascript
// In Mixpanel, create behavioral cohorts:
"Quick Adopters" = Completed onboarding < 10 min
"Game Focused" = 3+ games in first session  
"Care Focused" = 3+ care actions in first day
```

### **Predictive Segments**
```javascript
// Track users by engagement patterns:
churn_risk: 'low' | 'medium' | 'high' | 'critical'
monetization_opportunity: 'none' | 'low' | 'medium' | 'high'
```

## 📱 **Mobile App Ready**
All events work on mobile web - no additional setup needed!

---

**🎯 Goal**: Use data to 2-3x your retention and optimize monetization timing for maximum LTV. 