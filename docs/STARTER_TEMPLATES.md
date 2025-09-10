# Development Starter Templates

## 🚀 Quick Start Code Templates for Each Feature

This file provides starter code templates for each team member to begin implementation immediately.

---

## 👤 Member 1: Chat System Starter

### **Frontend Chat Component**

```typescript
// frontend/src/components/Chat/ChatInterface.tsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: string;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('ai_response', (response: any) => {
      setIsAiTyping(false);
      addMessage(response.content, 'ai', response.emotion);
    });

    newSocket.on('ai_typing', () => setIsAiTyping(true));

    return () => newSocket.close();
  }, []);

  const addMessage = (content: string, sender: 'user' | 'ai', emotion?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      emotion
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Notify avatar of new message
    window.dispatchEvent(new CustomEvent('chatMessage', { 
      detail: { message: newMessage } 
    }));
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !socket) return;

    addMessage(currentMessage, 'user');
    setIsAiTyping(true);
    
    // Send to AI service
    socket.emit('user_message', {
      content: currentMessage,
      userId: 'user123', // Get from auth context
      timestamp: new Date()
    });

    setCurrentMessage('');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Display */}
      <Paper sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: message.sender === 'user' ? 'right' : 'left',
                backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
                p: 1,
                borderRadius: 2
              }}
            >
              {message.content}
            </Typography>
          </Box>
        ))}
        {isAiTyping && (
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            AI is thinking...
          </Typography>
        )}
      </Paper>

      {/* Message Input */}
      <Box sx={{ display: 'flex', p: 2 }}>
        <TextField
          fullWidth
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          variant="outlined"
        />
        <IconButton onClick={sendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
```

### **Backend Chat Routes**

```typescript
// backend/src/routes/chat.ts
import express from 'express';
import { Socket } from 'socket.io';
import axios from 'axios';

const router = express.Router();

// Chat message storage (use SQLite in production)
let chatHistory: any[] = [];

// Socket.io chat handlers
export const setupChatSockets = (io: any) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('user_message', async (data) => {
      try {
        // Store user message
        const userMessage = {
          id: Date.now().toString(),
          content: data.content,
          sender: 'user',
          userId: data.userId,
          timestamp: new Date()
        };
        chatHistory.push(userMessage);

        // Emit typing indicator
        socket.emit('ai_typing');

        // Send to AI service
        const aiResponse = await axios.post('http://localhost:8000/chat', {
          message: data.content,
          userId: data.userId,
          history: chatHistory.slice(-10) // Last 10 messages for context
        });

        // Store AI response
        const aiMessage = {
          id: Date.now().toString() + '1',
          content: aiResponse.data.response,
          sender: 'ai',
          emotion: aiResponse.data.emotion,
          timestamp: new Date()
        };
        chatHistory.push(aiMessage);

        // Send AI response back
        socket.emit('ai_response', aiMessage);

      } catch (error) {
        console.error('Chat error:', error);
        socket.emit('ai_response', {
          content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
          sender: 'ai',
          error: true
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

// REST endpoints for chat history
router.get('/history/:userId', (req, res) => {
  const userHistory = chatHistory.filter(msg => msg.userId === req.params.userId);
  res.json(userHistory);
});

router.delete('/history/:userId', (req, res) => {
  chatHistory = chatHistory.filter(msg => msg.userId !== req.params.userId);
  res.json({ message: 'Chat history cleared' });
});

export default router;
```

---

## 🎭 Member 2: Avatar System Starter

### **Avatar Component**

```typescript
// frontend/src/components/Avatar/AvatarDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Box, Avatar, Fade, Grow } from '@mui/material';

interface AvatarState {
  expression: 'neutral' | 'happy' | 'sad' | 'concerned' | 'thinking' | 'excited';
  animation: 'idle' | 'listening' | 'speaking' | 'celebrating';
  customization: {
    style: string;
    color: string;
    accessory?: string;
  };
}

export const AvatarDisplay: React.FC = () => {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    expression: 'neutral',
    animation: 'idle',
    customization: {
      style: 'friendly',
      color: '#2196f3'
    }
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Listen for chat events
    const handleChatMessage = (event: any) => {
      const { message } = event.detail;
      if (message.sender === 'user') {
        setAvatarState(prev => ({ ...prev, expression: 'listening', animation: 'listening' }));
      } else {
        // AI response
        const emotion = message.emotion || 'neutral';
        setAvatarState(prev => ({ 
          ...prev, 
          expression: mapEmotionToExpression(emotion),
          animation: 'speaking'
        }));
      }
    };

    window.addEventListener('chatMessage', handleChatMessage);
    return () => window.removeEventListener('chatMessage', handleChatMessage);
  }, []);

  const mapEmotionToExpression = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'happy';
      case 'sad': return 'concerned';
      case 'anxious': return 'concerned';
      case 'excited': return 'excited';
      default: return 'neutral';
    }
  };

  const getAvatarIcon = () => {
    // Simple emoji-based avatar for hackathon
    switch (avatarState.expression) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'concerned': return '😟';
      case 'thinking': return '🤔';
      case 'excited': return '🎉';
      default: return '😐';
    }
  };

  const celebrateAchievement = () => {
    setAvatarState(prev => ({ ...prev, expression: 'excited', animation: 'celebrating' }));
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setAvatarState(prev => ({ ...prev, expression: 'happy', animation: 'idle' }));
    }, 3000);
  };

  // Expose methods for other components
  useEffect(() => {
    (window as any).avatarAPI = {
      updateMood: (message: string, response: string) => {
        // Analyze and update expression
      },
      setExpression: (expression: string) => {
        setAvatarState(prev => ({ ...prev, expression: expression as any }));
      },
      celebrateAchievement
    };
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 3
    }}>
      <Grow in={true} timeout={1000}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            fontSize: '3rem',
            backgroundColor: avatarState.customization.color,
            transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={() => setIsAnimating(!isAnimating)}
        >
          {getAvatarIcon()}
        </Avatar>
      </Grow>
      
      <Fade in={isAnimating}>
        <Box sx={{ mt: 1, fontSize: '1.5rem' }}>
          ✨
        </Box>
      </Fade>
    </Box>
  );
};
```

### **Avatar Customization**

```typescript
// frontend/src/components/Avatar/AvatarCustomization.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  ToggleButton,
  ToggleButtonGroup 
} from '@mui/material';

const avatarStyles = [
  { id: 'friendly', emoji: '😊', name: 'Friendly' },
  { id: 'professional', emoji: '🤓', name: 'Professional' },
  { id: 'casual', emoji: '😎', name: 'Casual' },
  { id: 'caring', emoji: '🥰', name: 'Caring' }
];

const colors = ['#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0'];

export const AvatarCustomization: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState('friendly');
  const [selectedColor, setSelectedColor] = useState('#2196f3');

  const saveCustomization = () => {
    // Save to user preferences
    localStorage.setItem('avatarCustomization', JSON.stringify({
      style: selectedStyle,
      color: selectedColor
    }));
    
    // Update avatar
    if ((window as any).avatarAPI) {
      (window as any).avatarAPI.updateCustomization({ 
        style: selectedStyle, 
        color: selectedColor 
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customize Your AI Companion
      </Typography>
      
      {/* Avatar Styles */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Personality Style
      </Typography>
      <Grid container spacing={2}>
        {avatarStyles.map((style) => (
          <Grid item xs={6} key={style.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedStyle === style.id ? '2px solid #2196f3' : '1px solid #ddd'
              }}
              onClick={() => setSelectedStyle(style.id)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">{style.emoji}</Typography>
                <Typography variant="body2">{style.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Color Selection */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Color Theme
      </Typography>
      <ToggleButtonGroup
        value={selectedColor}
        exclusive
        onChange={(e, newColor) => newColor && setSelectedColor(newColor)}
      >
        {colors.map((color) => (
          <ToggleButton key={color} value={color}>
            <Box
              sx={{
                width: 30,
                height: 30,
                backgroundColor: color,
                borderRadius: '50%'
              }}
            />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Button 
        variant="contained" 
        onClick={saveCustomization}
        sx={{ mt: 3, width: '100%' }}
      >
        Save Customization
      </Button>
    </Box>
  );
};
```

---

## 🔐 Member 3: Authentication Starter

### **Auth Context Provider**

```typescript
// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    privacy: 'strict' | 'moderate' | 'open';
    avatarStyle: string;
    notificationsEnabled: boolean;
  };
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/auth/register', { email, password, name });
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<boolean> => {
    try {
      const response = await axios.put('/api/auth/preferences', preferences);
      setUser(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...preferences } } : null);
      return true;
    } catch (error) {
      console.error('Update preferences error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updatePreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **Backend Auth Routes**

```typescript
// backend/src/routes/auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple user storage (use SQLite in production)
let users: any[] = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      preferences: {
        privacy: 'moderate',
        avatarStyle: 'friendly',
        notificationsEnabled: true
      },
      createdAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    const { password: _, ...userResponse } = user;

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...userResponse } = user;
  res.json({ user: userResponse });
});

// Update user preferences
router.put('/preferences', authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.preferences = { ...user.preferences, ...req.body };
  const { password: _, ...userResponse } = user;
  res.json({ user: userResponse });
});

export default router;
```

---

## 🤖 Member 4: AI Intelligence Starter

### **Python AI Service**

```python
# ai-services/app/services/chat_service.py
from typing import List, Dict, Any
import google.generativeai as genai
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage
import re
import os

class ChatService:
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(return_messages=True)
        
        # Crisis keywords for detection
        self.crisis_keywords = [
            'suicide', 'kill myself', 'end it all', 'hurt myself',
            'self harm', 'cutting', 'depressed', 'hopeless',
            'worthless', 'nobody cares', 'better off dead'
        ]
        
    def analyze_message(self, message: str) -> Dict[str, Any]:
        """Analyze message for emotion and crisis indicators"""
        
        # Crisis detection
        crisis_level = self._detect_crisis(message)
        
        # Emotion analysis using Gemini
        emotion_prompt = f"""
        Analyze the emotion in this message and respond with just one word from:
        happy, sad, anxious, angry, neutral, excited, confused, frustrated
        
        Message: "{message}"
        
        Emotion:
        """
        
        try:
            emotion_response = self.model.generate_content(emotion_prompt)
            emotion = emotion_response.text.strip().lower()
        except:
            emotion = 'neutral'
            
        return {
            'emotion': emotion,
            'crisis_level': crisis_level,
            'confidence': 0.8  # Simplified confidence score
        }
    
    def _detect_crisis(self, message: str) -> str:
        """Detect crisis level in message"""
        message_lower = message.lower()
        
        crisis_count = sum(1 for keyword in self.crisis_keywords if keyword in message_lower)
        
        if crisis_count >= 3:
            return 'critical'
        elif crisis_count >= 2:
            return 'high'
        elif crisis_count >= 1:
            return 'medium'
        else:
            return 'low'
    
    def generate_response(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate empathetic AI response"""
        
        # Analyze the incoming message
        analysis = self.analyze_message(message)
        
        # Create context-aware prompt
        system_prompt = """
        You are a compassionate AI mental health companion for Indian youth. 
        
        Guidelines:
        - Be empathetic, supportive, and culturally sensitive
        - Use simple, warm language suitable for young people
        - If crisis indicators are detected, provide immediate support and suggest professional help
        - Acknowledge emotions and validate feelings
        - Ask follow-up questions to encourage sharing
        - Provide gentle coping strategies when appropriate
        - Keep responses under 100 words for better engagement
        
        Cultural context: You understand Indian family dynamics, academic pressure, 
        and social expectations that affect youth mental health.
        """
        
        # Crisis response override
        if analysis['crisis_level'] in ['high', 'critical']:
            response = self._generate_crisis_response(message, analysis['crisis_level'])
        else:
            # Normal empathetic response
            full_prompt = f"""
            {system_prompt}
            
            User's emotion appears to be: {analysis['emotion']}
            User said: "{message}"
            
            Respond with empathy and support:
            """
            
            try:
                gemini_response = self.model.generate_content(full_prompt)
                response = gemini_response.text.strip()
            except Exception as e:
                response = "I hear you, and I'm here to listen. Sometimes I have trouble finding the right words, but I want you to know that your feelings matter. Would you like to tell me more about what's on your mind?"
        
        # Add to conversation memory
        self.memory.chat_memory.add_user_message(message)
        self.memory.chat_memory.add_ai_message(response)
        
        return {
            'response': response,
            'emotion': analysis['emotion'],
            'crisis_level': analysis['crisis_level'],
            'confidence': analysis['confidence'],
            'recommendations': self._get_recommendations(analysis)
        }
    
    def _generate_crisis_response(self, message: str, crisis_level: str) -> str:
        """Generate immediate crisis support response"""
        
        if crisis_level == 'critical':
            return """I'm really concerned about you right now. What you're feeling is serious, and you deserve immediate support. 

Please reach out to:
🆘 National Suicide Prevention: 9152987821
🆘 Vandrevala Foundation: 9999666555

You're not alone, and there are people who want to help you through this. Can you please talk to someone you trust - a family member, friend, or counselor?"""
        
        elif crisis_level == 'high':
            return """I can hear that you're going through a really difficult time, and I'm worried about you. Your feelings are valid, but I want to make sure you have proper support.

Consider reaching out to:
📞 AASRA: 9820466726
📞 iCall: 9152987821

Is there someone in your life you could talk to about this? Sometimes sharing these heavy feelings can provide relief."""
        
        return "I notice you might be struggling with some difficult thoughts. I'm here to listen, but I also want to make sure you have the support you need. How are you feeling right now?"
    
    def _get_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Get wellness recommendations based on analysis"""
        
        recommendations = []
        emotion = analysis['emotion']
        crisis_level = analysis['crisis_level']
        
        if crisis_level != 'low':
            recommendations.append("Consider speaking with a mental health professional")
        
        if emotion == 'anxious':
            recommendations.extend([
                "Try deep breathing exercises",
                "Practice grounding techniques (5-4-3-2-1 method)",
                "Consider a short walk or gentle movement"
            ])
        elif emotion == 'sad':
            recommendations.extend([
                "Reach out to a friend or family member",
                "Try journaling about your feelings",
                "Engage in a comforting activity"
            ])
        elif emotion == 'angry':
            recommendations.extend([
                "Take some time to cool down",
                "Try physical exercise to release tension",
                "Practice expressing your feelings in a healthy way"
            ])
        
        return recommendations[:3]  # Limit to 3 recommendations
```

### **FastAPI Main Application**

```python
# ai-services/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
from app.services.chat_service import ChatService

app = FastAPI(title="Mental Health AI Service", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
chat_service = ChatService()

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    userId: str
    history: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    response: str
    emotion: str
    crisis_level: str
    confidence: float
    recommendations: List[str]

class EmotionAnalysisRequest(BaseModel):
    message: str

class EmotionAnalysisResponse(BaseModel):
    emotion: str
    crisis_level: str
    confidence: float

@app.get("/")
async def root():
    return {"message": "Mental Health AI Service is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint for AI conversations"""
    try:
        user_context = {
            "userId": request.userId,
            "history": request.history
        }
        
        result = chat_service.generate_response(request.message, user_context)
        
        return ChatResponse(
            response=result['response'],
            emotion=result['emotion'],
            crisis_level=result['crisis_level'],
            confidence=result['confidence'],
            recommendations=result['recommendations']
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/analyze", response_model=EmotionAnalysisResponse)
async def analyze_emotion(request: EmotionAnalysisRequest):
    """Analyze emotion and crisis level in a message"""
    try:
        analysis = chat_service.analyze_message(request.message)
        
        return EmotionAnalysisResponse(
            emotion=analysis['emotion'],
            crisis_level=analysis['crisis_level'],
            confidence=analysis['confidence']
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Mental Health AI"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
```

---

## 🌟 Member 5: Wellness Features Starter

### **Mood Tracking Component**

```typescript
// frontend/src/components/Wellness/MoodTracker.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Slider, 
  Paper,
  Grid,
  IconButton,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied
} from '@mui/icons-material';

interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 1-10 scale
  tags: string[];
  notes?: string;
}

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄'];
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Good', 'Happy', 'Very Happy'];

export const MoodTracker: React.FC = () => {
  const [currentMood, setCurrentMood] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  const moodTags = [
    'anxious', 'stressed', 'tired', 'motivated', 'grateful', 
    'lonely', 'excited', 'overwhelmed', 'peaceful', 'productive'
  ];

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = () => {
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      const history = JSON.parse(saved).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setMoodHistory(history);
    }
  };

  const saveMoodEntry = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood: currentMood,
      tags: selectedTags,
    };

    const updatedHistory = [newEntry, ...moodHistory].slice(0, 30); // Keep last 30 entries
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));

    // Show progress animation
    setShowProgress(true);
    setTimeout(() => setShowProgress(false), 2000);

    // Reset form
    setCurrentMood(5);
    setSelectedTags([]);

    // Trigger avatar celebration for mood tracking
    if ((window as any).avatarAPI) {
      (window as any).avatarAPI.celebrateAchievement();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getMoodIcon = (mood: number) => {
    if (mood <= 2) return <SentimentVeryDissatisfied />;
    if (mood <= 4) return <SentimentDissatisfied />;
    if (mood <= 6) return <SentimentNeutral />;
    if (mood <= 8) return <SentimentSatisfied />;
    return <SentimentVerySatisfied />;
  };

  const getWeeklyAverage = () => {
    const lastWeek = moodHistory.slice(0, 7);
    if (lastWeek.length === 0) return 0;
    return lastWeek.reduce((sum, entry) => sum + entry.mood, 0) / lastWeek.length;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        How are you feeling today?
      </Typography>

      {/* Current Mood Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: '4rem' }}>
            {moodEmojis[Math.min(Math.floor((currentMood - 1) / 2), 5)]}
          </Typography>
          <Typography variant="h6">
            {moodLabels[Math.min(Math.floor((currentMood - 1) / 2), 5)]}
          </Typography>
        </Box>

        <Slider
          value={currentMood}
          onChange={(e, value) => setCurrentMood(value as number)}
          min={1}
          max={10}
          step={1}
          marks
          sx={{ mb: 3 }}
        />

        {/* Mood Tags */}
        <Typography variant="subtitle1" gutterBottom>
          What's contributing to this feeling?
        </Typography>
        <Box sx={{ mb: 3 }}>
          {moodTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              clickable
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              onClick={() => toggleTag(tag)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>

        <Button 
          variant="contained" 
          onClick={saveMoodEntry}
          fullWidth
          disabled={showProgress}
        >
          {showProgress ? 'Saving...' : 'Log Mood'}
        </Button>

        {showProgress && (
          <LinearProgress sx={{ mt: 2 }} />
        )}
      </Paper>

      {/* Mood Insights */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Wellness Journey
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {moodHistory.length}
              </Typography>
              <Typography variant="body2">
                Days Tracked
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {getWeeklyAverage().toFixed(1)}
              </Typography>
              <Typography variant="body2">
                Weekly Average
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Recent Entries */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
          Recent Entries
        </Typography>
        {moodHistory.slice(0, 5).map((entry) => (
          <Box key={entry.id} sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            borderBottom: '1px solid #eee'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getMoodIcon(entry.mood)}
              <Typography sx={{ ml: 1 }}>
                {entry.date.toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {entry.mood}/10
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};
```

### **Crisis Intervention Component**

```typescript
// frontend/src/components/Wellness/CrisisSupport.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Phone, Message, LocalHospital, Person } from '@mui/icons-material';

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  available: string;
  type: 'hotline' | 'professional' | 'emergency';
}

const crisisResources: CrisisResource[] = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "9152987821",
    description: "24/7 crisis support and suicide prevention",
    available: "24/7",
    type: "hotline"
  },
  {
    name: "Vandrevala Foundation",
    phone: "9999666555",
    description: "Mental health support and crisis intervention",
    available: "24/7",
    type: "hotline"
  },
  {
    name: "AASRA",
    phone: "9820466726",
    description: "Suicide prevention and emotional support",
    available: "24/7",
    type: "hotline"
  },
  {
    name: "iCall",
    phone: "9152987821",
    description: "Psycho-social helpline by TISS",
    available: "8 AM - 10 PM",
    type: "professional"
  }
];

interface CrisisSupportProps {
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  show?: boolean;
}

export const CrisisSupport: React.FC<CrisisSupportProps> = ({ 
  crisisLevel = 'medium', 
  show = false 
}) => {
  const [showDialog, setShowDialog] = useState(show);
  const [selectedResource, setSelectedResource] = useState<CrisisResource | null>(null);

  useEffect(() => {
    setShowDialog(show);
  }, [show]);

  const handleCall = (phone: string) => {
    if (typeof window !== 'undefined') {
      window.open(`tel:${phone}`);
    }
  };

  const getCrisisMessage = () => {
    switch (crisisLevel) {
      case 'critical':
        return {
          title: "🚨 Immediate Support Needed",
          message: "I'm very concerned about you right now. Please reach out for immediate help.",
          severity: "error" as const
        };
      case 'high':
        return {
          title: "⚠️ You Need Support",
          message: "It sounds like you're going through a difficult time. Consider reaching out to someone.",
          severity: "warning" as const
        };
      case 'medium':
        return {
          title: "💙 Support Available",
          message: "If you're struggling, know that help is available and you're not alone.",
          severity: "info" as const
        };
      default:
        return {
          title: "🌟 Wellness Resources",
          message: "Here are some helpful resources for your mental health journey.",
          severity: "info" as const
        };
    }
  };

  const crisisInfo = getCrisisMessage();

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Alert severity={crisisInfo.severity} sx={{ mb: 3 }}>
          <Typography variant="h6">{crisisInfo.title}</Typography>
          <Typography>{crisisInfo.message}</Typography>
        </Alert>

        <Typography variant="h6" gutterBottom>
          Crisis Support Resources
        </Typography>

        {crisisResources.map((resource, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {resource.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {resource.description}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={resource.available}
                    color={resource.available.includes('24/7') ? 'success' : 'primary'}
                  />
                </Box>
                <Button
                  variant="contained"
                  color={crisisLevel === 'critical' ? 'error' : 'primary'}
                  startIcon={<Phone />}
                  onClick={() => handleCall(resource.phone)}
                  sx={{ ml: 2 }}
                >
                  Call Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}

        {crisisLevel === 'critical' && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>If this is a medical emergency, call 108 (Emergency Services) immediately.</strong>
            </Typography>
            <Typography variant="body2">
              You can also go to your nearest hospital emergency room or call a trusted friend or family member to stay with you.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Emergency Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{crisisInfo.title}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {crisisInfo.message}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Would you like to reach out to someone right now?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Not Right Now
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleCall(crisisResources[0].phone)}
            color="primary"
          >
            Call Support Line
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
```

---

## 🚀 Quick Integration Setup

### **To get started immediately:**

1. **Copy the relevant starter code** for your assigned feature
2. **Replace placeholder files** in your project structure
3. **Install required dependencies** listed in your package.json/requirements.txt
4. **Test your feature locally** before integrating
5. **Use the APIs provided** to communicate with other features

### **Common imports you'll need:**

```bash
# Frontend
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install socket.io-client axios

# Backend
npm install express socket.io cors
npm install jsonwebtoken bcryptjs

# Python AI
pip install fastapi uvicorn google-generativeai langchain
```

### **Environment Variables:**

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
DB_CONNECTION_STRING=your_db_string
```

Start with these templates and customize based on your feature requirements! 🎯
