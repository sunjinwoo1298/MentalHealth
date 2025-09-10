# Mental Health AI Platform - Hackathon Edition 🚀

An AI-powered mental wellness solution for Indian youth - Built for rapid prototyping and demo.

## 🎯 Hackathon Focus

This is a **4-week sprint version** optimized for hackathons with:
- ✅ **Simplified setup** (no Docker required)
- ✅ **Rapid development** focus
- ✅ **Demo-ready features**
- ✅ **Core functionality** over extensive DevOps

## 🏗️ Architecture Overview

```
Frontend (React)  ←→  Backend (Node.js)  ←→  AI Services (Python)
     ↓                      ↓                       ↓
   Port 3000            Port 3001               Port 8000
                            ↓
                   Simple Database
                   (SQLite/JSON)
```

## 🚀 Quick Start (5 Minutes)

### 1. **Setup**
```bash
# Run the setup script
setup.bat

# Add your Gemini API key to .env file
GEMINI_API_KEY=your_api_key_here
```

### 2. **Start Development**
```bash
# Start all services
npm run dev

# Or individually:
npm run dev:frontend  # React app (port 3000)
npm run dev:backend   # Node.js API (port 3001) 
npm run dev:ai        # Python AI (port 8000)
```

### 3. **Open Browser**
Navigate to `http://localhost:3000` and start chatting!

## 👥 Team Roles & Tasks

| Member | Role | Week 1 Focus | Week 2-3 Focus | Week 4 Focus |
|--------|------|--------------|----------------|--------------|
| **Member 1** | Full-Stack Lead | Integration Setup | End-to-End Testing | Demo Preparation |
| **Member 2** | Frontend Dev | React + UI | Chat Interface + Avatar | Polish + Demo Flow |
| **Member 3** | Backend Dev | API + Auth | Data Management | Performance + Security |
| **Member 4** | AI Engineer | Gemini Integration | Smart Interventions | AI Optimization |
| **Member 5** | Data + QA | Simple Database | Testing + Validation | Documentation + Demo |

## 🎯 Key Features for Demo

### **Week 1: Foundation**
- [ ] Basic chat interface working
- [ ] Simple authentication
- [ ] Gemini AI responding
- [ ] Basic data storage

### **Week 2: Core Features**
- [ ] Real-time chat with avatar
- [ ] Emotion detection
- [ ] Crisis intervention triggers
- [ ] User mood tracking

### **Week 3: Smart Features**
- [ ] Personalized responses
- [ ] Cultural sensitivity
- [ ] Smart interventions
- [ ] Professional referrals

### **Week 4: Demo Ready**
- [ ] Polished UI/UX
- [ ] Demo scenarios prepared
- [ ] Performance optimized
- [ ] Presentation ready

## 🛠️ Tech Stack (Simplified)

### **Frontend**
- React 18 + TypeScript
- Material-UI for components
- Redux for state management

### **Backend**
- Node.js + Express
- JWT authentication
- SQLite for data (simple & fast)

### **AI Services**
- Python + FastAPI
- Google Gemini for conversations
- LangChain for context management

### **No Complex Setup Needed**
- ❌ No Docker required
- ❌ No PostgreSQL setup
- ❌ No complex DevOps
- ✅ Focus on features!

## 📊 Demo Scenarios

### **Scenario 1: Basic Chat**
User chats with AI about daily stress → AI provides supportive responses

### **Scenario 2: Crisis Detection**
User expresses concerning thoughts → AI triggers intervention protocol

### **Scenario 3: Cultural Context**
AI responds with culturally appropriate advice for Indian context

### **Scenario 4: Professional Referral**
User needs professional help → AI suggests therapist network

## 🎨 UI Components Ready for Demo

- **Chat Interface**: Clean, WhatsApp-like design
- **Avatar System**: Customizable virtual companion
- **Mood Tracker**: Visual mood tracking over time
- **Intervention UI**: Crisis support interface
- **Dashboard**: User progress and insights

## 🔧 Development Tips

### **Daily Workflow**
```bash
# Morning standup (15 min)
# Development work
# Quick integration testing
# Evening commit and push
```

### **Testing Strategy**
- Focus on **demo scenarios** over comprehensive testing
- **Manual testing** for user flows
- **Integration testing** for critical paths

### **Demo Preparation**
- **Week 3**: Start preparing demo scenarios
- **Week 4**: Focus on polish and presentation
- **Demo Day**: Rehearse multiple times

## 🚨 Emergency Contacts

- **Frontend Issues**: Member 2
- **Backend Problems**: Member 3  
- **AI Service Issues**: Member 4
- **Integration Problems**: Member 1
- **Data/Testing Issues**: Member 5

## 📱 Mobile Responsiveness

The application is designed to work on:
- ✅ Desktop browsers
- ✅ Mobile browsers (responsive)
- ✅ Tablet devices

## 🎉 Success Metrics

### **Technical Goals**
- [ ] 100% uptime during demo
- [ ] < 2 second response time
- [ ] Working on multiple devices
- [ ] All core features functional

### **Demo Goals**
- [ ] Engaging user interaction
- [ ] Clear value proposition
- [ ] Smooth demo flow
- [ ] Impressive AI responses

## 📞 Support & Resources

- **Documentation**: `/docs/QUICK_START.md`
- **Task Breakdown**: `TASK_MATRIX.md`
- **Team Plan**: `TEAM_PLAN.md`
- **Daily Standups**: 9 AM (15 min)
- **Team Chat**: [Your preferred platform]

## 🏆 Ready to Win?

This setup is optimized for **rapid development** and **impressive demos**. Focus on core features, test frequently, and prepare your demo early.

**Let's build something that can genuinely help people! 💙**

---

*Last updated: September 2025*
