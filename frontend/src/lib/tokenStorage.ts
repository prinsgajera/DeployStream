const TOKEN_KEY = "deploystream.auth_token";

export const tokenStorage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    console.log("token stored", token)
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      return;
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      return;
    }
  },
};
