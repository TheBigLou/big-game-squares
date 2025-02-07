import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
} from '@mui/material';

export default function HomePage() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState('');

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      // Check if user is already authenticated
      const storedEmail = localStorage.getItem('email');
      if (storedEmail) {
        // Let the appropriate page handle the redirect
        navigate(`/join/${gameId.trim()}`);
      } else {
        // New user goes to join page
        navigate(`/join/${gameId.trim()}`);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Big Game Squares
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Join a Game
              </Typography>
              <Box component="form" onSubmit={handleJoinGame}>
                <TextField
                  fullWidth
                  label="Game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                >
                  Join Game
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Create a Game
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/create')}
              >
                Create New Game
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 