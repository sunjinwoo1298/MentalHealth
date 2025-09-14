import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  mentalHealthGoals: string[];
  stressTriggers: string[];
  preferredCopingMethods: string[];
  therapyHistory: string;
  medicationInfo: string;
  crisisPlan: string;
  supportNetwork: string[];
  wellnessPreferences: any;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>({
    mentalHealthGoals: [],
    stressTriggers: [],
    preferredCopingMethods: [],
    therapyHistory: '',
    medicationInfo: '',
    crisisPlan: '',
    supportNetwork: [],
    wellnessPreferences: {}
  });

  const [newGoal, setNewGoal] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newCopingMethod, setNewCopingMethod] = useState('');
  const [newSupportContact, setNewSupportContact] = useState('');

  const mentalHealthGoalOptions = [
    'Reduce Anxiety',
    'Manage Depression',
    'Improve Sleep',
    'Build Confidence',
    'Stress Management',
    'Better Relationships',
    'Emotional Regulation',
    'Mindfulness Practice',
    'Work-Life Balance',
    'Self-Care Routine'
  ];

  const copingMethodOptions = [
    'Deep Breathing',
    'Meditation',
    'Exercise',
    'Journaling',
    'Music Therapy',
    'Art Therapy',
    'Talking to Friends',
    'Professional Therapy',
    'Nature Walks',
    'Reading',
    'Yoga',
    'Progressive Muscle Relaxation'
  ];

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.profile) {
        setProfile({
          mentalHealthGoals: data.data.profile.mental_health_goals || [],
          stressTriggers: data.data.profile.stress_triggers || [],
          preferredCopingMethods: data.data.profile.preferred_coping_methods || [],
          therapyHistory: data.data.profile.therapy_history || '',
          medicationInfo: data.data.profile.medication_info || '',
          crisisPlan: data.data.profile.crisis_plan || '',
          supportNetwork: data.data.profile.support_network || [],
          wellnessPreferences: data.data.profile.wellness_preferences || {}
        });
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Load profile error:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: 'mentalHealthGoals' | 'stressTriggers' | 'preferredCopingMethods' | 'supportNetwork', value: string) => {
    if (value.trim() && !profile[field].includes(value.trim())) {
      setProfile(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeItem = (field: 'mentalHealthGoals' | 'stressTriggers' | 'preferredCopingMethods' | 'supportNetwork', value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
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
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Your Mental Health Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Personalize your experience by sharing what matters most to your mental wellness journey.
            All information is encrypted and confidential.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Mental Health Goals */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mental Health Goals
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    What would you like to focus on in your mental wellness journey?
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Add Goal</InputLabel>
                      <Select
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        label="Add Goal"
                      >
                        {mentalHealthGoalOptions
                          .filter(option => !profile.mentalHealthGoals.includes(option))
                          .map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (newGoal) {
                          addItem('mentalHealthGoals', newGoal);
                          setNewGoal('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.mentalHealthGoals.map((goal, index) => (
                      <Chip
                        key={index}
                        label={goal}
                        onDelete={() => removeItem('mentalHealthGoals', goal)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Stress Triggers */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stress Triggers
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    What situations or factors tend to increase your stress?
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Stress Trigger"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTrigger) {
                            addItem('stressTriggers', newTrigger);
                            setNewTrigger('');
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (newTrigger) {
                          addItem('stressTriggers', newTrigger);
                          setNewTrigger('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.stressTriggers.map((trigger, index) => (
                      <Chip
                        key={index}
                        label={trigger}
                        onDelete={() => removeItem('stressTriggers', trigger)}
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Coping Methods */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preferred Coping Methods
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    What helps you manage stress and feel better?
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Add Coping Method</InputLabel>
                      <Select
                        value={newCopingMethod}
                        onChange={(e) => setNewCopingMethod(e.target.value)}
                        label="Add Coping Method"
                      >
                        {copingMethodOptions
                          .filter(option => !profile.preferredCopingMethods.includes(option))
                          .map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (newCopingMethod) {
                          addItem('preferredCopingMethods', newCopingMethod);
                          setNewCopingMethod('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.preferredCopingMethods.map((method, index) => (
                      <Chip
                        key={index}
                        label={method}
                        onDelete={() => removeItem('preferredCopingMethods', method)}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sensitive Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Confidential Health Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    This information is encrypted and only visible to you and authorized healthcare providers.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Therapy History"
                        multiline
                        rows={3}
                        value={profile.therapyHistory}
                        onChange={(e) => handleInputChange('therapyHistory', e.target.value)}
                        helperText="Previous therapy experiences, what worked, what didn't"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Medications"
                        multiline
                        rows={2}
                        value={profile.medicationInfo}
                        onChange={(e) => handleInputChange('medicationInfo', e.target.value)}
                        helperText="Mental health medications you're currently taking"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Crisis Support Plan"
                        multiline
                        rows={3}
                        value={profile.crisisPlan}
                        onChange={(e) => handleInputChange('crisisPlan', e.target.value)}
                        helperText="What to do when you need immediate support"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Support Network */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Support Network
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    People you can reach out to for support (names, relationships, contact info)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add Support Contact"
                      value={newSupportContact}
                      onChange={(e) => setNewSupportContact(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSupportContact) {
                            addItem('supportNetwork', newSupportContact);
                            setNewSupportContact('');
                          }
                        }
                      }}
                      placeholder="e.g., Mom - 555-1234, Best friend Sarah"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (newSupportContact) {
                          addItem('supportNetwork', newSupportContact);
                          setNewSupportContact('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.supportNetwork.map((contact, index) => (
                      <Chip
                        key={index}
                        label={contact}
                        onDelete={() => removeItem('supportNetwork', contact)}
                        color="info"
                        variant="outlined"
                      />
                    ))}
                  </Box>
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
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default ProfilePage;