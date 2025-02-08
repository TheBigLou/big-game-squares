import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Alert
} from '@mui/material';
import { useState } from 'react';
import { togglePlayerPayment } from '../api/client';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useQueryClient } from '@tanstack/react-query';

interface Player {
  _id: string;
  name: string;
  email: string;
  gameId: string;
  venmoUsername?: string;
  hasPaid?: boolean;
}

interface PaymentRequestModalProps {
  open: boolean;
  onClose: () => void;
  onStartGame: () => void;
  players: Player[];
  squares: any[];
  squareCost: number;
  ownerEmail: string;
  gameName: string;
  onVenmoUpdate: (playerId: string, username: string) => Promise<void>;
  hideStartGame?: boolean;
}

export default function PaymentRequestModal({
  open,
  onClose,
  onStartGame,
  players,
  squares,
  squareCost,
  ownerEmail,
  onVenmoUpdate,
  hideStartGame
}: PaymentRequestModalProps) {
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [editingVenmo, setEditingVenmo] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();

  const handleTogglePayment = async (player: Player) => {
    if (!ownerEmail) return;
    setUpdatingPayment(player._id);
    try {
      const response = await togglePlayerPayment(player.gameId, player._id, ownerEmail);
      // Update the cache with the new player data
      queryClient.setQueryData(['game', player.gameId], (oldData: any) => ({
        ...oldData,
        players: oldData.players.map((p: Player) => 
          p._id === response.player._id ? response.player : p
        )
      }));
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setUpdatingPayment(null);
    }
  };

  const saveVenmoUsername = async (player: Player, username: string) => {
    try {
      await onVenmoUpdate(player._id, username.trim());
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const handleRequestPayment = async (player: Player) => {
    const username = editingVenmo[player._id] ?? player.venmoUsername ?? '';
    if (username && username !== player.venmoUsername) {
      await saveVenmoUsername(player, username);
    }
    const link = generateVenmoLink(player);
    if (link) {
      window.open(link, '_blank');
    }
  };

  const handleClose = async () => {
    // Save any unsaved Venmo usernames before closing
    const updatePromises = Object.entries(editingVenmo).map(([playerId, username]) => {
      const player = players.find(p => p._id === playerId);
      if (player && username && username !== player.venmoUsername) {
        return saveVenmoUsername(player, username);
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
    onClose();
  };

  const handleStartGame = async () => {
    // Save any unsaved Venmo usernames before starting the game
    const updatePromises = Object.entries(editingVenmo).map(([playerId, username]) => {
      const player = players.find(p => p._id === playerId);
      if (player && username && username !== player.venmoUsername) {
        return saveVenmoUsername(player, username);
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
    onStartGame();
  };

  const generateVenmoLink = (player: Player) => {
    if (!player.venmoUsername) return null;

    const playerSquares = squares.filter(s => s.playerId === player._id);
    const numSquares = playerSquares.length;
    const totalCost = numSquares * squareCost;
    const note = `Big+Game+Squares:+${numSquares}+squares+$${squareCost}+each`;

    const params = new URLSearchParams({
      txn: 'charge',
      audience: 'private',
      recipients: player.venmoUsername,
      amount: totalCost.toFixed(2),
      note: note
    });

    return `https://venmo.com/?${params.toString()}`;
  };

  const copyVenmoLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (error) {
      // Clipboard operations failed silently
    }
  };

  const isOwner = (player: Player) => player.email.toLowerCase() === ownerEmail.toLowerCase();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Payment Collection</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Review payments before starting the game. You can request payment via Venmo and mark players as paid.
        </Typography>

        {squares.length < 100 && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Only {squares.length} out of 100 squares are filled. You can still start the game, but empty squares will not be part of the prize pool.
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          {/* Desktop view */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">Squares</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Venmo Username</TableCell>
                  <TableCell>Request Payment</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => {
                  const playerSquares = squares.filter(s => s.playerId === player._id);
                  const totalBuyIn = playerSquares.length * squareCost;
                  const hasPaid = isOwner(player) || player.hasPaid;
                  const venmoLink = generateVenmoLink(player);

                  return (
                    <TableRow key={player._id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {player.name}
                          {isOwner(player) && ' (Owner)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {player.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{playerSquares.length}</TableCell>
                      <TableCell align="right">${totalBuyIn.toFixed(2)}</TableCell>
                      <TableCell>
                        {!isOwner(player) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={editingVenmo[player._id] ?? player.venmoUsername ?? ''}
                              onChange={(e) => setEditingVenmo(prev => ({
                                ...prev,
                                [player._id]: e.target.value.replace(/^@/, '')
                              }))}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">@</InputAdornment>,
                              }}
                            />
                            {venmoLink && (
                              <Tooltip title="Copy Venmo Link">
                                <IconButton
                                  size="small"
                                  onClick={() => copyVenmoLink(venmoLink)}
                                >
                                  <ContentCopyIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isOwner(player) && (editingVenmo[player._id] || player.venmoUsername) && !hasPaid && (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleRequestPayment(player)}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            REQUEST PAYMENT
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isOwner(player) && (
                          <Button
                            variant={hasPaid ? "contained" : "outlined"}
                            color={hasPaid ? "success" : "error"}
                            onClick={() => handleTogglePayment(player)}
                            disabled={updatingPayment === player._id}
                            size="small"
                            sx={{ minWidth: 100 }}
                          >
                            {hasPaid ? '✓ PAID' : '✗ UNPAID'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Mobile view */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {players.map((player) => {
              const playerSquares = squares.filter(s => s.playerId === player._id);
              const totalBuyIn = playerSquares.length * squareCost;
              const hasPaid = isOwner(player) || player.hasPaid;
              const venmoLink = generateVenmoLink(player);

              return (
                <Paper 
                  key={player._id} 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    backgroundColor: isOwner(player) ? 'action.hover' : 'background.paper'
                  }}
                >
                  {/* Player Info Row */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {player.name}
                      {isOwner(player) && ' (Owner)'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {player.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {playerSquares.length} squares: ${totalBuyIn.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Status Button Row */}
                  {!isOwner(player) && (
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant={hasPaid ? "contained" : "outlined"}
                        color={hasPaid ? "success" : "error"}
                        onClick={() => handleTogglePayment(player)}
                        disabled={updatingPayment === player._id}
                        size="small"
                      >
                        {hasPaid ? '✓ PAID' : '✗ UNPAID'}
                      </Button>
                    </Box>
                  )}

                  {/* Venmo Row */}
                  {!isOwner(player) && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Venmo
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={editingVenmo[player._id] ?? player.venmoUsername ?? ''}
                          onChange={(e) => setEditingVenmo(prev => ({
                            ...prev,
                            [player._id]: e.target.value.replace(/^@/, '')
                          }))}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">@</InputAdornment>,
                          }}
                        />
                        {venmoLink && (
                          <Tooltip title="Copy Venmo Link">
                            <IconButton
                              size="small"
                              onClick={() => copyVenmoLink(venmoLink)}
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      {(editingVenmo[player._id] || player.venmoUsername) && !hasPaid && (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleRequestPayment(player)}
                          fullWidth
                        >
                          REQUEST PAYMENT
                        </Button>
                      )}
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {hideStartGame ? 'Done' : 'Cancel'}
        </Button>
        {!hideStartGame && (
          <Button
            variant="contained"
            onClick={handleStartGame}
          >
            Start Game
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 