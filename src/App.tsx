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
import { BottomDrawer } from "./components/BottomDrawer";

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
          <BottomDrawer>
            <h3>Test</h3>
          </BottomDrawer>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
