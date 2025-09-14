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
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert('Forgot password functionality will be implemented soon!');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
              Welcome Back
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
              Sign in to continue your mental wellness journey
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
                autoFocus
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  color="primary"
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 2 }}>or</Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Don't have an account?
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/register')}
                >
                  Create New Account
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" align="center" display="block">
                🔒 Your data is encrypted and secure. We're committed to protecting your privacy.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;