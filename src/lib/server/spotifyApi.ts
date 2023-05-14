import type { CountryCode } from "$lib/utils/countries";
import type { SpotifyResponse } from "./spotify";
import type { ClientAuthProvider } from "./spotifyAuth";

type Tag = "hipster" | "new";

export type SearchFilter = {
  album?: string;
  artist?: string;
  track?: string;
  year?: string;
  upc?: string;
  isrc?: string;
  tag?: Tag;
};

export type SearchType =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode"
  | "audiobook";

export type Pagination = {
  offset?: number;
  limit?: number;
};

type SearchParams = {
  term: string;
  filters: SearchFilter;
  type: SearchType;
  market: CountryCode | null;
} & Pagination;

type ApiSuccessResponse<T extends Record<string, unknown>> = {
  data: T;
  ok: true;
};

export type SpotifyError = {
  status: number;
  message: string;
};

type ApiErrorResponse = {
  error: Error;
  ok: false;
};

export type ApiResponse<T extends Record<string, unknown>> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

export type SearchResultItem = {
  items: Array<SpotifyResponse>;
  total: number;
};
type SearchResponse = { [key in `${SearchType}s`]: SearchResultItem };

async function toApiError(resp: Response): Promise<ApiErrorResponse> {
  const text = await resp.text();
  const error = new Error(
    `Spotify request failed with ${resp.status}: ${text}`,
    {
      cause: {
        status: resp.status,
        message: text,
      },
    }
  );

  console.error(error);

  return { error, ok: false };
}

type Config = {
  auth: ClientAuthProvider;
};

export class SpotifyApi {
  #baseUrl: string;
  #auth: ClientAuthProvider;
  constructor({ auth }: Config) {
    this.#baseUrl = "https://api.spotify.com/v1";
    this.#auth = auth;
  }

  private async request<T extends Record<string, unknown>>(
    url: URL
  ): Promise<ApiResponse<T>> {
    const headers = new Headers();

    const token = await this.#auth.getAccessToken();
    if (!token) {
      return { error: new Error("Failed spotify authentication"), ok: false };
    }
    headers.set("Authorization", `Bearer ${token}`);

    const resp = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!resp.ok) {
      return toApiError(resp);
    }

    const data = await resp.json();
    return {
      data,
      ok: true,
    };
  }

  private toQueryString(term: string, filter: SearchFilter): string {
    const filters = Object.entries(filter).map(
      ([attribute, param]) => `${attribute}:${param}`
    );
    const queryComponents = [term, ...filters];
    const queryString = queryComponents.join(" ");

    return encodeURIComponent(queryString);
  }

  private setPagination(url: URL, { offset, limit }: Pagination): URL {
    offset && url.searchParams.set("offset", String(offset));
    limit && url.searchParams.set("limit", String(limit));

    return url;
  }

  /**
   * search
   * @description Executes a search request to [spotify search endpoint](https://developer.spotify.com/documentation/web-api/reference/search) with the provided params
   */
  public async search({
    term,
    filters,
    type,
    market,
    offset,
    limit,
  }: SearchParams): Promise<ApiResponse<SearchResponse>> {
    const url = new URL(`${this.#baseUrl}/search`);
    url.searchParams.set("q", this.toQueryString(term, filters));
    url.searchParams.set("type", type);

    this.setPagination(url, { offset, limit });

    if ((!market && type === "episode") || type === "show") {
      url.searchParams.set("market", "SK");
    }
    if (market) {
      url.searchParams.set("market", market);
    }

    return this.request<SearchResponse>(url);
  }
}
