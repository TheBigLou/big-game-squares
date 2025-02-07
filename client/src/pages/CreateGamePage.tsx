import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createGame } from '../api/client';
import { generateGameName } from '../utils/nameGenerator';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import PageNavigation from '../components/PageNavigation';

interface GameConfig {
  squareCost: number;
  squareLimit: number;
  scoring: {
    firstQuarter: number;
    secondQuarter: number;
    thirdQuarter: number;
    final: number;
  };
  teams: {
    vertical: string;
    horizontal: string;
  };
}

export default function CreateGamePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GameConfig>({
    squareCost: 1,
    squareLimit: 10,
    scoring: {
      firstQuarter: 15,
      secondQuarter: 20,
      thirdQuarter: 15,
      final: 50
    },
    teams: {
      vertical: 'Team 1',
      horizontal: 'Team 2'
    }
  });

  // Check if score distribution adds up to 100
  const isScoreValid = Object.values(config.scoring).reduce((sum, value) => sum + value, 0) === 100;

  // Handle square cost changes with decimal validation
  const handleSquareCostChange = (value: string) => {
    // Allow empty value
    if (value === '') {
      setConfig(prev => ({ ...prev, squareCost: 0 }));
      return;
    }

    // Remove any non-digit or non-decimal characters
    const sanitized = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    
    // Limit to two decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    // Convert to number and validate
    const numValue = parseFloat(sanitized);
    if (!isNaN(numValue) && numValue >= 0) {
      setConfig(prev => ({ ...prev, squareCost: numValue }));
    }
  };

  // Handle square limit changes
  const handleSquareLimitChange = (value: string) => {
    // Remove any non-digit characters
    const sanitized = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(sanitized);
    
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setConfig(prev => ({ ...prev, squareLimit: numValue }));
    }
  };

  // Handle scoring distribution changes
  const handleScoringChange = (quarter: keyof typeof config.scoring, value: string) => {
    // Remove any non-digit characters
    const sanitized = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(sanitized);
    
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setConfig(prev => ({
        ...prev,
        scoring: {
          ...prev.scoring,
          [quarter]: numValue
        }
      }));
    }
  };

  useEffect(() => {
    // Generate a random game name on component mount
    setName(generateGameName());
  }, []);

  const createGameMutation = useMutation({
    mutationFn: () => {
      // Validate required fields
      if (!name.trim()) throw new Error('Game name is required');
      if (!ownerName.trim()) throw new Error('Owner name is required');
      if (!ownerEmail.trim()) throw new Error('Owner email is required');
      if (!config.teams.vertical.trim()) throw new Error('Team 1 name is required');
      if (!config.teams.horizontal.trim()) throw new Error('Team 2 name is required');
      if (!isScoreValid) throw new Error('Score distribution must add up to 100%');
      
      return createGame({
        name: name.trim(),
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerName: ownerName.trim(),
        config: {
          ...config,
          teams: {
            vertical: config.teams.vertical.trim(),
            horizontal: config.teams.horizontal.trim()
          }
        }
      });
    },
    onSuccess: (response) => {
      localStorage.setItem('email', ownerEmail.trim().toLowerCase());
      localStorage.setItem('name', ownerName.trim());
      navigate(response.accessLink);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || err?.message || 'Failed to create game');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createGameMutation.mutate();
  };

  return (
    <Container maxWidth="sm">
      <PageNavigation />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create New Game
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Game Name */}
            <TextField
              fullWidth
              label="Game Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              margin="normal"
              disabled={createGameMutation.isPending}
            />

            {/* Owner Info */}
            <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
              Owner Information
            </Typography>
            <TextField
              fullWidth
              label="Your Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              margin="normal"
              disabled={createGameMutation.isPending}
            />
            <TextField
              fullWidth
              type="email"
              label="Your Email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
              margin="normal"
              disabled={createGameMutation.isPending}
            />

            {/* Teams and Game Configuration in same row */}
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {/* Teams Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Teams
                </Typography>
                <Box sx={{ height: 80 }}>
                  <TextField
                    fullWidth
                    label="Team 1"
                    value={config.teams.vertical}
                    onChange={(e) => setConfig({
                      ...config,
                      teams: { ...config.teams, vertical: e.target.value }
                    })}
                    required
                    margin="normal"
                    disabled={createGameMutation.isPending}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Team 2"
                  value={config.teams.horizontal}
                  onChange={(e) => setConfig({
                    ...config,
                    teams: { ...config.teams, horizontal: e.target.value }
                  })}
                  required
                  margin="normal"
                  disabled={createGameMutation.isPending}
                />
              </Grid>

              {/* Game Configuration Section */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Game Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Square Cost"
                  value={config.squareCost}
                  onChange={(e) => handleSquareCostChange(e.target.value)}
                  required
                  margin="normal"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  disabled={createGameMutation.isPending}
                />
                <TextField
                  fullWidth
                  label="Square Limit per Player"
                  value={config.squareLimit}
                  onChange={(e) => handleSquareLimitChange(e.target.value)}
                  required
                  margin="normal"
                  type="number"
                  inputProps={{ min: 1, max: 100 }}
                  disabled={createGameMutation.isPending}
                />
              </Grid>
            </Grid>

            {/* Scoring Distribution */}
            <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
              Scoring Distribution
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="1st Quarter"
                  value={config.scoring.firstQuarter}
                  onChange={(e) => handleScoringChange('firstQuarter', e.target.value)}
                  required
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  disabled={createGameMutation.isPending}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="2nd Quarter"
                  value={config.scoring.secondQuarter}
                  onChange={(e) => handleScoringChange('secondQuarter', e.target.value)}
                  required
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  disabled={createGameMutation.isPending}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="3rd Quarter"
                  value={config.scoring.thirdQuarter}
                  onChange={(e) => handleScoringChange('thirdQuarter', e.target.value)}
                  required
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  disabled={createGameMutation.isPending}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Final"
                  value={config.scoring.final}
                  onChange={(e) => handleScoringChange('final', e.target.value)}
                  required
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  disabled={createGameMutation.isPending}
                />
              </Grid>
            </Grid>

            {!isScoreValid && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Score distribution must add up to 100%
              </Alert>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={createGameMutation.isPending || !isScoreValid}
              >
                {createGameMutation.isPending ? 'Creating...' : 'Create Game'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 