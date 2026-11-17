import NextAuth, { type DefaultSession } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { authEnabled, githubEnabled, googleEnabled } from '@/lib/authEnv';

declare module 'next-auth' {
  interface Session {
    user: {
      /** Stable storage key: `${provider}:${providerAccountId}`. */
      id: string;
      provider: string;
    } & DefaultSession['user'];
  }
}

// Only offer providers that are actually configured, so forks and local dev
// work without OAuth apps (cloud sync is simply hidden).
const providers: Provider[] = [];
if (githubEnabled) providers.push(GitHub);
if (googleEnabled) providers.push(Google);

export { authEnabled };

export const { handlers, auth } = NextAuth({
  providers,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.uid = `${account.provider}:${account.providerAccountId}`;
        token.provider = account.provider;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === 'string') session.user.id = token.uid;
      if (typeof token.provider === 'string') session.user.provider = token.provider;
      return session;
    },
  },
});
