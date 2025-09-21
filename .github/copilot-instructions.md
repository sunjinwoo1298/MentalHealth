<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Mental Health AI Platform - Development Instructions

This is a mental wellness platform for Indian youth with a multi-service architecture requiring careful integration and cultural sensitivity.

## Architecture Overview

**Multi-Service Architecture:**
- `frontend/` - React.js (TypeScript, Vite, Tailwind) on port 3000
- `backend/` - Node.js/Express API server (TypeScript) on port 3001  
- `ai-services/` - Python/FastAPI AI microservice on port 5010
- `database/` - PostgreSQL with encryption for sensitive mental health data

**Key Integration Points:**
- Frontend ↔ Backend: REST API + WebSocket for real-time chat
- Backend ↔ AI Services: HTTP requests for chat processing
- All services ↔ Database: Encrypted mental health data storage

## Development Workflows

**Start Development Environment:**
```bash
# Root level - starts all services concurrently
npm run dev

# Or individually:
cd backend && npm run dev      # Node.js API server
cd ai-services && python main.py  # Python AI service  
cd frontend && npm run dev     # React frontend
```

**Database Operations:**
```bash
npm run setup:db             # Run schema + migrations
npm run seed:db              # Add test/demo data
```

## Critical Patterns & Conventions

### Mental Health Data Handling
- **Encryption**: Sensitive fields use `_encrypted` suffix (e.g., `therapy_history_encrypted`)
- **Privacy**: All user conversations stored with proper consent flags
- **Crisis Detection**: AI service has keyword-based + LLM-based intervention triggers
- **Cultural Context**: Support contexts include `general`, `academic`, `family` with culturally-aware responses

### AI Service Integration (`ai-services/main.py`)
- **Context-Aware Chat**: `/chat` endpoint accepts `context` parameter for academic/family/general support
- **Proactive Messaging**: `/proactive_chat` generates intelligent check-ins based on user history
- **Vector Similarity**: Uses `sentence-transformers` for conversation context retrieval
- **Emotional State**: Tracks emotion patterns per user with cultural sensitivity

### Gamification System
- **Multi-Component**: Points, Levels (wellness_levels table), Streaks, Badges, Challenges
- **Cultural Integration**: Sanskrit names for levels, Indian festival themes for achievements
- **Service Pattern**: `GameService` class handles all gamification logic centrally
- **Activity Recording**: `recordDailyActivity()` updates streaks + checks milestones + awards points

### Authentication & Security
- **JWT Pattern**: `authMiddleware` extends Express.Request with user data
- **Encryption**: Uses `pgcrypto` extension for database field encryption
- **Rate Limiting**: Configured per endpoint with development bypasses
- **CORS**: Multi-origin support for dev environments (Vite + CRA)

### Frontend Architecture
- **Context System**: Chat supports academic/family/general modes with different UI themes
- **VRM Avatars**: 3D avatar system using `@pixiv/three-vrm` with emotion controls
- **Real-time**: Socket.IO for live chat with reconnection handling
- **State Management**: React Context for gamification, authentication state

## Essential Commands

**AI Service Testing:**
```bash
# Test chat with context
curl -X POST http://localhost:5010/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I am stressed about exams", "userId": "test", "context": "academic"}'
```

**Database Queries (Key Tables):**
- `users` - Encrypted user data
- `chat_sessions` - Conversation tracking  
- `user_points`, `user_streaks`, `wellness_levels` - Gamification
- `user_profiles` - Mental health specific data with onboarding fields

**Gamification Integration:**
```typescript
// Award points and check level-ups
await GameService.awardPoints(userId, 'daily_chat', { context: 'academic' });

// Record activity and update streaks  
await GameService.recordDailyActivity(userId, 'wellness_check');
```

## Cultural Sensitivity Requirements
- Use Hindi words naturally (e.g., "दिल", "नमस्ते") without tokenization issues
- Respect family dynamics and educational pressure context in India
- Implement academic support mode for student-specific mental health challenges
- Consider generational conflicts and traditional vs modern values

## Security & Privacy Critical Points
- Never log sensitive conversation content
- Always use encrypted fields for therapy history, medication info
- Implement proper session management with Redis
- All mental health data requires explicit user consent
- Crisis detection must have human oversight protocols

## Testing & Integration
- Use `supertest` for API integration tests
- Frontend components tested with React Testing Library
- AI service uses `pytest` with FastAPI test client
- Run `npm test` from any service directory for comprehensive testing
