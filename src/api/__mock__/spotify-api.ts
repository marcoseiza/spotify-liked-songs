import {
  AddItemsToPlaylistBody,
  CreatePlaylistBody,
  CreatePlaylistResponse,
  PlaylistSnapshotResponse,
  SavedTrackObject,
  TrackObjectFull,
  UserProfileResponse,
  UsersSavedTracksResponse,
} from "../spotify-api-types";
import { SpotfiyApi } from "../spotify-api";

const STANDARD_TIME_OUT = 500;

const userProfile: UserProfileResponse = {
  display_name: "marcoseiza",
  external_urls: { spotify: "" },
  followers: { href: null, total: 4 },
  href: "",
  id: "popcornmarcos",
  images: [
    { url: "" },
    {
      url: "https://i.scdn.co/image/ab6775700000ee8575c9f0df7df5e06f6ceb59d3",
    },
  ],
  type: "user",
  uri: "",
};

export const getUserProfile = async (
  _accessToken: string
): Promise<UserProfileResponse> => {
  return new Promise((r) => {
    setTimeout(() => {
      r(userProfile);
    }, STANDARD_TIME_OUT);
  });
};

export const GET_USER_SAVED_TRACKS_LIMIT = 50;
const TOTAL_NUMBER_OF_SAVED_SONGS = 564;

const makeUsersSavedTracksResponse = (currentOffset: number) =>
  ({
    href: "",
    items: new Array(
      Math.min(50, TOTAL_NUMBER_OF_SAVED_SONGS - currentOffset)
    ).fill({
      added_at: "",
      track: { uri: "spotify-song" } satisfies Pick<
        TrackObjectFull,
        "uri"
      > as any,
    } satisfies SavedTrackObject),
    limit: 50,
    next: "",
    offset: 0,
    previous: "",
    total: TOTAL_NUMBER_OF_SAVED_SONGS,
  } satisfies UsersSavedTracksResponse);

export const getUserSavedTracks = async (
  _accessToken: string,
  currentOffset: number
): Promise<UsersSavedTracksResponse> => {
  return new Promise((r) => {
    setTimeout(() => {
      r(makeUsersSavedTracksResponse(currentOffset));
    }, STANDARD_TIME_OUT);
  });
};

export const createPlaylist = async (
  _accessToken: string,
  _userId: string,
  _body: CreatePlaylistBody
): Promise<CreatePlaylistResponse> => {
  return new Promise((r) => {
    setTimeout(() => {
      r({
        id: "playlist-id",
        external_urls: { spotify: "link" },
        name: "Playlist mock name",
        images: [
          { url: "" },
          {
            url: "https://placehold.co/400",
          },
        ],
      } satisfies Pick<CreatePlaylistResponse, "id" | "external_urls" | "name" | "images"> as any);
    }, STANDARD_TIME_OUT);
  });
};

export const MAX_ITEMS_ADD_TO_PLAYLIST = 100;
export const addItemsToPlaylist = async (
  _accessToken: string,
  _playlistId: string,
  _body: AddItemsToPlaylistBody
): Promise<PlaylistSnapshotResponse> => {
  return new Promise((r) => {
    setTimeout(() => {
      r({
        snapshot_id: "snapshot-id",
      });
    }, STANDARD_TIME_OUT);
  });
};

export default {
  GET_USER_SAVED_TRACKS_LIMIT,
  MAX_ITEMS_ADD_TO_PLAYLIST,
  getUserProfile,
  getUserSavedTracks,
  createPlaylist,
  addItemsToPlaylist,
} satisfies SpotfiyApi;
