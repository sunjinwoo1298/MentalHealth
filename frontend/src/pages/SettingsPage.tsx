import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Slide,
  Zoom,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  ArrowBack as ArrowBackIcon,
  Accessibility as AccessibilityIcon,
  Language as LanguageIcon,
  VolumeUp as SoundIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  PrivacyTip as PrivacyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation/Navigation';

interface AppSettings {
  notifications: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    emergencyAlerts: boolean;
    chatReminders: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: 'en' | 'hi' | 'ta' | 'te';
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    usage: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceAnimations: boolean;
    screenReader: boolean;
  };
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      dailyReminders: true,
      weeklyProgress: true,
      emergencyAlerts: true,
      chatReminders: false,
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      language: 'en',
    },
    privacy: {
      analytics: false,
      crashReports: true,
      usage: false,
    },
    accessibility: {
      highContrast: false,
      reduceAnimations: false,
      screenReader: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [isAuthenticated, navigate]);

  const handleSettingChange = (category: keyof AppSettings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage for now (in production, save to backend)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      notifications: {
        dailyReminders: true,
        weeklyProgress: true,
        emergencyAlerts: true,
        chatReminders: false,
      },
      display: {
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
      },
      privacy: {
        analytics: false,
        crashReports: true,
        usage: false,
      },
      accessibility: {
        highContrast: false,
        reduceAnimations: false,
        screenReader: false,
      },
    });
    setMessage('Settings reset to defaults');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-30"></div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <Container maxWidth="md">
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 3,
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(-4px)'
                  },
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  px: 2,
                  py: 1
                }}
              >
                Back to Dashboard
              </Button>
              
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold"
                sx={{
                  color: 'white',
                  mb: 2,
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                ⚙️ Settings
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 400
                }}
              >
                Customize your wellness experience
              </Typography>
            </Box>
          </Fade>

          {/* Success/Error Messages */}
          {message && (
            <Fade in timeout={600}>
              <Alert 
                severity={message.includes('Failed') ? 'error' : 'success'} 
                sx={{ 
                  mb: 4,
                  bgcolor: message.includes('Failed') 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(34, 197, 94, 0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { 
                    color: message.includes('Failed') ? '#ef4444' : '#22c55e' 
                  },
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${message.includes('Failed') 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : 'rgba(34, 197, 94, 0.2)'}`,
                  borderRadius: '16px'
                }}
              >
                {message}
              </Alert>
            </Fade>
          )}

          <div className="space-y-8">
            {/* Notifications Settings */}
            <Slide in direction="left" timeout={1000}>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30 shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <NotificationsIcon sx={{ color: '#06b6d4', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Notifications
                  </Typography>
                  <Chip 
                    label="Essential" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(6, 182, 212, 0.2)',
                      color: '#06b6d4',
                      border: '1px solid rgba(6, 182, 212, 0.3)'
                    }} 
                  />
                </Box>
                
                <div className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.dailyReminders}
                        onChange={(e) => handleSettingChange('notifications', 'dailyReminders', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Daily wellness reminders
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Get gentle reminders to check in with yourself
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.weeklyProgress}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyProgress', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Weekly progress reports
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          See your wellness journey summary every week
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emergencyAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'emergencyAlerts', e.target.checked)}
                        disabled
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#ef4444',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#ef4444',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Emergency alerts 🚨
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Critical safety notifications (cannot be disabled)
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.chatReminders}
                        onChange={(e) => handleSettingChange('notifications', 'chatReminders', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Chat session reminders
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Reminders for scheduled therapy sessions
                        </Typography>
                      </Box>
                    }
                  />
                </div>
              </div>
            </Slide>

            {/* Display & Language Settings */}
            <Slide in direction="right" timeout={1200}>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-400/30 shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <ThemeIcon sx={{ color: '#a855f7', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Display & Language
                  </Typography>
                  <Chip 
                    label="Personalization" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(168, 85, 247, 0.2)',
                      color: '#a855f7',
                      border: '1px solid rgba(168, 85, 247, 0.3)'
                    }} 
                  />
                </Box>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#a855f7' }
                      }}
                    >
                      Theme
                    </InputLabel>
                    <Select
                      value={settings.display.theme}
                      label="Theme"
                      onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a855f7',
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                        backdropFilter: 'blur(10px)',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px'
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '& .MuiMenuItem-root': {
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(168, 85, 247, 0.1)'
                              }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="light">☀️ Light</MenuItem>
                      <MenuItem value="dark">🌙 Dark</MenuItem>
                      <MenuItem value="auto">🔄 Auto</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#a855f7' }
                      }}
                    >
                      Font Size
                    </InputLabel>
                    <Select
                      value={settings.display.fontSize}
                      label="Font Size"
                      onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a855f7',
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                        backdropFilter: 'blur(10px)',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px'
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '& .MuiMenuItem-root': {
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(168, 85, 247, 0.1)'
                              }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="small">🔍 Small</MenuItem>
                      <MenuItem value="medium">📝 Medium</MenuItem>
                      <MenuItem value="large">🔍 Large</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#a855f7' }
                      }}
                    >
                      Language
                    </InputLabel>
                    <Select
                      value={settings.display.language}
                      label="Language"
                      onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a855f7',
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                        backdropFilter: 'blur(10px)',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px'
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '& .MuiMenuItem-root': {
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(168, 85, 247, 0.1)'
                              }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="en">🇺🇸 English</MenuItem>
                      <MenuItem value="hi">🇮🇳 हिंदी (Hindi)</MenuItem>
                      <MenuItem value="ta">🇮🇳 தமிழ் (Tamil)</MenuItem>
                      <MenuItem value="te">🇮🇳 తెలుగు (Telugu)</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </Slide>

            {/* Privacy & Data Settings */}
            <Slide in direction="left" timeout={1400}>
              <div className="bg-gradient-to-br from-teal-500/20 to-green-600/20 backdrop-blur-md rounded-3xl p-8 border border-teal-400/30 shadow-xl hover:shadow-teal-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <SecurityIcon sx={{ color: '#14b8a6', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Privacy & Data
                  </Typography>
                  <Chip 
                    label="Protected" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(20, 184, 166, 0.2)',
                      color: '#14b8a6',
                      border: '1px solid rgba(20, 184, 166, 0.3)'
                    }} 
                  />
                </Box>
                
                <div className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.analytics}
                        onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#14b8a6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#14b8a6',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Share anonymous analytics
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Help improve the app with anonymous usage data
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.crashReports}
                        onChange={(e) => handleSettingChange('privacy', 'crashReports', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#14b8a6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#14b8a6',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Send crash reports
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Help us fix bugs and improve stability
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.usage}
                        onChange={(e) => handleSettingChange('privacy', 'usage', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#14b8a6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#14b8a6',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Share usage patterns for research
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Contribute to mental health research (anonymized)
                        </Typography>
                      </Box>
                    }
                  />
                </div>
                
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/privacy')}
                    startIcon={<PrivacyIcon />}
                    sx={{
                      borderColor: 'rgba(20, 184, 166, 0.5)',
                      color: '#14b8a6',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)'
                      }
                    }}
                  >
                    Manage Privacy Settings
                  </Button>
                </Box>
              </div>
            </Slide>

            {/* Accessibility Settings */}
            <Slide in direction="right" timeout={1600}>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-3xl p-8 border border-orange-400/30 shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-[1.02]">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <AccessibilityIcon sx={{ color: '#f97316', fontSize: '2rem' }} />
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: 'white' }}
                  >
                    Accessibility
                  </Typography>
                  <Chip 
                    label="Inclusive" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(249, 115, 22, 0.2)',
                      color: '#f97316',
                      border: '1px solid rgba(249, 115, 22, 0.3)'
                    }} 
                  />
                </Box>
                
                <div className="space-y-4">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.accessibility.highContrast}
                        onChange={(e) => handleSettingChange('accessibility', 'highContrast', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          High contrast mode
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Enhanced visibility for better readability
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.accessibility.reduceAnimations}
                        onChange={(e) => handleSettingChange('accessibility', 'reduceAnimations', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Reduce animations
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Minimize motion for sensitive users
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.accessibility.screenReader}
                        onChange={(e) => handleSettingChange('accessibility', 'screenReader', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>
                          Screen reader optimizations
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Enhanced compatibility with assistive technology
                        </Typography>
                      </Box>
                    }
                  />
                </div>
              </div>
            </Slide>

            {/* Action Buttons */}
            <Zoom in timeout={1800}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', pt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleResetSettings}
                  disabled={loading}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    py: 1.5,
                    px: 4,
                    borderRadius: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={loading}
                  startIcon={<CheckIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    py: 1.5,
                    px: 4,
                    borderRadius: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(34, 197, 94, 0.4)'
                    },
                    '&:disabled': {
                      opacity: 0.6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Zoom>
          </div>
        </Container>
      </div>
    </div>
  );
}