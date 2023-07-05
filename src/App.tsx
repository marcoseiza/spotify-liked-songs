import {
  type Component,
  Match,
  Switch,
  createMemo,
  createResource,
  createSignal,
  Suspense,
} from "solid-js";

import { useAccessToken } from "./AccessTokenProvider";
import ImplApi, { SpotfiyApi } from "./api/spotify-api";
import MockApi from "./api/__mock__/spotify-api";
import {
  Process,
  pending,
  unresolved,
  type ExtractAccessorType,
  fromPrevious,
  ready,
} from "./helpers";
import SpotifyLogin from "./SpotifyLogin";
import dateformat from "dateformat";
import { ArrowUpRight, Playlist } from "phosphor-solid";
import { CreatePlaylistResponse } from "./api/spotify-api-types";
import { ProcessLoader } from "./components/ProcessLoader";
import { UserProfileCard } from "./components/UserProfileCard";
import { PlaylistCard } from "./components/PlaylistCard";

const {
  GET_USER_SAVED_TRACKS_LIMIT,
  MAX_ITEMS_ADD_TO_PLAYLIST,
  addItemsToPlaylist,
  createPlaylist,
  getUserProfile,
  getUserSavedTracks,
}: SpotfiyApi = import.meta.env.VITE_API_VERSION === "Impl" ? ImplApi : MockApi;

const App: Component = () => {
  const [tokenInfo] = useAccessToken();

  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });

  const [currentOffset] = createSignal(0);

  const userSavedTrackData = createMemo<[string, number] | undefined>(() => {
    if (!accessToken()) return undefined;
    return [accessToken()!, currentOffset()];
  });

  const [likedSongs] = createResource(
    userSavedTrackData,
    async ([accessToken, currentOffset]: NonNullable<
      ExtractAccessorType<typeof userSavedTrackData>
    >) => {
      return getUserSavedTracks(accessToken, currentOffset);
    }
  );

  const [userProfile] = createResource(accessToken, getUserProfile);

  const [playlistifying, setPlaylistifying] = createSignal<
    Process<CreatePlaylistResponse>
  >(unresolved());

  const handlePlaylistifyLikedSongs = async () => {
    if (!userProfile()?.id || !accessToken() || !likedSongs()) return;
    setPlaylistifying(pending({ status: "Creating PLaylist", progress: 0 }));

    const newPlaylist = await createPlaylist(
      accessToken()!,
      userProfile()!.id,
      {
        name: `Liked Songs ${dateformat(Date.now(), "d-m-yyyy")}`,
      }
    );
    const total = likedSongs()!.total;
    let currentOffset = 0;

    const songsToAdd = Array<string>(MAX_ITEMS_ADD_TO_PLAYLIST);
    let lastSongIndex = 0;

    while (currentOffset < total) {
      setPlaylistifying(
        fromPrevious().pending({
          status: `Fetching saved songs batch`,
        })
      );

      const likedSongsInfo = await getUserSavedTracks(
        accessToken()!,
        currentOffset
      );

      const likedSongs = likedSongsInfo.items;
      currentOffset += GET_USER_SAVED_TRACKS_LIMIT;
      currentOffset = Math.min(currentOffset, likedSongsInfo.total);

      for (let i = 0; i < likedSongs.length; i++) {
        songsToAdd[i + lastSongIndex] = likedSongs[i].track.uri;
      }

      lastSongIndex += likedSongs.length;

      setPlaylistifying(
        fromPrevious().pending({
          progress: (100 * currentOffset) / likedSongsInfo.total,
        })
      );

      if (
        lastSongIndex === MAX_ITEMS_ADD_TO_PLAYLIST ||
        likedSongs.length < GET_USER_SAVED_TRACKS_LIMIT
      ) {
        const songList = songsToAdd.slice(0, lastSongIndex);

        setPlaylistifying(
          fromPrevious().pending({
            status: `Adding saved songs to playlist`,
          })
        );

        await addItemsToPlaylist(accessToken()!, newPlaylist.id, {
          uris: songList,
          position: currentOffset - MAX_ITEMS_ADD_TO_PLAYLIST,
        });

        lastSongIndex = 0;
      }
    }

    setPlaylistifying(ready({ value: newPlaylist }));
  };

  return (
    <div class="h-[100svh]">
      <Switch>
        <Match when={!tokenInfo()}>
          <div class="flex items-center justify-center h-full">
            <SpotifyLogin />
          </div>
        </Match>
        <Match when={tokenInfo()}>
          <div class="flex flex-col gap-8 items-center justify-center h-full">
            <UserProfileCard
              displayName={
                userProfile()?.display_name || userProfile()?.id || ""
              }
              profileSrc={userProfile()?.images?.at(1)?.url || ""}
              numberOfSavedSongs={likedSongs()?.total || 0}
            />
            <Switch>
              <Match when={playlistifying().state === "unresolved"}>
                <button
                  class="btn btn-primary w-80"
                  onClick={handlePlaylistifyLikedSongs}
                >
                  <Playlist size={28} />
                  Playlistify your liked songs
                </button>
              </Match>
              <Match when={playlistifying().state === "pending"}>
                <ProcessLoader process={playlistifying()} showStatus={false} />
              </Match>
              <Match when={playlistifying().state === "ready"}>
                <PlaylistCard
                  name={playlistifying().asReady().value?.name}
                  coverArtSrc={
                    playlistifying().asReady().value?.images?.at(1)?.url
                  }
                  href={playlistifying().asReady().value?.external_urls.spotify}
                />
              </Match>
            </Switch>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
