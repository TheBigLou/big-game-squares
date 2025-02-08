import { Grid, Paper, Typography, Chip, Button, IconButton, Tooltip, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
  const [showCopied, setShowCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join/${gameId}`;

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      // Clipboard operations failed silently
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Grid container spacing={2}>
        {/* Home Button */}
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

        {/* Game Name and Invite Link */}
        <Grid item xs={12} md={3}>
          <Typography variant="h5" component="h1" noWrap>
            {name}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mt: 0.5
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {inviteLink}
            </Typography>
            <Tooltip title={showCopied ? "Copied!" : "Copy invite link"}>
              <IconButton 
                size="small" 
                onClick={handleCopyInvite}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>

        {/* Player Info */}
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

        {/* Stats Row Container */}
        <Grid item xs={12} md={5}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'nowrap',
            justifyContent: { xs: 'space-between', md: 'flex-start' }
          }}>
            {/* Price */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Price
              </Typography>
              <Typography variant="h6">
                ${squareCost}
              </Typography>
            </Box>

            {/* Pool */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Pool
              </Typography>
              <Typography variant="h6">
                ${prizePool || 0}
              </Typography>
            </Box>

            {/* Limit */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Limit
              </Typography>
              <Typography variant="h6">
                {squareLimit}
              </Typography>
            </Box>

            {/* Status */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              ml: { xs: 0, md: 'auto' }
            }}>
              <Chip
                label={status.toUpperCase()}
                color={status === 'completed' ? 'error' : status === 'active' ? 'success' : 'warning'}
                size="medium"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
} 