import type { SearchType } from "$lib/server/spotifyApi";

export type Image = {
  url: `https://${string}`;
  height: number;
  width: number;
};

type BaseSpotifyResponse = {
  type: SearchType;
  name: string;
  href: string;
  uri: string;
  id: string;
  external_urls: {
    spotify: string;
  };
  available_markets: CountryCode[];
};

type SpotifyAlbum = BaseSpotifyResponse & {
  type: "album";
  images: Image[];
};

type SpotifyTrack = BaseSpotifyResponse & {
  type: "track";
  release_date: string;
  genres: string[];
  images: Image[];
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
};

type SpotifyArtist = BaseSpotifyResponse & {
  type: "artist";
  images: Image[];
};

type SpotifyShow = BaseSpotifyResponse & {
  type: "show";
  release_date: string;
  description: string;
  html_description: string;
  languages: string[];
  images: Image[];
};

type SpotifyAudiobook = BaseSpotifyResponse & {
  type: "audiobook";
  authors: {
    name: string;
  }[];
  description: string;
  html_description: string;
  languages: string[];
  total_chapters: number;
  languages: string[];
  chapters: {
    total: number;
    items: SpotifyEpisode[];
  };
  images: Image[];
};

type SpotifyEpisode = BaseSpotifyResponse & {
  type: "episode";
  chapter_number: number;
  languages: string[];
  id: string;
  description: string;
  html_description: string;
  release_date: string;
  images: Image[];
};

export type SpotifyResponse =
  | SpotifyTrack
  | SpotifyShow
  | SpotifyArtist
  | SpotifyEpisode
  | SpotifyAudiobook;
