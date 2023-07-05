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
  getProgress,
  fromPrevious,
  ready,
} from "./helpers";
import SpotifyLogin from "./SpotifyLogin";
import dateformat from "dateformat";
import { createTween } from "@solid-primitives/tween";
import { ArrowUpRight, Playlist } from "phosphor-solid";
import { CreatePlaylistResponse } from "./api/spotify-api-types";

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
  const progress = createMemo(() => getProgress(playlistifying()));
  const progressTweened = createTween(progress, { duration: 500 });
  const progressTweenedRounded = createMemo(() =>
    Math.round(progressTweened())
  );

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
            <div class="card w-80 bg-base-200 shadow-xl">
              <div class="card-body p-6 flex-row items-center gap-8">
                <Suspense
                  fallback={<div class="skeleton w-20 h-20 rounded-full" />}
                >
                  <img
                    src={userProfile()?.images?.at(1)?.url || ""}
                    class="h-20 w-20 rounded-full"
                  />
                </Suspense>
                <div class="flex flex-col">
                  <Suspense
                    fallback={
                      <div class="skeleton w-32 h-4 rounded-full mb-2" />
                    }
                  >
                    <h2 class="text-lg">{userProfile()?.display_name}</h2>
                  </Suspense>
                  <Suspense
                    fallback={<div class="skeleton w-24 h-4 rounded-full" />}
                  >
                    <p class="text-sm">
                      {likedSongs()?.total}{" "}
                      <span class="text-neutral-500">saved songs</span>
                    </p>
                  </Suspense>
                </div>
              </div>
            </div>
            <Switch>
              <Match when={playlistifying().state === "unresolved"}>
                <button
                  class="btn btn-primary"
                  onClick={handlePlaylistifyLikedSongs}
                >
                  <Playlist size={28} />
                  Playlistify your liked songs
                </button>
              </Match>
              <Match when={playlistifying().state === "pending"}>
                <div class="card w-80 bg-base-200 shadow-xl">
                  <div class="card-body flex-col items-center p-6 text-primary">
                    <div
                      class="radial-progress"
                      style={{
                        "--value": progressTweenedRounded(),
                        "--size": "4em",
                      }}
                    >
                      {progressTweenedRounded()}%
                    </div>
                    <h3 class="text-base">
                      {playlistifying().asPending().status}
                    </h3>
                  </div>
                </div>
              </Match>
              <Match when={playlistifying().state === "ready"}>
                <div class="card w-80 bg-base-200 shadow-xl">
                  <div class="card-body p-6">
                    <div class="placeholder">
                      <div class="bg-neutral-focus text-neutral-content w-full aspect-square relative mb-1">
                        <img
                          class="absolute inset-0"
                          src={
                            playlistifying().asReady().value?.images?.at(1)
                              ?.url ||
                            "https://i.scdn.co/image/ab6775700000ee8575c9f0df7df5e06f6ceb59d3"
                          }
                        />
                      </div>
                    </div>
                    <h3 class="text-base mb-3">
                      {playlistifying().asReady().value?.name}
                    </h3>
                    <a
                      href={
                        playlistifying().asReady().value?.external_urls.spotify
                      }
                      class="btn btn-primary"
                    >
                      Open Playlist
                      <ArrowUpRight size={28} />
                    </a>
                  </div>
                </div>
              </Match>
            </Switch>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
