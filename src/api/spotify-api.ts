import type {
  AddItemsToPlaylistBody,
  CreatePlaylistBody,
  CreatePlaylistResponse,
  PlaylistSnapshotResponse,
  UserProfileResponse,
  UsersSavedTracksResponse,
} from "./spotify-api-types";

const BASE_SPOTIFY_URL = "https://api.spotify.com/v1";

export const performSpotifyRequest = async (
  endPointPath: string,
  accessToken: string,
  options?: RequestInit
) => {
  const url = BASE_SPOTIFY_URL + endPointPath;
  const data = await fetch(url, {
    method: "GET",
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options?.headers || {}),
    },
  })
    .then((r: any) => {
      if (!r.ok) {
        console.log(r);
        throw new Error("HTTP status: " + r.status);
      }
      return r.json();
    })
    .catch((e: any) => console.error(e));

  return data;
};

export const getUserProfile = async (
  accessToken: string
): Promise<UserProfileResponse> => {
  return performSpotifyRequest(`/me`, accessToken);
};

export const GET_USER_SAVED_TRACKS_LIMIT = 50;
export const getUserSavedTracks = async (
  accessToken: string,
  currentOffset: number
): Promise<UsersSavedTracksResponse> => {
  return performSpotifyRequest(
    `/me/tracks?offset=${encodeURIComponent(
      currentOffset
    )}&limit=${GET_USER_SAVED_TRACKS_LIMIT}`,
    accessToken
  );
};

export const createPlaylist = async (
  accessToken: string,
  userId: string,
  body: CreatePlaylistBody
): Promise<CreatePlaylistResponse> => {
  return performSpotifyRequest(
    `/users/${encodeURIComponent(userId)}/playlists`,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
};

export const MAX_NUMBER_OF_ITEMS = 100;
export const addItemsToPlaylist = async (
  accessToken: string,
  playlistId: string,
  body: AddItemsToPlaylistBody
): Promise<PlaylistSnapshotResponse> => {
  return performSpotifyRequest(
    `/playlists/${encodeURIComponent(playlistId)}/tracks`,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
};
