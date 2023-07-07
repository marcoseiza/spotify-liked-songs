import {
  type Component,
  Match,
  Switch,
  createMemo,
  createResource,
  Suspense,
  createEffect,
  Show,
  createSignal,
  onCleanup,
} from "solid-js";

import { createStore } from "solid-js/store";

import { useAccessToken } from "./AccessTokenProvider";
import ImplApi, { SpotfiyApi } from "./api/spotify-api";
import MockApi from "./api/__mock__/spotify-api";
import SpotifyLogin from "./SpotifyLogin";
import { ProcessLoader } from "./components/ProcessLoader";
import { UserProfileCard } from "./components/UserProfileCard";
import { PlaylistCard } from "./components/PlaylistCard";
import { Playlistify, usePlaylistifyProcess } from "./Playlistify";
import { BottomDrawer } from "./components/BottomDrawer";
import dateformat from "dateformat";
import { ArrowClockwise, CaretLeft, WarningCircle } from "phosphor-solid";
import { unresolved } from "./helpers";

const { getUserProfile, getUserSavedTracks, getPlaylistCoverArt }: SpotfiyApi =
  import.meta.env.VITE_API_VERSION === "Impl" ? ImplApi : MockApi;

const App: Component = () => {
  const [tokenInfo] = useAccessToken();

  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });

  const [userProfile] = createResource(accessToken, getUserProfile);

  const [playlistifyProcess, setPlaylistifyProcess] = usePlaylistifyProcess();

  const [previousPlaylistCoverArt, setPreviousPlaylistCoverArt] =
    createSignal<string>();
  const [playlistCoverArt, { refetch: refetchCoverArt }] = createResource(
    playlistifyProcess,
    async (process) => {
      if (process.state !== "ready" || !accessToken()) return undefined;
      const coverArtImages = await getPlaylistCoverArt(
        accessToken()!,
        process.value.id
      );
      return coverArtImages.at(0)?.url;
    }
  );

  createEffect(() => {
    if (
      !playlistCoverArt() ||
      playlistCoverArt() === previousPlaylistCoverArt()
    )
      return;
    setPreviousPlaylistCoverArt(playlistCoverArt());
    const timeout = setTimeout(() => refetchCoverArt(), 1000);
    onCleanup(() => clearTimeout(timeout));
  });

  const defaultPlaylistName = `Saved Songs ${dateformat(
    Date.now(),
    "d-m-yyyy"
  )}`;

  const [optionsStore, setOptionsStore] = createStore<{
    playlistName: string;
    numberOfSongs: number;
  }>({
    playlistName: defaultPlaylistName,
    numberOfSongs: 0,
  });

  const [savedSongs] = createResource(accessToken, async (accessToken) => {
    return getUserSavedTracks(accessToken, 0, 1);
  });

  createEffect(() => {
    if (savedSongs()?.total)
      setOptionsStore("numberOfSongs", savedSongs()?.total!);
  });

  const validOptions = createMemo(() => {
    let valid = true;

    const playlistNameValid = (() => {
      if (optionsStore.playlistName.length == 0) {
        valid = false;
        return { valid: false, error: "Playlist Name cannot be empty" };
      }
      return { valid: true };
    })();
    const numberOfSongsValid = (() => {
      if (
        optionsStore.numberOfSongs < 0 ||
        optionsStore.numberOfSongs > (savedSongs()?.total || Infinity)
      ) {
        valid = false;
        return {
          valid: false,
          error: `Number must be greater than 0 and less than ${
            savedSongs()?.total
          }`,
        };
      }
      return { valid: true };
    })();

    return {
      valid,
      params: {
        playlistName: playlistNameValid,
        numberOfSongs: numberOfSongsValid,
      },
    };
  });

  return (
    <div class="h-[100svh] overflow-hidden">
      <Switch>
        <Match when={!tokenInfo()}>
          <div class="flex items-center justify-center h-full">
            <SpotifyLogin />
          </div>
        </Match>
        <Match when={tokenInfo()}>
          <div class="flex flex-col gap-8 items-center justify-center h-full">
            <UserProfileCard
              displayName={userProfile()?.display_name || userProfile()?.id!}
              profileSrc={userProfile()?.images?.at(1)?.url!}
              numberOfSavedSongs={savedSongs()?.total!}
            />
            <Switch>
              <Match when={playlistifyProcess().state === "unresolved"}>
                <div class="flex flex-col items-center gap-3">
                  <Playlistify
                    userId={userProfile()?.id!}
                    totalSongs={optionsStore.numberOfSongs}
                    playlistName={optionsStore.playlistName}
                    disabled={!validOptions().valid}
                  />
                  <Show when={!validOptions().valid}>
                    <div class="flex gap-2 text-error">
                      <WarningCircle size={24} />
                      <span class="text-error">Error in options</span>
                    </div>
                  </Show>
                </div>
                <BottomDrawer>
                  {(expanded) => (
                    <Suspense fallback={<div>Loading...</div>}>
                      <h1 class="text-lg">Playlistify Options</h1>
                      <div class="form-control w-full max-w-xs">
                        <label class="label">
                          <span class="label-text">Playlist Name</span>
                        </label>
                        <div class="flex gap-3 items-center">
                          <input
                            type="text"
                            placeholder="Type here"
                            value={optionsStore.playlistName}
                            onInput={(e) =>
                              setOptionsStore("playlistName", e.target.value)
                            }
                            class="input input-bordered w-full max-w-xs"
                            classList={{
                              "input-error":
                                !validOptions().params.playlistName.valid,
                            }}
                            tabindex={!expanded ? -1 : undefined}
                          />
                          <Show
                            when={
                              optionsStore.playlistName !== defaultPlaylistName
                            }
                          >
                            <div class="tooltip" data-tip="Reset name">
                              <button
                                type="button"
                                class="btn btn-md btn-square btn-ghost"
                                onClick={() =>
                                  setOptionsStore(
                                    "playlistName",
                                    defaultPlaylistName
                                  )
                                }
                              >
                                <ArrowClockwise size={24} weight="bold" />
                              </button>
                            </div>
                          </Show>
                        </div>
                        <label class="label pb-0">
                          <span class="label-text-alt text-error">
                            {validOptions().params.playlistName.error}&ensp;
                          </span>
                        </label>
                      </div>
                      <div class="form-control w-full max-w-xs">
                        <label class="label pt-0">
                          <span class="label-text">Number of songs</span>
                        </label>
                        <div class="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max={savedSongs()?.total}
                            value={optionsStore.numberOfSongs}
                            onInput={(e) =>
                              setOptionsStore(
                                "numberOfSongs",
                                e.target.value as unknown as number
                              )
                            }
                            class="range flex-grow"
                            step={1}
                            tabindex={!expanded ? -1 : undefined}
                          />
                          <input
                            type="number"
                            value={optionsStore.numberOfSongs}
                            onInput={(e) =>
                              setOptionsStore(
                                "numberOfSongs",
                                e.target.value as unknown as number
                              )
                            }
                            class="input input-ghost hide-arrows w-16"
                            step={1}
                            tabindex={!expanded ? -1 : undefined}
                          />
                        </div>
                        <div class="w-full flex justify-between text-xs px-2 pr-[4.7rem]">
                          <div class="flex flex-col gap-1 items-center">
                            <span>|</span>
                            <span>0</span>
                          </div>
                          <div class="flex flex-col items-center">
                            <span>|</span>
                            <span>{savedSongs()?.total}</span>
                          </div>
                        </div>
                        <label class="label">
                          <span class="label-text-alt text-error">
                            {validOptions().params.numberOfSongs.error}&ensp;
                          </span>
                        </label>
                      </div>
                    </Suspense>
                  )}
                </BottomDrawer>
              </Match>
              <Match when={playlistifyProcess().state === "pending"}>
                <ProcessLoader
                  process={playlistifyProcess()}
                  showStatus={false}
                />
              </Match>
              <Match when={playlistifyProcess().state === "ready"}>
                <PlaylistCard
                  name={playlistifyProcess().asReady().value?.name}
                  coverArtSrc={playlistCoverArt() || ""}
                  href={
                    playlistifyProcess().asReady().value?.external_urls.spotify
                  }
                  onCoverArtLoadError={refetchCoverArt}
                />
                <button
                  type="button"
                  class="btn btn-primary w-90"
                  onClick={() => setPlaylistifyProcess(unresolved())}
                >
                  <CaretLeft size={24} weight="bold" />
                  Back
                </button>
              </Match>
            </Switch>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
