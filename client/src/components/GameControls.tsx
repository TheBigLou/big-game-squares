import { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface GameControlsProps {
  gameId: string;
  isGameActive: boolean;
  onStartGame: () => void;
  isStarting: boolean;
  totalSquares: number;
  filledSquares: number;
}

export default function GameControls({
  gameId,
  isGameActive,
  onStartGame,
  isStarting,
  totalSquares,
  filledSquares,
}: GameControlsProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const inviteLink = `${window.location.origin}/join/${gameId}`;

  const handleStartGame = () => {
    if (filledSquares < totalSquares) {
      const confirmed = window.confirm(
        `Only ${filledSquares} out of ${totalSquares} squares are filled. Are you sure you want to start the game?`
      );
      if (!confirmed) return;
    }
    onStartGame();
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShowCopiedMessage(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Game Controls
      </Typography>

      {!isGameActive && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleStartGame}
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Start Game'}
          </Button>
          {filledSquares < totalSquares && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {`${totalSquares - filledSquares} squares still available`}
            </Alert>
          )}
        </Box>
      )}

      <Typography variant="subtitle2" gutterBottom>
        Invite Link
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          value={inviteLink}
          size="small"
          InputProps={{
            readOnly: true,
          }}
        />
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={copyInviteLink}
        >
          Copy
        </Button>
      </Box>

      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={2000}
        onClose={() => setShowCopiedMessage(false)}
        message="Invite link copied to clipboard"
      />
    </Paper>
  );
} 