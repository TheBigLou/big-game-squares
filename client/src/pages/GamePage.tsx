import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGame, startGame, joinGame, getPendingSquares, updateOwnerVenmo } from '../api/client';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Button,
  TextField,
} from '@mui/material';
import GameGrid from '../components/GameGrid';
import GameControls from '../components/GameControls';
import GameInfoBar from '../components/GameInfoBar';
import PlayerList from '../components/PlayerList';
import QuarterProgress from '../components/QuarterProgress';
import PlayerSelections from '../components/PlayerSelections';
import VenmoCard from '../components/VenmoCard';
import { useScoreManagement } from '../hooks/useScoreManagement';
import { useGameErrors } from '../hooks/useGameErrors';
import { useAuth } from '../hooks/useAuth';
import { useSquareSelection } from '../hooks/useSquareSelection';
import {
  Player,
  Square,
  GameState,
  JoinFormState
} from '../types/game';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const queryClient = useQueryClient();
  const { error, setError, handleError, clearError } = useGameErrors();
  
  // Consolidated states
  const [] = useState<GameState>({
    squares: {
      pending: [],
      revealedEmails: new Set()
    },
    error: null
  });

  const [joinForm, setJoinForm] = useState<JoinFormState>({
    isVisible: false,
    name: '',
    email: ''
  });

  const { data, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId!),
    enabled: !!gameId,
    // Only refetch for non-owners or during setup
    refetchInterval: (query) => {
      if (!query.state.data) return false;
      const status = query.state.data.game.status;
      const isOwner = query.state.data.game.ownerEmail === localStorage.getItem('email')?.toLowerCase();
      if (status === 'active' && isOwner) return false;
      return (status === 'setup' || status === 'active') ? 1000 : false;
    },
  });

  const {
    inputValues,
    handleScoreChange,
    handleQuarterSave,
    handleCurrentScoreSubmit,
    isUpdatingScore
  } = useScoreManagement(gameId!, data?.game?.scores);

  const { isAuthenticated, isOwner, currentPlayer, email, login } = useAuth(data?.players, data?.game.ownerEmail);

  // Add query for pending squares
  const { data: pendingSquaresData } = useQuery({
    queryKey: ['pendingSquares', gameId],
    queryFn: () => getPendingSquares(gameId!),
    enabled: !!gameId && data?.game.status === 'setup',
    refetchInterval: 1000, // Poll every second during setup
  });

  const {
    pendingSquares,
    handleSquareClick,
    handleConfirmSquares,
    isConfirming
  } = useSquareSelection({
    gameId: gameId!,
    currentPlayer: currentPlayer || undefined,
    email,
    squareLimit: data?.game.config.squareLimit || 0,
    squares: data?.squares || [],
    pendingSquaresData,
    onError: setError,
    onSuccess: async () => {
      await refetch();
    },
    gameStatus: data?.game.status
  });

  const startGameMutation = useMutation({
    mutationFn: () => {
      if (!email) throw new Error('Owner email not found');
      return startGame(gameId!, email);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['game', gameId], {
        game: response.game,
        players: data?.players || [],
        squares: response.squares,
      });
      clearError();
    },
    onError: (err) => {
      handleError(err, 'Failed to start game');
    },
  });

  const joinGameMutation = useMutation({
    mutationFn: () => joinGame(gameId!, { 
      name: joinForm.name, 
      email: joinForm.email 
    }),
    onSuccess: () => {
      login(joinForm.email, joinForm.name);
      
      if (data?.game.ownerEmail.toLowerCase() === joinForm.email.toLowerCase()) {
        setJoinForm(prev => ({ ...prev, isVisible: false }));
        refetch();
        return;
      }
      
      setJoinForm(prev => ({ ...prev, isVisible: false }));
      refetch();
    },
    onError: (err) => {
      handleError(err, 'Failed to join game');
    },
  });

  // Update page title when game data changes
  useEffect(() => {
    if (data?.game?.name) {
      document.title = `BIG GAME SQUARES: ${data.game.name}`;
    }
    return () => {
      document.title = 'BIG GAME SQUARES';
    };
  }, [data?.game?.name]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Error loading game. Please try again.</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="warning">Game not found</Alert>
      </Box>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={`/join/${gameId}`} />;
  }

  // Redirect non-owners to appropriate view
  if (!isOwner) {
    if (currentPlayer) {
      return <Navigate to={`/play/${gameId}`} />;
    } else {
      return <Navigate to={`/join/${gameId}`} />;
    }
  }

  const { game, players, squares } = data;
  const isGameActive = game.status === 'active';

  // Get confirmed squares for the current player
  const confirmedSquares = currentPlayer 
    ? squares.filter((s: Square) => s.playerId === currentPlayer._id)
    : [];
  const remainingPicks = currentPlayer 
    ? game.config.squareLimit - confirmedSquares.length
    : 0;

  // Function to toggle email visibility

  if (joinForm.isVisible) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Join {data?.game.name || 'Game'}
          </Typography>

          <Paper sx={{ p: 4, mt: 4 }}>
            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              joinGameMutation.mutate();
            }}>
              <TextField
                fullWidth
                label="Your Name"
                value={joinForm.name}
                onChange={(e) => setJoinForm(prev => ({ ...prev, name: e.target.value }))}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                type="email"
                label="Your Email"
                value={joinForm.email}
                onChange={(e) => setJoinForm(prev => ({ ...prev, email: e.target.value }))}
                required
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                disabled={joinGameMutation.isPending}
              >
                {joinGameMutation.isPending ? 'Joining...' : 'Join Game'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <GameInfoBar
          name={game.name}
          gameId={game.gameId}
          squareCost={game.config.squareCost}
          prizePool={data.prizePool || 0}
          squareLimit={game.config.squareLimit}
          status={game.status}
          playerName={localStorage.getItem('name') || ''}
          playerEmail={localStorage.getItem('email') || ''}
          isOwner={isOwner}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <GameGrid
              rows={game.grid?.rows || []}
              cols={game.grid?.cols || []}
              squares={squares.map((s: Square) => ({
                ...s,
                playerName: players.find((p: Player) => p._id === s.playerId)?.name || '',
                playerEmail: players.find((p: Player) => p._id === s.playerId)?.email || '',
              }))}
              pendingSquares={pendingSquares}
              onSquareClick={handleSquareClick}
              isSelectable={game.status === 'setup' && !!currentPlayer}
              gameStatus={game.status}
              teams={game.config.teams}
              currentScores={isGameActive ? {
                vertical: Number(inputValues.vertical) || 0,
                horizontal: Number(inputValues.horizontal) || 0
              } : undefined}
              players={players}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            {(game.status === 'active' || game.status === 'completed') && isOwner && (
              <QuarterProgress
                scores={game.scores}
                config={game.config}
                squares={squares}
                players={players}
                payouts={data.payouts}
                isOwner={isOwner}
                onSaveQuarter={handleQuarterSave}
                onScoreChange={handleScoreChange}
                onCurrentScoreSubmit={handleCurrentScoreSubmit}
                inputValues={inputValues}
                isSaving={isUpdatingScore}
              />
            )}

            {currentPlayer && game.status === 'setup' && (
              <PlayerSelections
                confirmedSquares={confirmedSquares.length}
                pendingSquares={pendingSquares.length}
                remainingPicks={remainingPicks}
                onConfirm={handleConfirmSquares}
                isConfirming={isConfirming}
              />
            )}

            <VenmoCard
              isOwner={isOwner}
              ownerVenmoUsername={players.find((p: Player) => p.email.toLowerCase() === data?.game.ownerEmail.toLowerCase())?.venmoUsername}
              playerVenmoUsername={typeof currentPlayer === 'object' ? currentPlayer?.venmoUsername : undefined}
              onVenmoUpdate={async (username) => {
                try {
                  if (isOwner) {
                    const response = await updateOwnerVenmo(gameId!, {
                      ownerEmail: email!,
                      venmoUsername: username
                    });
                    // Update both game and player data in the cache
                    queryClient.setQueryData(['game', gameId], (oldData: any) => ({
                      ...oldData,
                      game: response.game,
                      players: oldData.players.map((p: Player) => 
                        p.email.toLowerCase() === email?.toLowerCase()
                          ? { ...p, venmoUsername: username }
                          : p
                      )
                    }));
                  } else if (currentPlayer && typeof currentPlayer === 'object') {
                    const response = await joinGame(gameId!, {
                      email: email!,
                      name: currentPlayer.name,
                      venmoUsername: username
                    });
                    // Update the cache with the new player data
                    queryClient.setQueryData(['game', gameId], (oldData: any) => ({
                      ...oldData,
                      players: oldData.players.map((p: Player) => 
                        p._id === response.player._id ? response.player : p
                      )
                    }));
                  }
                } catch (error) {
                  console.error('Failed to update Venmo username:', error);
                  throw error;
                }
              }}
              squareCost={game.config.squareCost}
              numSquares={confirmedSquares.length}
              ownerEmail={data?.game.ownerEmail}
              gameName={game.name}
              players={players}
              squares={squares}
            />

            {/* Game Controls for owner */}
            {isOwner && game.status === 'setup' && (
              <GameControls
                gameId={game.gameId}
                isGameActive={isGameActive}
                onStartGame={() => startGameMutation.mutate()}
                isStarting={startGameMutation.isPending}
                totalSquares={100}
                filledSquares={squares.length}
                players={players}
                squares={squares}
                squareCost={game.config.squareCost}
                ownerEmail={data?.game.ownerEmail}
                gameName={game.name}
                onVenmoUpdate={async (playerId, username) => {
                  const player = players.find((p: Player) => p._id === playerId);
                  if (!player) return;
                  
                  await joinGame(gameId!, {
                    email: player.email,
                    name: player.name,
                    venmoUsername: username
                  });
                  await refetch();
                }}
              />
            )}

            <PlayerList
              players={players}
              squares={squares}
              squareCost={game.config.squareCost}
              payouts={data.payouts}
              scores={game.scores}
              isOwner={isOwner}
              squareLimit={game.config.squareLimit}
              currentUserEmail={email || undefined}
              gameStatus={game.status}
              game={game}
            />
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        message={error}
      />
    </Container>
  );
} 