import { Grid, Paper, Typography, Chip, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

interface GameInfoBarProps {
  name: string;
  gameId: string;
  squareCost: number;
  prizePool: number;
  squareLimit: number;
  status: string;
  playerName?: string;
  playerEmail?: string;
  isOwner?: boolean;
}

export default function GameInfoBar({ 
  name, 
  gameId, 
  squareCost, 
  prizePool, 
  squareLimit, 
  status,
  playerName,
  playerEmail,
  isOwner
}: GameInfoBarProps) {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={1}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="small"
            fullWidth
          >
            Home
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="h5" component="h1" noWrap>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {gameId}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary">
            {isOwner ? 'Owner' : 'Player'}
          </Typography>
          <Typography variant="h6" noWrap>
            {playerName}
          </Typography>
          {playerEmail && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {playerEmail}
            </Typography>
          )}
        </Grid>
        <Grid item xs={6} md={1}>
          <Typography variant="body2" color="text.secondary">
            Price
          </Typography>
          <Typography variant="h6">
            ${squareCost}
          </Typography>
        </Grid>
        <Grid item xs={6} md={1}>
          <Typography variant="body2" color="text.secondary">
            Pool
          </Typography>
          <Typography variant="h6">
            ${prizePool || 0}
          </Typography>
        </Grid>
        <Grid item xs={6} md={1}>
          <Typography variant="body2" color="text.secondary">
            Limit
          </Typography>
          <Typography variant="h6">
            {squareLimit}
          </Typography>
        </Grid>
        <Grid item xs={6} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Chip
            label={status.toUpperCase()}
            color={status === 'completed' ? 'error' : status === 'active' ? 'success' : 'warning'}
            size="medium"
          />
        </Grid>
      </Grid>
    </Paper>
  );
} 