import { useState, useEffect } from 'react';
import { Player } from '../types/game';

interface AuthState {
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;
}

export function useAuth(players?: Player[], ownerEmail?: string) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    return {
      email,
      name,
      isAuthenticated: !!email && !!name
    };
  });

  const isOwner = authState.email && ownerEmail?.toLowerCase() === authState.email.toLowerCase();
  const currentPlayer = authState.email && players?.find(
    p => p.email.toLowerCase() === authState.email?.toLowerCase()
  );

  const login = (email: string, name: string) => {
    localStorage.setItem('email', email);
    localStorage.setItem('name', name);
    setAuthState({
      email,
      name,
      isAuthenticated: true
    });
  };

  const logout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setAuthState({
      email: null,
      name: null,
      isAuthenticated: false
    });
  };

  const checkAuth = () => {
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const isAuthenticated = !!email && !!name;

    if (!isAuthenticated) {
      logout();
      return false;
    }

    if (players && !isOwner && !currentPlayer) {
      logout();
      return false;
    }

    return true;
  };

  useEffect(() => {
    checkAuth();
  }, [players, ownerEmail]);

  return {
    ...authState,
    isOwner,
    currentPlayer,
    login,
    logout,
    checkAuth
  };
} 