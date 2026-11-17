// Which sign-in providers are configured. Kept separate from src/auth.ts so the
// root layout can read the flag without initialising Auth.js.
export const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

/** Cloud sync needs a signing secret and at least one provider. */
export const authEnabled = Boolean(process.env.AUTH_SECRET) && (githubEnabled || googleEnabled);
