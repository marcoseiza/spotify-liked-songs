import {
  onMount,
  type Component,
  Show,
  Match,
  Switch,
  splitProps,
  createEffect,
  createMemo,
} from "solid-js";

import styles from "./App.module.css";
import { useAccessToken } from "./AccessTokenProvider";
import { useNavigate, useSearchParams } from "@solidjs/router";
import {
  fetchTokenInfo,
  generateCodeChallenge,
  generateRandomString,
  redirectToSpotifyLogin,
} from "./api/spotify_auth";

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

  return (
    <div class={styles.App}>
      <Switch>
        <Match when={!tokenInfo()}>
          <button onClick={handleLoginWithSpotify}>Login with spotify</button>
        </Match>
        <Match when={tokenInfo()}>
          <h3>You are logged in</h3>
          <p>AccessToken: {accessToken()}</p>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
