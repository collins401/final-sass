import {
    adminClient,
    organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin 
    : import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    organizationClient(),
    adminClient(),
  ],
});

// export const { signIn, signOut, signUp, useSession } = authClient;