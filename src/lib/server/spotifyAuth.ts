import { SPOTIFY_API_KEY, SPOTIFY_API_SECRET } from "$env/static/private";

const AUTH_URL = "https://accounts.spotify.com/api/token";
const EXPIRATION_BUFFER_MS = 300;

type SpotifyAuthResponse = {
  access_token: string;
  expires_in: number;
};

type CachedToken = { accessToken: string; expiresAt: number };

export interface ClientAuthProvider {
  getAccessToken(): Promise<string | null>;
}

export class SpotifyAuth implements ClientAuthProvider {
  #cachedToken: CachedToken | null;
  constructor() {
    this.#cachedToken = null;
  }

  private cacheToken(token: string, ttlMs: number) {
    const newToken = {
      accessToken: token,
      expiresAt: Date.now() + ttlMs * 1000 - EXPIRATION_BUFFER_MS,
    };

    this.#cachedToken = newToken;
  }

  private isActive(): boolean {
    if (!this.#cachedToken) {
      return false;
    }

    const { expiresAt } = this.#cachedToken;

    return Date.now() < expiresAt;
  }

  /**
   * getAccessToken
   * @description retrieves access token based in api key and secret. Token is memoized to minimize redundant spotify api calls.
   */
  public async getAccessToken(): Promise<string | null> {
    if (this.#cachedToken && this.isActive()) {
      return this.#cachedToken.accessToken;
    }

    const headers = new Headers();
    const credentials = Buffer.from(
      `${SPOTIFY_API_KEY}:${SPOTIFY_API_SECRET}`
    ).toString("base64");
    headers.set("Authorization", `Basic ${credentials}`);
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    const body = `${encodeURIComponent("grant_type")}=${encodeURIComponent(
      "client_credentials"
    )}`;

    const resp = await fetch(AUTH_URL, {
      method: "POST",
      headers,
      body,
    });

    if (!resp.ok) {
      const message = await resp.text();
      console.error("Spotify auth failed with ", {
        message,
        status: resp.status,
      });
      return null;
    }

    const { access_token, expires_in }: SpotifyAuthResponse = await resp.json();
    this.cacheToken(access_token, expires_in);

    return access_token;
  }
}
