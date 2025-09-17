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
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard')} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('Failed') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Notifications Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Notifications
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.dailyReminders}
                  onChange={(e) => handleSettingChange('notifications', 'dailyReminders', e.target.checked)}
                />
              }
              label="Daily wellness reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.weeklyProgress}
                  onChange={(e) => handleSettingChange('notifications', 'weeklyProgress', e.target.checked)}
                />
              }
              label="Weekly progress reports"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.emergencyAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'emergencyAlerts', e.target.checked)}
                />
              }
              label="Emergency alerts (cannot be disabled)"
              disabled
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.chatReminders}
                  onChange={(e) => handleSettingChange('notifications', 'chatReminders', e.target.checked)}
                />
              }
              label="Chat session reminders"
            />
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ThemeIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Display & Language
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.display.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={settings.display.fontSize}
                  label="Font Size"
                  onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.display.language}
                  label="Language"
                  onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
                  <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                  <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Privacy & Data
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.privacy.analytics}
                  onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                />
              }
              label="Share anonymous analytics to improve the app"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.privacy.crashReports}
                  onChange={(e) => handleSettingChange('privacy', 'crashReports', e.target.checked)}
                />
              }
              label="Send crash reports to help fix bugs"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.privacy.usage}
                  onChange={(e) => handleSettingChange('privacy', 'usage', e.target.checked)}
                />
              }
              label="Share usage patterns for research"
            />
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/privacy')}
                size="small"
              >
                Manage Privacy Settings
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Accessibility
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.accessibility.highContrast}
                  onChange={(e) => handleSettingChange('accessibility', 'highContrast', e.target.checked)}
                />
              }
              label="High contrast mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.accessibility.reduceAnimations}
                  onChange={(e) => handleSettingChange('accessibility', 'reduceAnimations', e.target.checked)}
                />
              }
              label="Reduce animations"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.accessibility.screenReader}
                  onChange={(e) => handleSettingChange('accessibility', 'screenReader', e.target.checked)}
                />
              }
              label="Screen reader optimizations"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleResetSettings}
            disabled={loading}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </div>
    </Container>
  );
}