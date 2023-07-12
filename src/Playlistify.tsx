import {
  Accessor,
  Component,
  ParentComponent,
  createContext,
  createResource,
  createSignal,
  useContext,
} from "solid-js";

import { useNavigate } from "@solidjs/router";
import { IconPlaylist } from "@tabler/icons-solidjs";
import { useAccessToken } from "./AccessTokenProvider";
import SpotifyApi, { scopeError } from "./api/spotify-api";
import { CreatePlaylistResponse } from "./api/spotify-api-types";
import {
  Process,
  errored,
  fromPrevious,
  pending,
  ready,
  unresolved,
} from "./helpers";

export const PlaylistifyPeriods = {
  LastDay: "LastDay",
  LastMonth: "LastMonth",
  LastYear: "LastYear",
  AllTime: "AllTime",
} as const;
export type PlaylistifyPeriods = keyof typeof PlaylistifyPeriods;

export const calculateDateTimeLimitFromPeriod = (
  period: PlaylistifyPeriods
) => {
  const date = new Date();
  switch (period) {
    case "LastDay":
      const day = 86400000; // Number of milliseconds in a day.
      date.setTime(Date.now() - day);
      break;
    case "LastMonth":
      date.setMonth(new Date().getMonth() - 1);
      break;
    case "LastYear":
      date.setFullYear(new Date().getFullYear() - 1);
      break;
    case "AllTime":
      date.setTime(0);
      break;
  }
  return date.getTime();
};

export type PlaylistifyContextValue = [
  process: Accessor<Process<CreatePlaylistResponse>>,
  actions: {
    playlistify: (
      accessToken: string,
      userId: string,
      totalSongs: number,
      period: PlaylistifyPeriods,
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
    period: PlaylistifyPeriods,
    playlistName: string
  ) => {
    setAbortController(new AbortController());

    setProcess(pending({ status: "Creating PLaylist", progress: 0 }));

    const dateTimeLimit = calculateDateTimeLimitFromPeriod(period);
    let lastSavedSongDate = Date.now();
    let firstSongDate = Date.now();
    let currentOffset = 0;

    const songsToAdd = new Array<string>(totalSongs);
    let lastSongIndex = 0;

    // Fetch songs up until time limit.
    while (lastSavedSongDate > dateTimeLimit && currentOffset < totalSongs) {
      const savedSongListInfoAction = await scopeError(
        SpotifyApi.getUserSavedTracks(
          accessToken,
          currentOffset,
          Math.min(
            SpotifyApi.GET_USER_SAVED_TRACKS_LIMIT,
            totalSongs - currentOffset
          ),
          { signal: abortController().signal }
        )
      );
      if (!savedSongListInfoAction.ok) {
        setProcess(errored(savedSongListInfoAction.error));
        return;
      }
      const savedSongInfoList = savedSongListInfoAction.value;

      const savedSongList = savedSongInfoList.items;
      currentOffset += SpotifyApi.GET_USER_SAVED_TRACKS_LIMIT;
      currentOffset = Math.min(currentOffset, totalSongs);

      lastSavedSongDate = new Date(savedSongList[0].added_at).getTime();

      if (lastSongIndex === 0)
        firstSongDate = new Date(savedSongList[0].added_at).getTime();

      for (
        let i = 0;
        i < savedSongList.length && lastSavedSongDate > dateTimeLimit;
        i++
      ) {
        songsToAdd[lastSongIndex++] = savedSongList[i].track.uri;
        lastSavedSongDate = new Date(savedSongList[i].added_at).getTime();

        setProcess(
          fromPrevious().pending({
            progress:
              Math.max(
                (firstSongDate - lastSavedSongDate) /
                  (firstSongDate - dateTimeLimit),
                0
              ) * 50,
          })
        );
      }
    }

    setProcess(fromPrevious().pending({ progress: 50 }));

    if (lastSongIndex === 0) {
      setProcess(errored(`No songs to add in period - ${period}`));
      return;
    }

    const newPlaylistAction = await scopeError(
      SpotifyApi.createPlaylist(
        accessToken,
        userId,
        {
          name: playlistName,
        },
        { signal: abortController().signal }
      )
    );
    if (!newPlaylistAction.ok) {
      setProcess(errored(newPlaylistAction.error));
      return;
    }
    const newPlaylist = newPlaylistAction.value;

    for (
      let i = 0;
      i < lastSongIndex;
      i += Math.min(SpotifyApi.MAX_ITEMS_ADD_TO_PLAYLIST, lastSongIndex - i)
    ) {
      setProcess(
        fromPrevious().pending({ progress: 50 + (i / lastSongIndex) * 50 })
      );

      const addItemsToPlaylistAction = await scopeError(
        SpotifyApi.addItemsToPlaylist(
          accessToken,
          newPlaylist.id,
          {
            uris: songsToAdd.slice(
              i,
              Math.min(i + SpotifyApi.MAX_ITEMS_ADD_TO_PLAYLIST, lastSongIndex)
            ),
            position: i,
          },
          { signal: abortController().signal }
        )
      );

      if (!addItemsToPlaylistAction.ok) {
        setProcess(errored(addItemsToPlaylistAction.error));
        return;
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
  playlistName: string;
  period: PlaylistifyPeriods;
  disabled?: boolean;
}

export const Playlistify: Component<PlaylistifyProps> = (props) => {
  const accessToken = useAccessToken();

  const [totalSongs] = createResource(
    accessToken,
    async (accessToken) =>
      (await SpotifyApi.getUserSavedTracks(accessToken, 0, 1)).total
  );

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
      totalSongs() || 0,
      props.period,
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
      <IconPlaylist size={24} stroke-width={2} />
      Playlistify your saved songs
    </button>
  );
};
