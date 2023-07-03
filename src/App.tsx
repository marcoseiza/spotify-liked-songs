import { onMount, type Component, Show } from "solid-js";

import styles from "./App.module.css";
import { useAccessToken } from "./AccessTokenProvider";
import { useNavigate, useSearchParams } from "@solidjs/router";
import {
  fetchAccessToken,
  generateCodeChallenge,
  generateRandomString,
  redirectToSpotifyLogin,
} from "./api/spotify_auth";

const App: Component = () => {
  const [accessToken, setAccessToken] = useAccessToken();

  onMount(async () => {
    if (accessToken()) return;

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

    setAccessToken(await fetchAccessToken(params.code, codeVerifier));
  });

  const handleLoginWithSpotify = async () => {
    const state = crypto.getRandomValues(new Uint32Array(10)).toString();
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("spotify-code-verifier", codeVerifier);
    localStorage.setItem("spotify-login-state", state);
    redirectToSpotifyLogin(state, codeChallenge);
  };

  return (
    <div class={styles.App}>
      <Show when={!accessToken()}>
        <button onClick={handleLoginWithSpotify}>Login with spotify</button>
      </Show>
    </div>
  );
};

export default App;
