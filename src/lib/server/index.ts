import { SpotifyApi } from "./spotifyApi";
import { SpotifyAuth } from "./spotifyAuth";

const auth = new SpotifyAuth();
export const spotifyApi = new SpotifyApi({ auth });
