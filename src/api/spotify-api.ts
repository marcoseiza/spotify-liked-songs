import type { UsersSavedTracksResponse } from "./spotify-api-types";

const BASE_SPOTIFY_URL = "https://api.spotify.com/v1";

export const performSpotifyRequest = async (
  endPointPath: string,
  accessToken: string
) => {
  const url = BASE_SPOTIFY_URL + endPointPath;
  const data = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((r: any) => {
      if (!r.ok) throw new Error("HTTP status: " + r.status);
      return r.json();
    })
    .catch((e: any) => console.error(e));

  return data;
};

export const getUserSavedTracks = async (
  accessToken: string,
  currentOffset: number
): Promise<UsersSavedTracksResponse> => {
  return performSpotifyRequest(
    `/me/tracks?offset=${currentOffset}&limit=20`,
    accessToken
  );
};
