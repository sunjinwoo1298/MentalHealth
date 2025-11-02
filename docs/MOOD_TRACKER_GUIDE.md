# 📊 Mood Tracker Feature - Complete Implementation Guide

## 🎯 Overview

The Mood Tracker is a comprehensive mental wellness feature that allows users to log their emotional state using two different methods:

1. **Quick Mood Check** - Fast 5-emotion rating widget on dashboard
2. **Full Mood Logger** - Detailed tracking with sliders, emotions, triggers, and notes

---

## 🏗️ Architecture

### Frontend Components

#### 1. QuickMoodWidget (`frontend/src/components/dashboard/QuickMoodWidget.tsx`)
**Location:** Dashboard (Index.tsx)
**Purpose:** Quick daily emotional check-in

**Features:**
- 5 core emotions with 0-5 rating scale:
  - 😊 Happy (yellow-orange gradient)
  - 😢 Sad (blue-indigo gradient)
  - 😰 Anxious (red-pink gradient)
  - 😌 Calm (green-teal gradient)
  - ⚡ Energized (purple-pink gradient)
  
- 10 common triggers (multi-select)
- Optional quick notes
- Auto-saves to localStorage + backend API
- Awards 5 gamification points
- Shows daily tracking count

**Usage:**
```tsx
import QuickMoodWidget from '@/components/dashboard/QuickMoodWidget';

<QuickMoodWidget />
```

#### 2. MoodPage (`frontend/src/pages/MoodPage.tsx`)
**Route:** `/mood`
**Purpose:** Full mood logging and history viewing

**Features:**

**Quick Mood History Section:**
- Today's quick check-ins
- Weekly insights with emotion frequency
- Complete history grid view
- Emotion ratings displayed as dots (0-5 scale)
- Trigger pills with color coding

**Full Mood Logger:**
- 3 main sliders (1-10 scale):
  - Mood: Terrible → Excellent
  - Energy: Exhausted → Energetic
  - Anxiety: Very Calm → Panic
  
- 15 emotion options (multi-select with emojis)
- 20 trigger options (multi-select)
- Additional notes textarea
- Awards 8 gamification points
- Success animation with confetti potential

**Analytics Display:**
- Today's logs summary
- Weekly averages (mood, energy, anxiety)
- Complete history in card grid
- Emotion frequency tracking
- Trigger pattern analysis

---

### Backend API

#### Base URL: `http://localhost:3001/api/wellness`

#### Endpoints:

##### 1. **POST /mood/quick** - Create Quick Mood Check
```typescript
// Request
{
  "emotions": {
    "Happy": 4,
    "Sad": 1,
    "Anxious": 2,
    "Calm": 3,
    "Energized": 4
  },
  "triggers": ["Work", "Academic"],
  "notes": "Feeling good about exam prep"
}

// Response
{
  "success": true,
  "message": "Quick mood check saved successfully",
  "data": {
    "entry": {
      "id": "uuid",
      "mood_rating": 7,  // Calculated from emotions
      "emotions": ["Happy", "Energized"],
      "triggers": ["Work", "Academic"],
      "entry_type": "quick",
      "created_at": "2025-11-02T10:30:00Z"
    },
    "points_earned": 5
  }
}
```

##### 2. **POST /mood** - Create Full Mood Entry
```typescript
// Request
{
  "mood_rating": 8,
  "emotions": ["Happy", "Motivated", "Grateful"],
  "energy_level": 7,
  "anxiety_level": 3,
  "triggers": ["Exercise", "Social"],
  "notes": "Great day after morning workout",
  "activities": ["exercise", "meditation"],
  "sleep_hours": 7.5
}

// Response
{
  "success": true,
  "message": "Mood entry created successfully",
  "data": {
    "entry": { /* complete entry */ },
    "points_earned": 8
  }
}
```

##### 3. **GET /mood** - Get Mood History
```typescript
// Query Parameters
?startDate=2025-10-01&endDate=2025-11-02&limit=30&entry_type=quick

// Response
{
  "success": true,
  "data": {
    "entries": [ /* array of mood entries */ ],
    "count": 15
  }
}
```

##### 4. **GET /mood/analytics** - Get Analytics
```typescript
// Query Parameters
?days=30

// Response
{
  "success": true,
  "data": {
    "statistics": {
      "total_entries": 25,
      "avg_mood": 7.2,
      "avg_energy": 6.8,
      "avg_anxiety": 3.5,
      "min_mood": 4,
      "max_mood": 9
    },
    "top_emotions": [
      { "emotion": "Happy", "frequency": 18 },
      { "emotion": "Calm", "frequency": 15 }
    ],
    "top_triggers": [
      { "trigger": "Work", "frequency": 12 },
      { "trigger": "Academic", "frequency": 8 }
    ],
    "weekly_trend": [
      { "week": "2025-10-28", "avg_mood": 7.5, "entry_count": 5 }
    ]
  }
}
```

##### 5. **GET /mood/:date** - Get Entry for Specific Date
```typescript
// GET /mood/2025-11-02

// Response
{
  "success": true,
  "data": { /* mood entry for that date */ }
}
```

##### 6. **PUT /mood/:id** - Update Mood Entry
```typescript
// Request
{
  "mood_rating": 9,
  "notes": "Updated - feeling even better now!"
}

// Response
{
  "success": true,
  "message": "Mood entry updated successfully",
  "data": { /* updated entry */ }
}
```

##### 7. **DELETE /mood/:id** - Delete Mood Entry
```typescript
// Response
{
  "success": true,
  "message": "Mood entry deleted successfully"
}
```

---

### Database Schema

#### Table: `mood_entries`

```sql
CREATE TABLE mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core mood data
    mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
    emotions TEXT[] DEFAULT '{}',
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    
    -- Context
    triggers TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    sleep_hours DECIMAL(3,1),
    
    -- Sensitive data (encrypted with pgcrypto)
    notes_encrypted BYTEA,
    
    -- Metadata
    entry_type VARCHAR(20) DEFAULT 'full' CHECK (entry_type IN ('quick', 'full')),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, entry_date)
);

-- Indexes
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, entry_date);
CREATE INDEX idx_mood_entries_type ON mood_entries(user_id, entry_type);
CREATE INDEX idx_mood_entries_created ON mood_entries(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY mood_entry_policy ON mood_entries FOR ALL 
  USING (auth.uid() = user_id);
```

#### Migration Script

Run: `database/migration_mood_enhancements.sql`

```bash
# From project root
psql -U postgres -d mental_health_db -f database/migration_mood_enhancements.sql
```

---

## 🔐 Security Features

### 1. **Encryption**
- Personal notes encrypted using PostgreSQL `pgcrypto` extension
- Encryption key stored in database config: `app.encryption_key`
- Automatic encryption on INSERT/UPDATE
- Automatic decryption on SELECT

### 2. **Access Control**
- JWT authentication required for all endpoints
- Row-Level Security (RLS) ensures users only see their own data
- User ID extracted from JWT token, not request body

### 3. **Data Validation**
- Mood ratings validated (1-10 range)
- Anxiety/energy levels validated (1-10 range)
- Duplicate entry prevention (unique constraint on user_id + entry_date)
- SQL injection protection via parameterized queries

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         USER ACTION                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │  QuickMoodWidget (Dashboard)        │
         │  - 5 emotions rated 0-5             │
         │  - Trigger selection                │
         │  - Optional notes                   │
         └─────────────┬───────────────────────┘
                       │ Save
                       ▼
         ┌─────────────────────────────────────┐
         │  1. localStorage (immediate)        │
         │  2. POST /api/wellness/mood/quick   │
         └─────────────┬───────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────────┐
         │  Backend API (wellness.ts)          │
         │  - Validates data                   │
         │  - Encrypts notes with pgcrypto     │
         │  - Calculates mood_rating           │
         │  - Inserts/updates database         │
         └─────────────┬───────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────────┐
         │  PostgreSQL Database                │
         │  - mood_entries table               │
         │  - RLS policy applied               │
         │  - Encrypted notes stored           │
         └─────────────┬───────────────────────┘
                       │
         ┌─────────────┴───────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐              ┌──────────────────────┐
│ Gamification    │              │  Analytics Engine    │
│ Service         │              │  - Weekly trends     │
│ +5 points       │              │  - Emotion patterns  │
└─────────────────┘              │  - Trigger analysis  │
                                 └──────────────────────┘
```

---

## 🚀 Quick Start

### 1. Run Database Migration
```bash
cd database
psql -U postgres -d mental_health_db -f migration_mood_enhancements.sql
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

### 3. Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Test the Widget
1. Navigate to `/dashboard`
2. Scroll to "Quick Mood Check" widget
3. Rate your emotions (0-5 scale)
4. Select triggers
5. Add optional notes
6. Click "Log Mood"
7. Check browser console for API response
8. View history at `/mood`

---

## 🧪 Testing

### Manual Testing Checklist

**Quick Mood Widget:**
- [ ] Widget displays on dashboard
- [ ] Emotion sliders work (0-5 scale)
- [ ] Trigger pills toggle correctly
- [ ] Notes textarea accepts input
- [ ] Save button shows loading state
- [ ] Success message appears
- [ ] Form resets after save
- [ ] Today's count increments
- [ ] Data saved to localStorage
- [ ] API call succeeds (check Network tab)

**Mood History Page:**
- [ ] Quick mood logs display correctly
- [ ] Today's section shows current day entries
- [ ] Weekly insights calculate properly
- [ ] Emotion ratings display as dots
- [ ] Triggers show as colored pills
- [ ] Full mood logger form works
- [ ] All sliders function (1-10 scale)
- [ ] Emotion multi-select works
- [ ] Trigger multi-select works
- [ ] Save awards correct points
- [ ] History grid displays all entries

**Backend API:**
```bash
# Test quick mood endpoint
curl -X POST http://localhost:3001/api/wellness/mood/quick \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "emotions": {"Happy": 4, "Calm": 3},
    "triggers": ["Work"],
    "notes": "Test entry"
  }'

# Test get history
curl -X GET "http://localhost:3001/api/wellness/mood?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test analytics
curl -X GET "http://localhost:3001/api/wellness/mood/analytics?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📈 Future Enhancements

### Phase 1 (Completed) ✅
- [x] Quick Mood Widget
- [x] Backend CRUD API
- [x] Database schema with encryption
- [x] localStorage + API integration
- [x] History display page

### Phase 2 (In Progress) 🔄
- [ ] Gamification backend integration
- [ ] Real-time point awards
- [ ] Streak tracking for daily mood logs
- [ ] Badge achievements for consistency

### Phase 3 (Planned) 📋
- [ ] AI-powered insights
  - Pattern detection (e.g., "Anxiety peaks on Mondays")
  - Personalized recommendations
  - Early warning system
  
- [ ] Advanced analytics
  - Mood correlation with weather
  - Sleep quality impact analysis
  - Exercise-mood relationship charts
  
- [ ] Social features
  - Anonymous community trends
  - Support group matching
  - Share progress with therapist

### Phase 4 (Future) 🔮
- [ ] Offline-first with service workers
- [ ] Push notifications for daily check-ins
- [ ] Mood prediction ML model
- [ ] Integration with wearable devices
- [ ] Export data to PDF/CSV
- [ ] Voice-based mood logging

---

## 🐛 Troubleshooting

### Issue: Widget not showing on dashboard
**Solution:** Ensure `QuickMoodWidget` is imported and added to Index.tsx:
```tsx
import QuickMoodWidget from '@/components/dashboard/QuickMoodWidget';
// In render: <QuickMoodWidget />
```

### Issue: API calls failing with 401
**Solution:** Check JWT token in localStorage:
```javascript
console.log(localStorage.getItem('token'));
```
Re-login if token is missing or expired.

### Issue: Notes not saving
**Solution:** Verify `pgcrypto` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET app.encryption_key = 'your-secure-key-here';
```

### Issue: Duplicate entry error
**Solution:** The table has UNIQUE(user_id, entry_date). Use UPDATE instead of INSERT, or change `entry_date` to `created_at` for multiple entries per day.

---

## 📝 Code Examples

### Using the Quick Mood API in Custom Components

```typescript
// Save quick mood
const saveQuickMood = async (emotions: EmotionRating, triggers: string[], notes: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/api/wellness/mood/quick', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ emotions, triggers, notes })
  });
  
  const result = await response.json();
  return result;
};

// Get mood history
const getMoodHistory = async (days = 30) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:3001/api/wellness/mood?limit=${days}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const result = await response.json();
  return result.data.entries;
};

// Get analytics
const getMoodAnalytics = async (days = 30) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:3001/api/wellness/mood/analytics?days=${days}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const result = await response.json();
  return result.data;
};
```

---

## 🔗 Related Documentation

- [Gamification System Integration](./GAMIFICATION_INTEGRATION.md)
- [Database Schema Documentation](../database/schema.sql)
- [API Authentication Guide](./API_AUTH.md)
- [Frontend Component Library](./COMPONENT_LIBRARY.md)

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review console errors (F12)
3. Check backend logs (`backend/logs/`)
4. Verify database connections
5. Contact development team

---

**Last Updated:** November 2, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready (Phase 1 Complete)
