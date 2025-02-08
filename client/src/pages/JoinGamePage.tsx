import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getGame, joinGame } from '../api/client';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Game } from '../types/game';

interface GameResponse {
  game: Game;
  players: any[];
  squares: any[];
}

const JoinGamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Add state for post-join Venmo prompt
  const [showVenmoPrompt, setShowVenmoPrompt] = useState(false);
  const [venmoUsername, setVenmoUsername] = useState('');

  const { data: gameData, isLoading: gameLoading, refetch } = useQuery<GameResponse>({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!gameId) return null;
      try {
        const response = await getGame(gameId);
        console.log('Game data:', response);
        return response;
      } catch (error) {
        console.error('Error fetching game:', error);
        setError('Game not found');
        return null;
      }
    },
    retry: false
  });

  const joinGameMutation = useMutation({
    mutationFn: async () => {
      if (!gameId) throw new Error('No game ID provided');
      console.log('Joining game with:', { gameId, name, email: email.toLowerCase() });
      const response = await joinGame(gameId, { 
        name, 
        email: email.toLowerCase(),
        password: showPassword ? password : undefined
      });
      console.log('Join response:', response);
      return response;
    },
    onSuccess: (response) => {
      console.log('Join success:', response);
      if (response?.player) {
        // Store user info in localStorage
        localStorage.setItem('email', email.toLowerCase());
        localStorage.setItem('name', name);

        // Debug logging
        console.log('Player from response:', response.player);
        console.log('Existing players:', gameData?.players);
        console.log('Current email:', email.toLowerCase());
        
        // Find existing player
        const existingPlayer = gameData?.players.find(p => 
          p.email.toLowerCase() === email.toLowerCase()
        );
        console.log('Existing player:', existingPlayer);

        // Check for Venmo username in either response or existing player
        const hasVenmo = response.player.venmoUsername || (existingPlayer && existingPlayer.venmoUsername);
        console.log('Has Venmo:', hasVenmo);

        if (!hasVenmo) {
          setShowVenmoPrompt(true);
        } else {
          // Redirect if they already have a Venmo username
          console.log('Redirecting to:', `/play/${gameId}`);
          window.location.href = `/play/${gameId}`;
        }
      } else {
        console.error('No player in response:', response);
        setError('Failed to join the game. Please try again.');
      }
    },
    onError: (error: any) => {
      console.error('Join error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to join the game. Please try again.';
      setError(errorMessage);
    },
  });

  // Add Venmo update mutation
  const updateVenmoMutation = useMutation({
    mutationFn: async () => {
      if (!gameId) throw new Error('No game ID provided');
      const cleanVenmoUsername = venmoUsername.trim().replace(/^@/, '');
      console.log('Updating Venmo username:', cleanVenmoUsername);
      const response = await joinGame(gameId, { 
        name, 
        email: email.toLowerCase(),
        venmoUsername: cleanVenmoUsername || undefined
      });
      console.log('Update Venmo response:', response);
      return response;
    },
    onSuccess: async (response) => {
      console.log('Venmo update success:', response);
      if (response?.player?.venmoUsername) {
        console.log('Venmo username saved:', response.player.venmoUsername);
        // Refetch game data to ensure we have the latest player info
        await refetch();
      }
      // Redirect after Venmo is saved
      window.location.href = `/play/${gameId}`;
    },
    onError: (error: any) => {
      console.error('Venmo update error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update Venmo username.';
      setError(errorMessage);
    },
  });

  // Add handler for Venmo submission
  const handleVenmoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVenmoMutation.mutate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (!gameId) {
      setError('Invalid game ID');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Check if the email matches the owner
    const isOwner = gameData?.game.ownerEmail.toLowerCase() === email.toLowerCase();
    const isExistingPlayer = gameData?.players.some(
      player => player.email.toLowerCase() === email.toLowerCase()
    );

    // Require password for owner login
    if (isOwner && !password.trim()) {
      setError('Password is required for owner login');
      setShowPassword(true);
      return;
    }

    // Only block join if game has started AND user is a new player
    if (gameData?.game.status !== 'setup' && !isOwner && !isExistingPlayer) {
      setError('The game has already started.');
      return;
    }

    try {
      console.log('Submitting join form...');
      await joinGameMutation.mutateAsync();
    } catch (error) {
      console.error('Submit error:', error);
      // Error is handled in onError callback
    }
  };

  if (gameLoading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!gameData?.game) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">Game not found</Alert>
      </Container>
    );
  }

  if (showVenmoPrompt) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: '2em', marginTop: '2em' }}>
          <Typography variant="h5" gutterBottom>Add Your Venmo Username</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adding your Venmo username makes it easier to handle payments for the game.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleVenmoSubmit}>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Venmo Username"
                value={venmoUsername}
                onChange={(e) => setVenmoUsername(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">@</InputAdornment>,
                }}
                helperText="Enter your Venmo username to make payments easier"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => window.location.href = `/play/${gameId}`}
              >
                Skip
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={updateVenmoMutation.isPending}
              >
                {updateVenmoMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '2em', marginTop: '2em' }}>
        <Typography variant="h4" gutterBottom>Join {gameData.game.name}</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} noValidate>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={joinGameMutation.isPending}
              error={!name.trim() && name !== ''}
              helperText={!name.trim() && name !== '' ? 'Name is required' : ''}
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Show password field if email matches owner
                const isOwner = gameData?.game.ownerEmail.toLowerCase() === e.target.value.toLowerCase();
                setShowPassword(isOwner);
              }}
              required
              disabled={joinGameMutation.isPending}
              error={!email.trim() && email !== ''}
              helperText={!email.trim() && email !== '' ? 'Email is required' : ''}
            />
          </Box>
          {showPassword && (
            <Box mb={2}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={joinGameMutation.isPending}
                error={!password.trim() && password !== ''}
                helperText={!password.trim() && password !== '' ? 'Password is required for owner login' : ''}
              />
            </Box>
          )}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={joinGameMutation.isPending}
          >
            {joinGameMutation.isPending ? 'Joining...' : 'Join Game'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default JoinGamePage;

