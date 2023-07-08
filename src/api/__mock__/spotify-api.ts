import {
  AddItemsToPlaylistBody,
  CreatePlaylistBody,
  CreatePlaylistResponse,
  ImageObject,
  PlaylistSnapshotResponse,
  SavedTrackObject,
  TrackObjectFull,
  UserProfileResponse,
  UsersSavedTracksResponse,
} from "../spotify-api-types";
import toast from "../../helpers/custom-toast";

const STANDARD_TIME_OUT = 100;

const performTimeout = <T extends any>(
  value: T,
  opts?: Partial<{
    shouldReject: boolean;
    timeout: number;
    signal: AbortSignal;
  }>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const rejectWrapper = (e?: any) => {
      toast.error(`Mock Error: ${e}`);
      reject();
    };
    setTimeout(() => {
      opts?.signal?.aborted || false
        ? rejectWrapper("Abort Error")
        : opts?.shouldReject || false
        ? rejectWrapper()
        : resolve(value);
    }, opts?.timeout || STANDARD_TIME_OUT);
  });
};

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

const getUserProfile = async (
  _accessToken: string,
  options?: { signal: AbortSignal }
): Promise<UserProfileResponse> => {
  return performTimeout(userProfile, { signal: options?.signal });
};

const GET_USER_SAVED_TRACKS_LIMIT = 50;
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

const getUserSavedTracks = async (
  _accessToken: string,
  currentOffset: number,
  _limit: number = GET_USER_SAVED_TRACKS_LIMIT,
  options?: { signal: AbortSignal }
): Promise<UsersSavedTracksResponse> => {
  return performTimeout(makeUsersSavedTracksResponse(currentOffset), {
    signal: options?.signal,
  });
};

const makeMockPlaylist = (name: string) =>
  ({
    id: "playlist-id",
    external_urls: { spotify: "link" },
    name,
    images: [
      { url: "" },
      {
        url: "https://placehold.co/400",
      },
    ],
  } satisfies Pick<
    CreatePlaylistResponse,
    "id" | "external_urls" | "name" | "images"
  > as CreatePlaylistResponse);

const createPlaylist = async (
  _accessToken: string,
  _userId: string,
  body: CreatePlaylistBody,
  options?: { signal: AbortSignal }
): Promise<CreatePlaylistResponse> => {
  return performTimeout(makeMockPlaylist(body.name), {
    signal: options?.signal,
  });
};

const mockPlaylistCoverArt = [
  { url: "" },
  {
    url: "https://placehold.co/400",
  },
];

const getPlaylistCoverArt = async (
  _accessToken: string,
  _playlistId: string,
  options?: { signal: AbortSignal }
): Promise<ImageObject[]> => {
  return performTimeout(mockPlaylistCoverArt, { signal: options?.signal });
};

const MAX_ITEMS_ADD_TO_PLAYLIST = 100;
const addItemsToPlaylist = async (
  _accessToken: string,
  _playlistId: string,
  _body: AddItemsToPlaylistBody,
  options?: { signal: AbortSignal }
): Promise<PlaylistSnapshotResponse> => {
  return performTimeout(
    {
      snapshot_id: "snapshot-id",
    },
    { signal: options?.signal, shouldReject: true }
  );
};

const addCustomPlaylistCoverImage = async (
  _accessToken: string,
  _playlistId: string,
  _imageBase64Encoded: string,
  options?: { signal: AbortSignal }
): Promise<void> => {
  return performTimeout(undefined, { signal: options?.signal });
};

export default {
  GET_USER_SAVED_TRACKS_LIMIT,
  MAX_ITEMS_ADD_TO_PLAYLIST,
  getUserProfile,
  getUserSavedTracks,
  createPlaylist,
  getPlaylistCoverArt,
  addItemsToPlaylist,
  addCustomPlaylistCoverImage,
};
