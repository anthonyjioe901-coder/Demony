# Referral System - Quick Reference

## 💰 New Bonus Structure

| Item | Amount |
|------|--------|
| Referrer Bonus | GH₵20 |
| Referee Bonus | GH₵20 |
| Minimum Investment | GH₵100 |
| Qualification Requirement | 10 qualified referrals |
| Qualifying Investment | GH₵100+ per referral |

---

## 🔐 Earnings Lock/Unlock System

### Before Qualification (< 10 qualified referrals)
- ✅ Bonuses are **tracked**
- 🔒 Bonuses are **locked** (not added to wallet)
- 📊 Progress bar shows: "7/10 Qualified Referrals"
- 💰 Display shows: "GH₵140 Locked"

### After Qualification (10+ qualified referra  QQQQls)
- ✅ **All accumulated bonuses unlocked** at once
- ✅ Added to wallet immediately
- ✅ All future bonuses credited instantly
- 💰 Display shows: "GH₵240 Available"

---

## 📊 What Counts as a "Qualified Referral"?

A referred friend who:
1. ✅ Signs up using your referral code
2. ✅ Makes their first investment
3. ✅ Investment amount is **GH₵100 or more**

**Examples:**
- Friend invests GH₵150 → ✅ Qualified (counts toward your 10)
- Friend invests GH₵50 → ❌ Not qualified (bonus still given to both, but doesn't count toward unlock)

---

## 🎯 User Journey

### Step 1: User Refers Friend
```
→ Friend signs up with code
→ Referral status: "Pending"
→ Bonus: GH₵0 (waiting for investment)
```

### Step 2: Friend Invests GH₵150
```
→ Referral status: "Completed"
→ Referrer earns: GH₵20 (locked)
→ Referee earns: GH₵20 (unlocked ✅ - welcome bonus)
→ Progress: 1/10 qualified
```

### Step 3: 9 More Friends Invest GH₵100+
```
→ Progress: 10/10 qualified
→ 🎉 All GH₵200 unlocked!
→ Added to wallet
→ Email: "Congratulations! You unlocked GH₵200"
```

### Step 4: Future Referrals
```
→ 11th friend invests GH₵100
→ GH₵20 credited immediately ✅
→ No more waiting!
```

---

## 📱 Portfolio Widget Display

### Not Qualified (Example: 7/10)
```
┌─────────────────────────────────────┐
│ 🎁 Give GH₵20, Get GH₵20           │
│                                     │
│ Unlock earnings after 10 qualified  │
│ referrals                           │
│                                     │
│ Your Code: DEM4A2F8B [Copy]         │
│                                     │
│ ███████████████░░░░░ 70%           │
│ 7/10 Qualified Referrals            │
│                                     │
│ 🔒 Earnings locked until 10         │
│ qualified referrals (GH₵100+ each)  │
│                                     │
│ ┌──────┬──────────┬─────────┐      │
│ │  12  │   7/10   │ GH₵140  │      │
│ │ Refer│ Qualified│ Locked  │      │
│ └──────┴──────────┴─────────┘      │
└─────────────────────────────────────┘
```

### Qualified (10+ qualified)
```
┌─────────────────────────────────────┐
│ 🎁 Give GH₵20, Get GH₵20           │
│                                     │
│ Your Code: DEM4A2F8B [Copy]         │
│                                     │
│ ✅ Qualified! All earnings unlocked │
│                                     │
│ ┌──────┬──────────┬─────────┐      │
│ │  15  │  12/10   │ GH₵240  │      │
│ │ Refer│ Qualified│Available│      │
│ └──────┴──────────┴─────────┘      │
└─────────────────────────────────────┘
```

---

## 🔄 Comparison: Old vs New

| Feature | Old System | New System |
|---------|-----------|-----------|
| Referrer Bonus | GH₵50 | GH₵20 (-60%) |
| Referee Bonus | GH₵50 | GH₵20 (-60%) |
| Payout Timing | Immediate | After 10 qualified |
| Qualification | None | Must invest GH₵100+ |
| Cost per 100 referrals | GH₵5,000 | ~GH₵200 (-96%) |
| Abuse Prevention | ❌ None | ✅ Strong |

---

## 🎨 Marketing Messages

### Short Version
> **Give GH₵20, Get GH₵20!** Refer friends and earn bonuses. Unlock earnings after 10 qualified referrals.

### Medium Version (Portfolio)
> **Refer friends and earn GH₵20 when they invest!** Unlock all earnings after 10 qualified referrals (GH₵100+ investment each).

### Long Version (Support/FAQ)
> Share your referral code with friends! When they sign up and make their first investment of GH₵100 or more, you both earn GH₵20. Your bonuses are tracked and will unlock once you have 10 qualified referrals. After that, all future bonuses are credited immediately!

---

## 🛠️ API Response Structure

```javascript
// GET /api/referrals/my-code
{
  "code": "DEM4A2F8B",
  "shareUrl": "https://demony.com/signup?ref=DEM4A2F8B",
  "stats": {
    "totalReferrals": 12,
    "completedReferrals": 9,
    "pendingReferrals": 3,
    "qualifiedReferrals": 7,        // NEW
    "qualifyingNeeded": 10,         // NEW
    "totalEarned": 180,
    "availableEarnings": 0,         // NEW
    "lockedEarnings": 180,          // NEW
    "isQualified": false,           // NEW
    "progress": 70,                 // NEW (percentage)
    "bonusPerReferral": 20
  }
}
```

---

## 📧 Email Templates (Summary)

1. **Progress Email** - "7/10 qualified! GH₵140 pending"
2. **Unlock Email** - "🎉 GH₵200 unlocked and added to wallet!"
3. **Instant Bonus** - "GH₵20 bonus credited!"

---

## ⚠️ Important Notes for Support Team

### Common User Questions

**Q: "Where's my money?"**
A: Check if you have 10 qualified referrals. Progress shown in Portfolio.

**Q: "My friend invested GH₵50, why didn't it count?"**
A: Needs to be GH₵100+ to qualify. Friend still got bonus, but doesn't count toward your 10.

**Q: "This wasn't mentioned before!"**
A: System updated Dec 31, 2025 for sustainability. Old referrals are honored.

**Q: "How long until I unlock?"**
A: Depends on referrals! Average user reaches 10 in 2-3 months of active sharing.

---

## 🎯 Success Metrics to Track

- Average time to reach 10 qualified referrals
- Conversion rate: Sign-up → GH₵100+ investment
- Total bonuses locked vs unlocked
- Cost savings vs old system
- User complaints vs satisfaction

---

**Updated:** December 31, 2025  
**Status:** ✅ Live  
**Cost Savings:** 96% vs old model
