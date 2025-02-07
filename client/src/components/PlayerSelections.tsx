import { Box, Typography, Button, Paper } from '@mui/material';

interface PlayerSelectionsProps {
  confirmedSquares: number;
  pendingSquares: number;
  remainingPicks: number;
  onConfirm?: () => void;
  isConfirming?: boolean;
  showConfirmButton?: boolean;
}

export default function PlayerSelections({
  confirmedSquares,
  pendingSquares,
  remainingPicks,
  onConfirm,
  isConfirming = false,
  showConfirmButton = true
}: PlayerSelectionsProps) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Selections
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Confirmed Squares
        </Typography>
        <Typography variant="h6">{confirmedSquares}</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Pending Selections
        </Typography>
        <Typography variant="h6">{pendingSquares}</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Remaining Picks
        </Typography>
        <Typography variant="h6">{remainingPicks}</Typography>
      </Box>

      {showConfirmButton && pendingSquares > 0 && onConfirm && (
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? 'Confirming...' : 'Confirm Selections'}
        </Button>
      )}
    </Paper>
  );
} 