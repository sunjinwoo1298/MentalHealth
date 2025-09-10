from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from dotenv import load_dotenv

# Import routers
from app.routers import chat, intervention, wellness, analytics

# Import services
from app.services.gemini_service import GeminiService
from app.services.intervention_service import InterventionService
from app.services.emotion_analysis import EmotionAnalysisService
from app.services.crisis_detection import CrisisDetectionService

# Import models
from app.models.chat_models import ChatRequest, ChatResponse
from app.models.intervention_models import InterventionRequest, InterventionResponse

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Mental Health AI Services",
    description="AI-powered mental health support services using Google Gemini and LangChain",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
        "http://localhost:3001",  # Backend API
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
gemini_service = GeminiService()
intervention_service = InterventionService()
emotion_service = EmotionAnalysisService()
crisis_service = CrisisDetectionService()

# Include routers
app.include_router(chat.router, prefix="/api/ai/chat", tags=["Chat AI"])
app.include_router(intervention.router, prefix="/api/ai/intervention", tags=["Smart Interventions"])
app.include_router(wellness.router, prefix="/api/ai/wellness", tags=["Wellness AI"])
app.include_router(analytics.router, prefix="/api/ai/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "Mental Health AI Services",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "chat": "/api/ai/chat",
            "intervention": "/api/ai/intervention", 
            "wellness": "/api/ai/wellness",
            "analytics": "/api/ai/analytics",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test Gemini connection
        gemini_status = await gemini_service.health_check()
        
        return {
            "status": "healthy",
            "services": {
                "gemini": gemini_status,
                "intervention": "operational",
                "emotion_analysis": "operational",
                "crisis_detection": "operational"
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/api/ai/process-message")
async def process_message(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Main endpoint for processing user messages with AI analysis
    Includes emotion detection, crisis assessment, and response generation
    """
    try:
        # Validate user token (would integrate with main backend auth)
        user_id = request.user_id
        
        # 1. Analyze emotion and sentiment
        emotion_analysis = await emotion_service.analyze_message(request.message)
        
        # 2. Crisis detection
        crisis_assessment = await crisis_service.assess_risk(
            message=request.message,
            user_history=request.conversation_history,
            emotion_data=emotion_analysis
        )
        
        # 3. Generate AI response using Gemini
        ai_response = await gemini_service.generate_response(
            message=request.message,
            context=request.conversation_history,
            user_profile=request.user_profile,
            emotion_state=emotion_analysis,
            crisis_level=crisis_assessment.risk_level
        )
        
        # 4. Check if intervention is needed
        if crisis_assessment.intervention_needed:
            intervention_response = await intervention_service.trigger_intervention(
                user_id=user_id,
                crisis_level=crisis_assessment.risk_level,
                trigger_message=request.message,
                recommended_actions=crisis_assessment.recommended_actions
            )
            
            # Add intervention to background tasks
            background_tasks.add_task(
                intervention_service.log_intervention,
                user_id,
                intervention_response
            )
        
        # 5. Prepare response
        response = ChatResponse(
            message=ai_response.content,
            emotion_analysis=emotion_analysis,
            crisis_assessment=crisis_assessment,
            intervention_triggered=crisis_assessment.intervention_needed,
            confidence_score=ai_response.confidence,
            suggested_actions=ai_response.suggested_actions,
            wellness_recommendations=ai_response.wellness_recommendations
        )
        
        # Log conversation for learning (in background)
        background_tasks.add_task(
            log_conversation,
            user_id,
            request.message,
            response
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

async def log_conversation(user_id: str, user_message: str, ai_response: ChatResponse):
    """Background task to log conversations for improvement"""
    try:
        # Log to database for analytics and model improvement
        # This would integrate with the main backend database
        pass
    except Exception as e:
        print(f"Error logging conversation: {e}")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": "2024-01-01T00:00:00Z"
    }

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICES_PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.getenv("NODE_ENV") == "development" else False,
        log_level="info"
    )
