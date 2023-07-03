import {
  onMount,
  type Component,
  Match,
  Switch,
  createMemo,
  createResource,
  createSignal,
  Suspense,
  Index,
  Accessor,
} from "solid-js";

import styles from "./App.module.css";
import { useAccessToken } from "./AccessTokenProvider";
import { useNavigate, useSearchParams } from "@solidjs/router";
import {
  fetchTokenInfo,
  generateCodeChallenge,
  generateRandomString,
  redirectToSpotifyLogin,
} from "./api/spotify-auth";
import { getUserSavedTracks } from "./api/spotify-api";
import type { ExtractAccessorType } from "./helpers";
import { SavedTrackObject } from "./api/spotify-api-types";

const App: Component = () => {
  const [tokenInfo, setTokenInfo] = useAccessToken();

  onMount(async () => {
    if (tokenInfo()) return;

    const [params] = useSearchParams();
    if (!params.code || !params.state) return;

    const state = localStorage.getItem("spotify-login-state");

    const navigate = useNavigate();

    if (state !== params.state) {
      console.error("state is not equal");
      navigate("/");
      return;
    }

    localStorage.removeItem("spotify-login-state");

    const codeVerifier = localStorage.getItem("spotify-code-verifier");

    if (!codeVerifier) return;

    setTokenInfo(await fetchTokenInfo(params.code, codeVerifier));
  });

  const handleLoginWithSpotify = async () => {
    const state = crypto.getRandomValues(new Uint32Array(10)).toString();

    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("spotify-code-verifier", codeVerifier);
    localStorage.setItem("spotify-login-state", state);

    redirectToSpotifyLogin(state, codeChallenge);
  };

  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });

  const [currentOffset, setCurrentOffset] = createSignal<number>(0);

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

  return (
    <div class={styles.App}>
      <Switch>
        <Match when={!tokenInfo()}>
          <button onClick={handleLoginWithSpotify}>Login with spotify</button>
        </Match>
        <Match when={tokenInfo()}>
          <Suspense fallback={<div>Loading...</div>}>
            <Index
              each={likedSongs()?.items}
              fallback={<div>Error showing liked songs</div>}
            >
              {(item: Accessor<SavedTrackObject>) => (
                <div>{item().track.name}</div>
              )}
            </Index>
          </Suspense>
          <button onClick={() => setCurrentOffset((p) => Math.max(p - 20, 0))}>
            previous
          </button>
          <button
            onClick={() =>
              setCurrentOffset((p) =>
                Math.min(likedSongs()?.total || Infinity, p + 20)
              )
            }
          >
            next
          </button>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
