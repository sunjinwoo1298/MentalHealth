# Mental Health AI Platform

An AI-powered, confidential, and empathetic mental wellness solution for Indian youth.

## 🌟 Features

- **Immersive AI Chatbot**: Personal, empathetic conversations with avatar interface
- **Smart Intervention System**: AI-powered risk assessment and crisis detection
- **Privacy-First Design**: End-to-end encryption and data minimization
- **Cultural Sensitivity**: Tailored for Indian youth context and values
- **Professional Integration**: Seamless connection to verified mental health professionals
- **Gamification**: Engaging progress tracking and wellness challenges

## 🏗️ Architecture

```
mentalHealth/
├── frontend/          # React.js web application
├── backend/           # Node.js Express API server
├── ai-services/       # Python AI microservices (Gemini + LangChain)
├── database/          # PostgreSQL schema and migrations
├── shared/            # Shared types, utilities, and configurations
└── docs/              # Documentation and API specs
```

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **AI Services**: Python, FastAPI, Google Gemini, LangChain, LangGraph
- **Database**: PostgreSQL with encryption
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket for chat functionality
- **Security**: End-to-end encryption, HIPAA compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Google Cloud Account (for Gemini API)

### Installation

1. **Clone and setup environment**
   ```bash
   git clone <repository-url>
   cd mentalHealth
   cp .env.example .env
   # Configure your environment variables
   ```

2. **Setup Database**
   ```bash
   cd database
   # Setup PostgreSQL and run migrations
   npm run migrate:up
   ```

3. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install

   # AI Services
   cd ../ai-services
   pip install -r requirements.txt
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - AI Services
   cd ai-services && python main.py

   # Terminal 3 - Frontend
   cd frontend && npm start
   ```

## 📋 Development Guidelines

### Security & Privacy
- All user data is encrypted at rest and in transit
- Implement proper session management
- Regular security audits and penetration testing
- GDPR and HIPAA compliance

### Cultural Sensitivity
- Use inclusive language and imagery
- Support multiple Indian languages
- Respect cultural values and family dynamics
- Collaborate with mental health professionals

### AI Ethics
- Transparent AI decision-making
- Bias detection and mitigation
- Human oversight for critical interventions
- Clear boundaries of AI capabilities

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@mentalhealth-ai.com or join our community Discord.

---

**⚠️ Important**: This application is designed to supplement, not replace, professional mental health care. Always seek professional help for serious mental health concerns.
