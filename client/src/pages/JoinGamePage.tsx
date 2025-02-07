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
} from '@mui/material';

interface Game {
  status: 'setup' | 'active' | 'completed';
  name: string;
}

interface GameResponse {
  game: Game;
  players: any[];
  squares: any[];
}

interface Player {
  gameId: string;
  name: string;
  email: string;
}

const JoinGamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { data: gameData, isLoading: gameLoading } = useQuery<GameResponse>({
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
      const response = await joinGame(gameId, { name, email: email.toLowerCase() });
      console.log('Join response:', response);
      return response;
    },
    onSuccess: (response) => {
      console.log('Join success:', response);
      if (response?.player) {
        // Store user info in localStorage
        localStorage.setItem('email', email.toLowerCase());
        localStorage.setItem('name', name);
        // Redirect using window.location
        console.log('Redirecting to:', `/play/${gameId}`);
        window.location.href = `/play/${gameId}`;
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

    // Check if game is already started for new players
    if (gameData?.game.status !== 'setup') {
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
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={joinGameMutation.isPending}
              error={!email.trim() && email !== ''}
              helperText={!email.trim() && email !== '' ? 'Email is required' : ''}
            />
          </Box>
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

