import { Component, onMount } from "solid-js";
import ImplApi, { SpotifyAuth } from "./api/spotify-auth";
import MockApi from "./api/__mock__/spotify-auth";
import { useAccessToken } from "./AccessTokenProvider";
import { useSearchParams, useNavigate } from "@solidjs/router";
import spotifyLogoWhite from "./assets/spotify-icons/Spotify_Icon_RGB_White.png";
import { generateRandomString, generateCodeChallenge } from "./helpers";

const { fetchTokenInfo, redirectToSpotifyLogin }: SpotifyAuth =
  import.meta.env.VITE_API_VERSION === "Impl" ? ImplApi : MockApi;

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

    navigate("/");
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
    <button class="btn btn-primary " onClick={handleLoginWithSpotify}>
      <img src={spotifyLogoWhite} alt="spotify logo" class="w-5 h-5" />
      Login With Spotify
    </button>
  );
};

export default SpotifyLogin;
