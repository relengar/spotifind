import { spotifyApi } from "$lib/server";
import type {
  Pagination,
  SearchFilter,
  SearchResultItem,
  SearchType,
  SpotifyError,
} from "$lib/server/spotifyApi";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { CountryCode } from "$lib/utils/countries";

const defaultLimit = 40;

type UrlQueryParam =
  | keyof SearchFilter
  | SearchType
  | "search"
  | "type"
  | "market"
  | "offset"
  | "limit";

function getParam<T extends string = string>(
  url: URL,
  param: UrlQueryParam
): T | null {
  return url.searchParams.get(param) as T;
}

function getPaginationParams(url: URL): Pagination {
  const offset = getParam(url, "offset");
  const limit = getParam(url, "limit");

  return {
    ...(offset && { offset: parseInt(offset, 0) }),
    ...(limit && { limit: parseInt(limit, defaultLimit) }),
  };
}

type PageData = SearchResultItem & {
  search: string | null;
  type: SearchType;
  market: CountryCode | null;
  filters: SearchFilter;
  offset: number;
  limit: number;
};

export const load = (async ({ url }): Promise<PageData> => {
  const type = getParam<SearchType>(url, "type") ?? "track";
  const term = getParam(url, "search");
  const market = getParam<CountryCode>(url, "market");

  const album = getParam(url, "album");
  const artist = getParam(url, "artist");
  const track = getParam(url, "track");
  const year = getParam(url, "year");
  const upc = getParam(url, "upc");
  const tag = getParam<"hipster" | "new">(url, "tag");

  const filters: SearchFilter = {
    ...(album && { album: album }),
    ...(artist && { artist }),
    ...(track && { track }),
    ...(year && { year }),
    ...(upc && { upc }),
    ...(tag && { tag }),
  };

  const pagination = getPaginationParams(url);

  const searchState = {
    filters,
    search: term,
    type,
    market,
    ...pagination,
    total: 0,
    offset: 0,
    limit: defaultLimit,
  };

  if (!term) {
    return { items: [], ...searchState };
  }

  const result = await spotifyApi.search({
    term,
    filters,
    type,
    market,
    ...pagination,
  });

  if (result.ok) {
    const data = result.data[`${type}s`];
    console.debug(`Search for "${term}" yielded `, data);

    return {
      ...searchState,
      ...data,
      limit: searchState.limit, // do not use default limit,
    };
  } else {
    const cause = result.error.cause as SpotifyError | undefined;
    throw error(
      cause?.status ?? 500,
      cause?.message ?? "Internal Server error"
    );
  }
}) satisfies PageServerLoad;
