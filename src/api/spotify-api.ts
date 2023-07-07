import type {
  AddItemsToPlaylistBody,
  CreatePlaylistBody,
  CreatePlaylistResponse,
  ImageObject,
  PlaylistSnapshotResponse,
  UserProfileResponse,
  UsersSavedTracksResponse,
} from "./spotify-api-types";
import toast from "../helpers/custom-toast";
import MockApi from "./__mock__/spotify-api";
import { assert, Equals } from "tsafe";

const BASE_SPOTIFY_URL = "https://api.spotify.com/v1";

const performSpotifyRequest = async (
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

const getUserProfile = async (
  accessToken: string
): Promise<UserProfileResponse> => {
  return performSpotifyRequest(`/me`, accessToken);
};

const GET_USER_SAVED_TRACKS_LIMIT = 50;
const getUserSavedTracks = async (
  accessToken: string,
  currentOffset: number,
  limit: number = GET_USER_SAVED_TRACKS_LIMIT
): Promise<UsersSavedTracksResponse> => {
  return performSpotifyRequest(
    `/me/tracks?offset=${encodeURIComponent(currentOffset)}&limit=${limit}`,
    accessToken
  );
};

const createPlaylist = async (
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

const getPlaylistCoverArt = async (
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

const MAX_ITEMS_ADD_TO_PLAYLIST = 100;
const addItemsToPlaylist = async (
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

const addCustomPlaylistCoverImage = async (
  accessToken: string,
  playlistId: string,
  imageBase64Encoded: string
): Promise<void> => {
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

const ImplApi = {
  GET_USER_SAVED_TRACKS_LIMIT,
  MAX_ITEMS_ADD_TO_PLAYLIST,
  getUserProfile,
  getUserSavedTracks,
  createPlaylist,
  getPlaylistCoverArt,
  addItemsToPlaylist,
  addCustomPlaylistCoverImage,
};

assert<Equals<typeof ImplApi, typeof MockApi>>;

const SpotifyApi =
  import.meta.env.VITE_API_VERSION === "Impl" ? ImplApi : MockApi;

export default SpotifyApi;
