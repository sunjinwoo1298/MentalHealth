# Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+ (or Docker)
- Google Cloud Account (for Gemini API)

### Quick Setup

1. **Run the setup script**:
   ```bash
   # Windows
   setup.bat
   
   # Linux/Mac
   chmod +x setup.sh && ./setup.sh
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Add your API keys and database credentials

3. **Start development servers**:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Node.js       │    │   Python        │
│   Frontend      │◄──►│   Backend       │◄──►│   AI Services   │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   PostgreSQL    │              │
         │              │   Database      │              │
         │              │   (Port 5432)   │              │
         │              └─────────────────┘              │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │   Redis Cache   │
                        │   (Port 6379)   │
                        └─────────────────┘
```

## 🛠️ Development Workflow

### Frontend Development
```bash
cd frontend
npm start                # Start development server
npm run build           # Build for production
npm test                # Run tests
npm run lint            # Check code quality
```

### Backend Development
```bash
cd backend
npm run dev             # Start with hot reload
npm run build           # Compile TypeScript
npm test                # Run tests
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data
```

### AI Services Development
```bash
cd ai-services
python main.py          # Start FastAPI server
pytest                  # Run tests
black .                 # Format code
flake8                  # Lint code
```

## 🔧 Key Features to Implement

### Phase 1: Core Infrastructure ✅
- [x] Project structure
- [x] Database schema
- [x] Authentication system
- [x] Basic chat interface
- [x] Docker setup

### Phase 2: AI Integration 🚧
- [ ] Gemini API integration
- [ ] Emotion analysis service
- [ ] Crisis detection algorithm
- [ ] Smart intervention system
- [ ] LangChain conversation memory

### Phase 3: Advanced Features 📋
- [ ] Avatar system with customization
- [ ] Wellness activity recommendations
- [ ] Professional therapist network
- [ ] Gamification system
- [ ] Multi-language support

### Phase 4: Production Ready 📋
- [ ] Security audits
- [ ] Performance optimization
- [ ] Monitoring and logging
- [ ] CI/CD pipeline
- [ ] Mobile app (React Native)

## 🧪 Testing Strategy

### Unit Tests
- Frontend: Jest + React Testing Library
- Backend: Jest + Supertest
- AI Services: pytest + httpx

### Integration Tests
- API endpoint testing
- Database integration tests
- AI service integration tests

### E2E Tests
- User journey testing with Playwright
- Crisis intervention workflows
- Professional referral process

## 📊 Performance Monitoring

### Metrics to Track
- Response times for AI services
- User engagement metrics
- Crisis intervention success rates
- System uptime and reliability

### Tools
- Prometheus for metrics collection
- Grafana for visualization
- Sentry for error tracking
- Google Analytics for user behavior

## 🔒 Security Considerations

### Data Protection
- End-to-end encryption for messages
- PII encryption at rest
- HIPAA compliance measures
- Regular security audits

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control
- Rate limiting on API endpoints
- Session management with Redis

## 🌍 Deployment Options

### Development
```bash
npm run dev                    # Local development
docker-compose up -d          # Docker development
```

### Staging
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production
```bash
# Using Docker Swarm
docker stack deploy -c docker-compose.prod.yml mental-health

# Using Kubernetes
kubectl apply -f k8s/
```

## 📝 Code Standards

### Frontend (TypeScript/React)
- Use TypeScript strictly
- Follow React best practices
- Use Material-UI components
- Implement proper error boundaries

### Backend (Node.js/TypeScript)
- Follow RESTful API conventions
- Use proper HTTP status codes
- Implement comprehensive logging
- Handle errors gracefully

### AI Services (Python)
- Follow PEP 8 style guide
- Use type hints
- Implement proper async/await
- Add comprehensive docstrings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### PR Guidelines
- Include tests for new features
- Update documentation
- Follow code style guidelines
- Add changelog entry

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if PostgreSQL is running
pg_isready

# Reset database
npm run db:reset
```

**AI Service Timeout**
```bash
# Check Gemini API key
echo $GEMINI_API_KEY

# Restart AI services
cd ai-services && python main.py
```

**Frontend Build Issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=mental-health:*
npm run dev
```

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discord: [Community Server]
- Email: dev@mentalhealth-ai.com
