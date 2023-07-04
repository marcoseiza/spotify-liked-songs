import { Component, onMount } from "solid-js";
import {
  fetchTokenInfo,
  generateCodeChallenge,
  generateRandomString,
  redirectToSpotifyLogin,
} from "./api/spotify-auth";
import { useAccessToken } from "./AccessTokenProvider";
import { useSearchParams, useNavigate } from "@solidjs/router";

const SpotifyLogin: Component = () => {
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

  return <button onClick={handleLoginWithSpotify}>Login With Spotify</button>;
};

export default SpotifyLogin;
