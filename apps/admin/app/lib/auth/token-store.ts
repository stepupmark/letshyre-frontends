const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage can be unavailable (private mode), the session just won't persist
  }
}

// the profile used to be cached here in plain text, drop it for existing sessions
write("auth_user", null);

export const tokenStore = {
  getAccessToken: () => read(ACCESS_KEY),
  getRefreshToken: () => read(REFRESH_KEY),
  setTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken?: string }) {
    write(ACCESS_KEY, accessToken);
    if (refreshToken) write(REFRESH_KEY, refreshToken);
  },
  clear() {
    write(ACCESS_KEY, null);
    write(REFRESH_KEY, null);
  },
};
