import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

export function useAuth(requiredRoles?: UserRole[]) {
  const { user, isLoading, isAuthenticated, hasRole, signIn, signOut, initialize } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isAuthorized = requiredRoles ? hasRole(requiredRoles) : isAuthenticated;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAuthorized,
    signIn,
    signOut,
    hasRole: (roles: UserRole[]) => hasRole(roles),
  };
}
