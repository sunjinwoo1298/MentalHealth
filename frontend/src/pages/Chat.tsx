import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Send,
  Settings,
  Psychology,
  School,
  People,
  MoreVert,
  Refresh,
  VolumeUp,
  VolumeMute,
  Info
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

// Message types
interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: number
  emotion?: string
  avatarEmotion?: string
  context?: string
}

// Context types
const SUPPORT_CONTEXTS = [
  { id: 'general', label: 'General Support', icon: <Psychology />, color: '#3B82F6' },
  { id: 'academic', label: 'Academic Support', icon: <School />, color: '#10B981' },
  { id: 'family', label: 'Family Support', icon: <People />, color: '#F59E0B' }
]

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedContext, setSelectedContext] = useState('general')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [currentPreferences, setCurrentPreferences] = useState<any>(null)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  // Load chat history and preferences
  useEffect(() => {
    const loadChatData = async () => {
      try {
        // Load preferences first
        const prefsResponse = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const prefsData = await prefsResponse.json()
        setCurrentPreferences(prefsData)
        setSelectedContext(prefsData.preferredSupportContext || 'general')
        
        // Load chat history
        const response = await fetch('/api/chat/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Failed to load chat data:', error)
      }
    }

    loadChatData()
  }, [])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    const tempId = Date.now().toString()
    const userMessage: Message = {
      id: tempId,
      content: newMessage,
      sender: 'user',
      timestamp: Date.now(),
      context: selectedContext
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: newMessage,
          userId: user?.id,
          context: selectedContext
        })
      })

      const data = await response.json()
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: Date.now(),
        emotion: data.emotional_context?.[0],
        avatarEmotion: data.avatar_emotion,
        context: selectedContext
      }

      setMessages(prev => [...prev, aiMessage])

      // Generate voice if enabled
      if (voiceEnabled && data.response) {
        try {
          const ttsResponse = await fetch('/api/audio/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              text: data.response,
              emotion: data.avatar_emotion,
              voice: currentPreferences?.voicePreference || 'female'
            })
          })

          if (ttsResponse.ok) {
            const audioBlob = await ttsResponse.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            audio.play()
          }
        } catch (error) {
          console.error('TTS failed:', error)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContextChange = (context: string) => {
    setSelectedContext(context)
    setContextMenuAnchor(null)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const getContextColor = (contextId: string) => {
    return SUPPORT_CONTEXTS.find(c => c.id === contextId)?.color || '#3B82F6'
  }

  const getAvatarEmoji = (emotion: string = 'neutral') => {
    const emojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😔',
      concerned: '🤔',
      supportive: '🤗',
      excited: '😃',
      neutral: '😌'
    }
    return emojis[emotion] || '😌'
  }

  return (
    <Container maxWidth="lg" className="min-h-screen py-4">
      {/* Chat Header */}
      <Paper className="p-4 mb-4 bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {SUPPORT_CONTEXTS.map(context => (
              <Tooltip key={context.id} title={context.label}>
                <Chip
                  icon={context.icon}
                  label={context.label}
                  onClick={() => handleContextChange(context.id)}
                  className={`${
                    selectedContext === context.id
                      ? 'bg-gradient-to-r from-pink-500 to-teal-500 text-white'
                      : 'bg-slate-700/50 text-gray-300'
                  }`}
                />
              </Tooltip>
            ))}

            <IconButton onClick={() => setInfoDialogOpen(true)}>
              <Info className="text-gray-400" />
            </IconButton>
          </div>

          <div className="flex gap-2">
            <IconButton onClick={() => setVoiceEnabled(!voiceEnabled)}>
              {voiceEnabled ? (
                <VolumeUp className="text-teal-400" />
              ) : (
                <VolumeMute className="text-gray-400" />
              )}
            </IconButton>

            <IconButton onClick={(e) => setContextMenuAnchor(e.currentTarget)}>
              <MoreVert className="text-gray-400" />
            </IconButton>
          </div>
        </div>

        {/* Active context bar */}
        <Box className="mt-3 px-4 py-2 bg-slate-700/30 rounded-lg">
          <Typography variant="body2" className="text-gray-400">
            Active Support Context: {' '}
            <span className="font-medium" style={{ color: getContextColor(selectedContext) }}>
              {SUPPORT_CONTEXTS.find(c => c.id === selectedContext)?.label}
            </span>
            {currentPreferences && (
              <>
                {' '} • Style: {currentPreferences.communicationStyle}
                {' '} • Language: {currentPreferences.language === 'en' ? 'English' : 'हिन्दी'}
              </>
            )}
          </Typography>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Paper className="p-4 mb-4 bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-2xl min-h-[60vh] max-h-[60vh] overflow-y-auto">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <Avatar
                  sx={{
                    bgcolor: getContextColor(message.context || 'general'),
                    width: 40,
                    height: 40
                  }}
                >
                  {getAvatarEmoji(message.avatarEmotion)}
                </Avatar>
              )}

              <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                <Paper
                  className={`p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-teal-500'
                      : 'bg-slate-700/50'
                  }`}
                >
                  <Typography className="text-white whitespace-pre-wrap">
                    {message.content}
                  </Typography>
                </Paper>
                {message.emotion && (
                  <Typography variant="caption" className="text-gray-400 mt-1">
                    {message.emotion}
                  </Typography>
                )}
              </div>

              {message.sender === 'user' && (
                <Avatar
                  src={user?.photoURL || undefined}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.displayName?.[0] || 'U'}
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start gap-3 mb-4">
            <Avatar
              sx={{
                bgcolor: getContextColor(selectedContext),
                width: 40,
                height: 40
              }}
            >
              <CircularProgress size={24} color="inherit" />
            </Avatar>
            <Paper className="p-3 bg-slate-700/50">
              <Typography className="text-gray-400">Thinking...</Typography>
            </Paper>
          </div>
        )}
      </Paper>

      {/* Input Area */}
      <Paper className="p-4 bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-2xl">
        <div className="flex gap-3">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message MindCare AI in ${selectedContext} context...`}
            className="bg-slate-700/30 rounded-lg"
            InputProps={{
              className: 'text-white',
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!newMessage.trim() || loading}
            className={`h-[56px] w-[56px] ${
              newMessage.trim() && !loading
                ? 'bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600'
                : 'bg-slate-700/50'
            }`}
          >
            <Send className="text-white" />
          </IconButton>
        </div>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setContextMenuAnchor(null); setMessages([]); }}>
          <Refresh className="mr-2" /> Clear Chat
        </MenuItem>
        <MenuItem onClick={() => { setContextMenuAnchor(null); window.location.href = '/preferences'; }}>
          <Settings className="mr-2" /> Preferences
        </MenuItem>
      </Menu>

      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chat Context Information</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your chat is currently personalized with:
          </Typography>
          {currentPreferences && (
            <Box className="space-y-2 mt-3">
              <Paper className="p-3 bg-slate-700/30">
                <Typography variant="subtitle2" className="text-gray-300">Communication Style</Typography>
                <Typography>{currentPreferences.communicationStyle}</Typography>
              </Paper>
              
              <Paper className="p-3 bg-slate-700/30">
                <Typography variant="subtitle2" className="text-gray-300">Support Context</Typography>
                <Typography>{SUPPORT_CONTEXTS.find(c => c.id === selectedContext)?.label}</Typography>
              </Paper>
              
              <Paper className="p-3 bg-slate-700/30">
                <Typography variant="subtitle2" className="text-gray-300">Language Preference</Typography>
                <Typography>{currentPreferences.language === 'en' ? 'English' : 'हिन्दी'}</Typography>
              </Paper>

              <Paper className="p-3 bg-slate-700/30">
                <Typography variant="subtitle2" className="text-gray-300">Voice Output</Typography>
                <Typography>{voiceEnabled ? 'Enabled' : 'Disabled'}</Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => { setInfoDialogOpen(false); window.location.href = '/preferences'; }}
            variant="contained"
            className="bg-gradient-to-r from-pink-500 to-teal-500"
          >
            Edit Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}