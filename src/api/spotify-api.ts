import type {
  AddItemsToPlaylistBody,
  CreatePlaylistBody,
  CreatePlaylistResponse,
  ImageObject,
  PlaylistSnapshotResponse,
  SinglePlaylistResponse,
  UserProfileResponse,
  UsersSavedTracksResponse,
} from "./spotify-api-types";
import toast from "../helpers/custom-toast";

const BASE_SPOTIFY_URL = "https://api.spotify.com/v1";

export const performSpotifyRequest = async (
  endPointPath: string,
  accessToken: string,
  options?: RequestInit & { noJsonParse?: boolean }
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
        console.error(`Http Status Error: ${r.status}`);
        toast.error("HTTP Error | Try again later");
        throw new Error("HTTP Status Error: " + r.status);
      }
      const noJsonParse = options?.noJsonParse || false;
      return !noJsonParse ? r.json() : undefined;
    })
    .catch((e: any) => {
      console.error(e);
      toast.error("HTTP Error | Try again later");
      throw new Error(e);
    });

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
  currentOffset: number,
  limit: number = GET_USER_SAVED_TRACKS_LIMIT
): Promise<UsersSavedTracksResponse> => {
  return performSpotifyRequest(
    `/me/tracks?offset=${encodeURIComponent(currentOffset)}&limit=${limit}`,
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

export const getPlaylistCoverArt = async (
  accessToken: string,
  playlistId: string
): Promise<ImageObject[]> => {
  const args = new URLSearchParams({
    fields: "images(url)",
  });
  return (
    await performSpotifyRequest(
      `/playlists/${encodeURIComponent(playlistId)}?${args}`,
      accessToken,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  ).images;
};

export const MAX_ITEMS_ADD_TO_PLAYLIST = 100;
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

export const addCustomPlaylistCoverImage = async (
  accessToken: string,
  playlistId: string,
  imageBase64Encoded: string
) => {
  return performSpotifyRequest(
    `/playlists/${encodeURIComponent(playlistId)}/images`,
    accessToken,
    {
      method: "PUT",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: imageBase64Encoded,
      noJsonParse: true,
    }
  );
};

const spotifyApi = {
  GET_USER_SAVED_TRACKS_LIMIT,
  MAX_ITEMS_ADD_TO_PLAYLIST,
  getUserProfile,
  getUserSavedTracks,
  createPlaylist,
  getPlaylistCoverArt,
  addItemsToPlaylist,
  addCustomPlaylistCoverImage,
};
export type SpotfiyApi = typeof spotifyApi;
export default spotifyApi;
