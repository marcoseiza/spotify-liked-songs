import {
  Accessor,
  Component,
  ParentComponent,
  Setter,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";

import { Playlist } from "phosphor-solid";
import { Process, fromPrevious, pending, ready, unresolved } from "./helpers";
import dateformat from "dateformat";
import ImplApi, { SpotfiyApi } from "./api/spotify-api";
import MockApi from "./api/__mock__/spotify-api";
import { CreatePlaylistResponse } from "./api/spotify-api-types";
import playlistCoverArtBase64Encoded from "./assets/playlist-cover-art-base64.json";
import { useAccessToken } from "./AccessTokenProvider";

const {
  createPlaylist,
  MAX_ITEMS_ADD_TO_PLAYLIST,
  getUserSavedTracks,
  GET_USER_SAVED_TRACKS_LIMIT,
  addItemsToPlaylist,
  addCustomPlaylistCoverImage,
}: SpotfiyApi = import.meta.env.VITE_API_VERSION === "Impl" ? ImplApi : MockApi;

export type PlaylistifyContextValue = [
  process: Accessor<Process<CreatePlaylistResponse>>,
  setProcess: Setter<Process<CreatePlaylistResponse>>
];
const PlaylistifyContext = createContext<PlaylistifyContextValue>([
  () => unresolved(),
  <U extends Process<CreatePlaylistResponse>>(
    _: Exclude<U, Function> | ((prev: Process<CreatePlaylistResponse>) => U)
  ) => unresolved() as U,
]);

export const PlaylistifyProvider: ParentComponent<{}> = (props) => {
  const [process, setProcess] = createSignal<Process<CreatePlaylistResponse>>(
    unresolved()
  );

  return (
    <PlaylistifyContext.Provider value={[process, setProcess]}>
      {props.children}
    </PlaylistifyContext.Provider>
  );
};

export const usePlaylistifyProcess = () => {
  return useContext(PlaylistifyContext);
};

interface PlaylistifyProps {
  userId: string;
  totalSongs: number;
  playlistName: string;
  disabled?: boolean;
}

export const Playlistify: Component<PlaylistifyProps> = (props) => {
  const [tokenInfo] = useAccessToken();
  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });
  const [, setProcess] = usePlaylistifyProcess();

  const handlePlaylistifySavedSongs = async () => {
    if (!props.userId || !props.totalSongs || !accessToken()) return;
    setProcess(pending({ status: "Creating PLaylist", progress: 0 }));

    const newPlaylist = await createPlaylist(accessToken()!, props.userId, {
      name: props.playlistName,
    });

    let currentOffset = 0;

    const songsToAdd = Array<string>(MAX_ITEMS_ADD_TO_PLAYLIST);
    let lastSongIndex = 0;

    while (currentOffset < props.totalSongs) {
      setProcess(
        fromPrevious().pending({
          status: `Fetching saved songs batch`,
        })
      );

      const savedSongsInfo = await getUserSavedTracks(
        accessToken()!,
        currentOffset,
        Math.min(GET_USER_SAVED_TRACKS_LIMIT, props.totalSongs - currentOffset)
      );

      const savedSongs = savedSongsInfo.items;
      currentOffset += GET_USER_SAVED_TRACKS_LIMIT;
      currentOffset = Math.min(currentOffset, props.totalSongs);

      for (let i = 0; i < savedSongs.length; i++) {
        songsToAdd[i + lastSongIndex] = savedSongs[i].track.uri;
      }

      lastSongIndex += savedSongs.length;

      setProcess(
        fromPrevious().pending({
          progress: (100 * currentOffset) / props.totalSongs,
        })
      );

      if (
        lastSongIndex === MAX_ITEMS_ADD_TO_PLAYLIST ||
        savedSongs.length < GET_USER_SAVED_TRACKS_LIMIT
      ) {
        const songList = songsToAdd.slice(0, lastSongIndex);

        setProcess(
          fromPrevious().pending({
            status: `Adding saved songs to playlist`,
          })
        );

        await addItemsToPlaylist(accessToken()!, newPlaylist.id, {
          uris: songList,
          position: Math.max(currentOffset - MAX_ITEMS_ADD_TO_PLAYLIST, 0),
        });

        lastSongIndex = 0;
      }
    }

    await addCustomPlaylistCoverImage(
      accessToken()!,
      newPlaylist.id,
      playlistCoverArtBase64Encoded
    );

    setProcess(ready({ value: newPlaylist }));
  };

  return (
    <button
      class="btn btn-primary w-90"
      type="button"
      onClick={handlePlaylistifySavedSongs}
      disabled={props.disabled || false}
    >
      <Playlist size={28} />
      Playlistify your saved songs
    </button>
  );
};
