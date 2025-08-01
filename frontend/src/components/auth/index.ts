// Main auth components
export { Auth } from '../Auth';
export { AuthModal } from './AuthModal';
export { ProfileMenu } from './ProfileMenu';
export { AuthStatus, AuthStatusBadge, ConnectionStatus } from './AuthStatus';

// Magic link auth component (primary authentication method)
export { MagicLinkAuth } from './MagicLinkAuth';

// Auth provider and types
export { AuthProvider, useAuth } from '../AuthProvider';
export type { 
  AuthMethod, 
  AuthError, 
  AuthState 
} from '../AuthProvider';