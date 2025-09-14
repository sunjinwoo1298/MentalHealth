import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Container,
  Grid,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface RegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  emergencyContact: string;
  languagePreference: string;
  timezone: string;
  agreeToTerms: boolean;
  privacySettings: {
    shareData: boolean;
    analytics: boolean;
  };
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<RegistrationForm>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    emergencyContact: '',
    languagePreference: 'en',
    timezone: 'Asia/Kolkata',
    agreeToTerms: false,
    privacySettings: {
      shareData: false,
      analytics: false
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('privacySettings.')) {
        const settingName = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          privacySettings: {
            ...prev.privacySettings,
            [settingName]: checked
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          username: formData.username || undefined,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          phone: formData.phone || undefined,
          emergencyContact: formData.emergencyContact || undefined,
          languagePreference: formData.languagePreference,
          timezone: formData.timezone,
          privacySettings: formData.privacySettings
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! You can now login.');
        // Optionally auto-login or redirect to login
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
              Join MindCare AI
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
              Create your account to start your mental wellness journey
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    helperText="Min 8 chars, include uppercase, lowercase, number & special char"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    helperText="Optional - for personalization"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    helperText="Optional - for emergency contact"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    helperText="Name and phone of someone to contact in crisis"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Language</InputLabel>
                    <Select
                      value={formData.languagePreference}
                      onChange={(e) => handleSelectChange('languagePreference', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">Hindi</MenuItem>
                      <MenuItem value="bn">Bengali</MenuItem>
                      <MenuItem value="te">Telugu</MenuItem>
                      <MenuItem value="ta">Tamil</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={formData.timezone}
                      onChange={(e) => handleSelectChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Kolkata">India (IST)</MenuItem>
                      <MenuItem value="Asia/Dubai">UAE (GST)</MenuItem>
                      <MenuItem value="America/New_York">US Eastern</MenuItem>
                      <MenuItem value="Europe/London">UK (GMT)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Privacy Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="privacySettings.shareData"
                        checked={formData.privacySettings.shareData}
                        onChange={handleInputChange}
                      />
                    }
                    label="Allow anonymized data sharing for research (optional)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="privacySettings.analytics"
                        checked={formData.privacySettings.analytics}
                        onChange={handleInputChange}
                      />
                    }
                    label="Allow analytics to improve app experience (optional)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" color="primary">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" target="_blank" color="primary">
                          Privacy Policy
                        </Link>{' '}
                        *
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Grid>

                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/login')}
                      color="primary"
                    >
                      Sign in here
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RegisterPage;