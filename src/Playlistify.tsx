import {
  Accessor,
  Component,
  Match,
  ParentComponent,
  Setter,
  Switch,
  createContext,
  createResource,
  createSignal,
  useContext,
} from "solid-js";

import { Playlist } from "phosphor-solid";
import {
  Process,
  errored,
  fromPrevious,
  pending,
  ready,
  unresolved,
} from "./helpers";
import SpotifyApi from "./api/spotify-api";
import { CreatePlaylistResponse } from "./api/spotify-api-types";
import { useAccessToken } from "./AccessTokenProvider";
import { ProcessLoader } from "./components/ProcessLoader";
import { useNavigate } from "@solidjs/router";

export type PlaylistifyContextValue = [
  process: Accessor<Process<CreatePlaylistResponse>>,
  actions: {
    playlistify: (
      accessToken: string,
      userId: string,
      totalSongs: number,
      playlistName: string
    ) => Promise<void>;
    reset: () => void;
    abort: () => void;
  }
];
const PlaylistifyContext = createContext<PlaylistifyContextValue>([
  () => unresolved(),
  {
    playlistify: async () => {},
    reset: () => {},
    abort: () => {},
  },
]);

export const PlaylistifyProvider: ParentComponent<{}> = (props) => {
  const [process, setProcess] = createSignal<Process<CreatePlaylistResponse>>(
    unresolved()
  );

  const [abortController, setAbortController] = createSignal(
    new AbortController()
  );

  const playlistify = async (
    accessToken: string,
    userId: string,
    totalSongs: number,
    playlistName: string
  ) => {
    setAbortController(new AbortController());

    setProcess(pending({ status: "Creating PLaylist", progress: 0 }));

    const newPlaylist = await SpotifyApi.createPlaylist(
      accessToken,
      userId,
      {
        name: playlistName,
      },
      { signal: abortController().signal }
    );

    let currentOffset = 0;

    const songsToAdd = Array<string>(SpotifyApi.MAX_ITEMS_ADD_TO_PLAYLIST);
    let lastSongIndex = 0;

    while (currentOffset < totalSongs) {
      setProcess(
        fromPrevious().pending({
          status: `Fetching saved songs batch`,
        })
      );

      const savedSongsInfo = await SpotifyApi.getUserSavedTracks(
        accessToken,
        currentOffset,
        Math.min(
          SpotifyApi.GET_USER_SAVED_TRACKS_LIMIT,
          totalSongs - currentOffset
        ),
        { signal: abortController().signal }
      );

      const savedSongs = savedSongsInfo.items;
      currentOffset += SpotifyApi.GET_USER_SAVED_TRACKS_LIMIT;
      currentOffset = Math.min(currentOffset, totalSongs);

      for (let i = 0; i < savedSongs.length; i++) {
        songsToAdd[i + lastSongIndex] = savedSongs[i].track.uri;
      }

      lastSongIndex += savedSongs.length;

      setProcess(
        fromPrevious().pending({
          progress: (100 * currentOffset) / totalSongs,
        })
      );

      if (
        lastSongIndex === SpotifyApi.MAX_ITEMS_ADD_TO_PLAYLIST ||
        savedSongs.length < SpotifyApi.GET_USER_SAVED_TRACKS_LIMIT
      ) {
        const songList = songsToAdd.slice(0, lastSongIndex);

        setProcess(
          fromPrevious().pending({
            status: `Adding saved songs to playlist`,
          })
        );

        await SpotifyApi.addItemsToPlaylist(
          accessToken,
          newPlaylist.id,
          {
            uris: songList,
            position: Math.max(
              currentOffset - SpotifyApi.MAX_ITEMS_ADD_TO_PLAYLIST,
              0
            ),
          },
          { signal: abortController().signal }
        );

        lastSongIndex = 0;
      }
    }

    setProcess(ready({ value: newPlaylist }));
  };

  return (
    <PlaylistifyContext.Provider
      value={[
        process,
        {
          playlistify,
          reset: () => setProcess(unresolved()),
          abort: () => abortController().abort(),
        },
      ]}
    >
      {props.children}
    </PlaylistifyContext.Provider>
  );
};

export const usePlaylistifyProcess = () => {
  return useContext(PlaylistifyContext);
};

interface PlaylistifyProps {
  totalSongs: number;
  playlistName: string;
  disabled?: boolean;
}

export const Playlistify: Component<PlaylistifyProps> = (props) => {
  const accessToken = useAccessToken();

  const [userProfile] = createResource(accessToken, (accessToken) =>
    SpotifyApi.getUserProfile(accessToken)
  );

  const [, { playlistify }] = usePlaylistifyProcess();

  const navigate = useNavigate();

  const handlePlaylistifySavedSongs = () => {
    if (!userProfile()?.id || !accessToken()) return;
    playlistify(
      accessToken()!,
      userProfile()!.id,
      props.totalSongs,
      props.playlistName
    );
    navigate("/loading");
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
