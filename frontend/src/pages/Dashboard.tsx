import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Person,
  Psychology,
  Security,
  ExitToApp,
  Edit,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  username?: string;
  language_preference: string;
  timezone: string;
  is_verified: boolean;
  is_active: boolean;
  privacy_settings: any;
  avatar_preference: any;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
      } else {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.clear();
          navigate('/login');
        } else {
          setError(data.message || 'Failed to load user data');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Load user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call logout endpoint
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage and redirect
      localStorage.clear();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">User data not found</Alert>
          <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h1">
                  Welcome back{user.username ? `, ${user.username}` : ''}!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              color="error"
            >
              Logout
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/chat')}
                      sx={{ mb: 2 }}
                    >
                      Start AI Chat Session
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/wellness')}
                      sx={{ mb: 2 }}
                    >
                      Wellness Center
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/profile')}
                      startIcon={<Edit />}
                    >
                      Edit Profile
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/privacy')}
                      startIcon={<Security />}
                    >
                      Privacy Settings
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/professionals')}
                    >
                      Find Therapists
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Account Status"
                      secondary={user.is_active ? 'Active' : 'Inactive'}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Email Verified"
                      secondary={user.is_verified ? 'Yes' : 'No'}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Language"
                      secondary={user.language_preference.toUpperCase()}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Timezone"
                      secondary={user.timezone}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Member Since"
                      secondary={new Date(user.created_at).toLocaleDateString()}
                    />
                  </ListItem>
                  {user.last_login && (
                    <>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Last Login"
                          secondary={new Date(user.last_login).toLocaleString()}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacy & Security */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Privacy & Security
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Your data is encrypted and secure. Manage your privacy settings below.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/privacy')}
                    >
                      Privacy Settings
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => alert('Change password functionality coming soon!')}
                    >
                      Change Password
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => alert('Download data functionality coming soon!')}
                    >
                      Download Data
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => alert('Delete account functionality coming soon!')}
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;