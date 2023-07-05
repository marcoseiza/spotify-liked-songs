import {
  type Component,
  Match,
  Switch,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";

import { useAccessToken } from "./AccessTokenProvider";
import ImplApi, { SpotfiyApi } from "./api/spotify-api";
import MockApi from "./api/__mock__/spotify-api";
import SpotifyLogin from "./SpotifyLogin";
import { ProcessLoader } from "./components/ProcessLoader";
import { UserProfileCard } from "./components/UserProfileCard";
import { PlaylistCard } from "./components/PlaylistCard";
import { Playlistify, usePlaylistifyProcess } from "./Playlistify";
import { CaretDown, CaretUp } from "phosphor-solid";

const { getUserProfile, getUserSavedTracks }: SpotfiyApi =
  import.meta.env.VITE_API_VERSION === "Impl" ? ImplApi : MockApi;

const App: Component = () => {
  const [tokenInfo] = useAccessToken();

  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });

  const [savedSongs] = createResource(
    accessToken,
    async (accessToken: string) => {
      return getUserSavedTracks(accessToken, 0, 1);
    }
  );

  const [userProfile] = createResource(accessToken, getUserProfile);

  const [playlistifyProcess] = usePlaylistifyProcess();

  const [expandOptionDrawer, setExpendOptionDrawer] = createSignal(false);

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
              displayName={userProfile()?.display_name || userProfile()?.id!}
              profileSrc={userProfile()?.images?.at(1)?.url!}
              numberOfSavedSongs={savedSongs()?.total!}
            />
            <Switch>
              <Match when={playlistifyProcess().state === "unresolved"}>
                <Playlistify
                  userId={userProfile()?.id!}
                  totalSongs={savedSongs()?.total!}
                />
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
                  coverArtSrc={
                    playlistifyProcess().asReady().value?.images?.at(1)?.url
                  }
                  href={
                    playlistifyProcess().asReady().value?.external_urls.spotify
                  }
                />
              </Match>
            </Switch>
          </div>
          <div class="absolute inset-x-0 bottom-0">
            <div
              class="card bg-base-200 shadow-xl absolute top-3 inset-x-3 transition-transform duration-500 delay-100"
              classList={{
                "-translate-y-[calc(100%+1.5em)]": expandOptionDrawer(),
              }}
            >
              <div
                class="flex bg-base-200 absolute left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 overflow-hidden"
                classList={{
                  "rounded-b-none": expandOptionDrawer(),
                  "bottom-[calc(100%+2em)]": !expandOptionDrawer(),
                  "bottom-full": expandOptionDrawer(),
                }}
              >
                <button
                  type="button"
                  class="btn btn-ghost btn-md btn-square no-animation swap rounded-full transition-all"
                  classList={{
                    "rounded-b-none": expandOptionDrawer(),
                    "swap-active": expandOptionDrawer(),
                  }}
                  onClick={() => setExpendOptionDrawer((p) => !p)}
                >
                  <CaretUp size={24} weight="bold" class="swap-off" />
                  <CaretDown size={24} weight="bold" class="swap-on" />
                </button>
              </div>
              <div class="card-body">
                <h3>Test</h3>
              </div>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
