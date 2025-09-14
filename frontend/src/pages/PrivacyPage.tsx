import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Switch,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Grid,
  FormControlLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Shield, Lock, Delete, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface PrivacySettings {
  dataSharing: {
    anonymousResearch: boolean;
    improvementAnalytics: boolean;
    thirdPartyIntegrations: boolean;
  };
  visibility: {
    profileVisibility: 'private' | 'limited' | 'public';
    journalVisibility: 'private' | 'therapist' | 'support';
    progressSharing: boolean;
  };
  notifications: {
    reminderNotifications: boolean;
    supportNotifications: boolean;
    progressNotifications: boolean;
    crisisAlerts: boolean;
  };
  dataRetention: {
    autoDelete: boolean;
    retentionPeriod: number; // months
  };
  encryption: {
    doubleEncryption: boolean;
    localStorageEncryption: boolean;
  };
}

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: {
      anonymousResearch: false,
      improvementAnalytics: true,
      thirdPartyIntegrations: false,
    },
    visibility: {
      profileVisibility: 'private',
      journalVisibility: 'private',
      progressSharing: false,
    },
    notifications: {
      reminderNotifications: true,
      supportNotifications: true,
      progressNotifications: true,
      crisisAlerts: true,
    },
    dataRetention: {
      autoDelete: false,
      retentionPeriod: 12,
    },
    encryption: {
      doubleEncryption: true,
      localStorageEncryption: true,
    }
  });

  useEffect(() => {
    loadPrivacySettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/privacy-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.settings) {
        setSettings(data.data.settings);
      }
    } catch (err) {
      setError('Failed to load privacy settings');
      console.error('Load privacy settings error:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const updateSetting = (section: keyof PrivacySettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Privacy settings updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update privacy settings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update privacy settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/export-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mental-health-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Data exported successfully!');
      } else {
        setError('Failed to export data');
      }
    } catch (err) {
      setError('Failed to export data');
      console.error('Export data error:', err);
    }
    setExportDialogOpen(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('Failed to delete account');
      console.error('Delete account error:', err);
    }
    setDeleteDialogOpen(false);
  };

  if (loadingSettings) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Shield sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" color="primary">
              Privacy & Security Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="textSecondary">
            Control how your mental health data is shared, stored, and protected. Your privacy is our priority.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Data Sharing Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Sharing Preferences
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Choose how your anonymized data may be used to improve mental health services.
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Anonymous Research Participation"
                      secondary="Allow anonymized data to contribute to mental health research"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.dataSharing.anonymousResearch}
                        onChange={(e) => updateSetting('dataSharing', 'anonymousResearch', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Service Improvement Analytics"
                      secondary="Help us improve our platform with usage analytics"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.dataSharing.improvementAnalytics}
                        onChange={(e) => updateSetting('dataSharing', 'improvementAnalytics', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Third-Party Integrations"
                      secondary="Allow integration with approved mental health apps and services"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.dataSharing.thirdPartyIntegrations}
                        onChange={(e) => updateSetting('dataSharing', 'thirdPartyIntegrations', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Visibility Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visibility & Access Control
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Control who can see your profile and mental health information.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Profile Visibility</InputLabel>
                      <Select
                        value={settings.visibility.profileVisibility}
                        onChange={(e) => updateSetting('visibility', 'profileVisibility', e.target.value)}
                        label="Profile Visibility"
                      >
                        <MenuItem value="private">Private (Only You)</MenuItem>
                        <MenuItem value="limited">Limited (Healthcare Providers)</MenuItem>
                        <MenuItem value="public">Public (Support Community)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Journal Visibility</InputLabel>
                      <Select
                        value={settings.visibility.journalVisibility}
                        onChange={(e) => updateSetting('visibility', 'journalVisibility', e.target.value)}
                        label="Journal Visibility"
                      >
                        <MenuItem value="private">Private (Only You)</MenuItem>
                        <MenuItem value="therapist">Therapist Access</MenuItem>
                        <MenuItem value="support">Support Network</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.visibility.progressSharing}
                      onChange={(e) => updateSetting('visibility', 'progressSharing', e.target.checked)}
                    />
                  }
                  label="Share progress updates with support network"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Choose which notifications you'd like to receive.
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Reminder Notifications"
                      secondary="Daily check-ins, medication reminders, self-care prompts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.reminderNotifications}
                        onChange={(e) => updateSetting('notifications', 'reminderNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Support Notifications"
                      secondary="Messages from support network and community updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.supportNotifications}
                        onChange={(e) => updateSetting('notifications', 'supportNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Progress Notifications"
                      secondary="Weekly progress summaries and milestone achievements"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.progressNotifications}
                        onChange={(e) => updateSetting('notifications', 'progressNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Crisis Alert System"
                      secondary="Emergency notifications to your crisis support contacts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.crisisAlerts}
                        onChange={(e) => updateSetting('notifications', 'crisisAlerts', e.target.checked)}
                        color="error"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lock sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Security & Encryption
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Advanced security options for maximum data protection.
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Double Encryption"
                      secondary="Extra layer of encryption for sensitive mental health data"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.encryption.doubleEncryption}
                        onChange={(e) => updateSetting('encryption', 'doubleEncryption', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Local Storage Encryption"
                      secondary="Encrypt data stored on your device"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.encryption.localStorageEncryption}
                        onChange={(e) => updateSetting('encryption', 'localStorageEncryption', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.dataRetention.autoDelete}
                          onChange={(e) => updateSetting('dataRetention', 'autoDelete', e.target.checked)}
                        />
                      }
                      label="Auto-delete old data"
                    />
                  </Grid>
                  
                  {settings.dataRetention.autoDelete && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Retention Period</InputLabel>
                        <Select
                          value={settings.dataRetention.retentionPeriod}
                          onChange={(e) => updateSetting('dataRetention', 'retentionPeriod', e.target.value)}
                          label="Retention Period"
                        >
                          <MenuItem value={6}>6 months</MenuItem>
                          <MenuItem value={12}>1 year</MenuItem>
                          <MenuItem value={24}>2 years</MenuItem>
                          <MenuItem value={36}>3 years</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Data Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Data Management
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Export or delete your data. These actions cannot be undone.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      fullWidth
                      onClick={() => setExportDialogOpen(true)}
                    >
                      Export My Data
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      fullWidth
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : (
                  'Save Privacy Settings'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Export Data Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Export Your Data</DialogTitle>
          <DialogContent>
            <Typography>
              This will download all your data including profile information, journal entries, 
              mood tracking, and chat history in a secure JSON format.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleExportData} variant="contained">
              Download Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle color="error.main">Delete Account</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to permanently delete your account? 
              This action cannot be undone and will remove all your data, including:
            </Typography>
            <Box component="ul" sx={{ mt: 1 }}>
              <li>Profile and personal information</li>
              <li>Journal entries and mood tracking</li>
              <li>Chat history and AI conversations</li>
              <li>Privacy settings and preferences</li>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error" variant="contained">
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PrivacyPage;