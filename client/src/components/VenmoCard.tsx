import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
  Dialog
} from '@mui/material';
import { useState } from 'react';
import PaymentRequestModal from './PaymentRequestModal';

interface VenmoCardProps {
  isOwner: boolean;
  ownerVenmoUsername?: string;
  playerVenmoUsername?: string;
  onVenmoUpdate: (username: string) => Promise<void>;
  squareCost: number;
  numSquares: number;
  ownerEmail: string;
  gameName: string;
  players: any[];
  squares: any[];
}

export default function VenmoCard({
  isOwner,
  ownerVenmoUsername,
  playerVenmoUsername,
  onVenmoUpdate,
  squareCost,
  numSquares,
  ownerEmail,
  gameName,
  players,
  squares
}: VenmoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleEditClick = () => {
    setEditValue(isOwner ? ownerVenmoUsername || '' : playerVenmoUsername || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const cleanUsername = editValue.trim().replace(/^@/, '');
      await onVenmoUpdate(cleanUsername);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsUpdating(false);
    }
  };

  const generatePaymentLink = () => {
    if (!ownerVenmoUsername) return null;

    const totalCost = numSquares * squareCost;
    const note = `Big+Game+Squares:+${numSquares}+squares+$${squareCost}+each`;

    const params = new URLSearchParams({
      txn: 'pay',
      audience: 'private',
      recipients: ownerVenmoUsername,
      amount: totalCost.toFixed(2),
      note: note
    });

    return `https://venmo.com/?${params.toString()}`;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Venmo
      </Typography>

      {isOwner ? (
        // Owner View
        <>
          <Box sx={{ mb: 2 }}>
            {ownerVenmoUsername ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  @{ownerVenmoUsername}
                </Typography>
                <Button
                  size="small"
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={handleEditClick}
              >
                Add Venmo
              </Button>
            )}
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowPaymentModal(true)}
          >
            Manage Payments
          </Button>

          <PaymentRequestModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onStartGame={() => setShowPaymentModal(false)}
            players={players}
            squares={squares}
            squareCost={squareCost}
            ownerEmail={ownerEmail}
            gameName={gameName}
            onVenmoUpdate={onVenmoUpdate}
            hideStartGame
          />
        </>
      ) : (
        // Player View
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Game Owner's Venmo
            </Typography>
            <Typography variant="h6">
              {ownerVenmoUsername ? `@${ownerVenmoUsername}` : 'Not set'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your Venmo Username
            </Typography>
            {playerVenmoUsername ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">
                  @{playerVenmoUsername}
                </Typography>
                <Button
                  size="small"
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={handleEditClick}
              >
                Add Venmo
              </Button>
            )}
          </Box>

          {ownerVenmoUsername && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                const link = generatePaymentLink();
                if (link) window.open(link, '_blank');
              }}
              disabled={!ownerVenmoUsername}
            >
              Pay with Venmo
            </Button>
          )}
        </>
      )}

      <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isOwner ? 'Edit Your Venmo Username' : 'Edit Your Venmo Username'}
          </Typography>
          <TextField
            fullWidth
            label="Venmo Username"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">@</InputAdornment>,
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              variant="contained"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
} 