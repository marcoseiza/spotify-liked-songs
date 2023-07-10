import { Component } from "solid-js";
import SpotifyAuth from "../api/spotify-auth";
import { generateRandomString, generateCodeChallenge } from "../helpers";

export const Login: Component = () => {
  const handleLoginWithSpotify = async () => {
    const state = crypto
      .getRandomValues(new Uint32Array(10))
      .toString()
      .replaceAll(",", "");

    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("spotify-code-verifier", codeVerifier);
    localStorage.setItem("spotify-login-state", state);

    SpotifyAuth.redirectToSpotifyLogin(state, codeChallenge);
  };

  return (
    <>
      <button class="btn btn-primary w-90" onClick={handleLoginWithSpotify}>
        <img
          src="/Spotify_Icon_RGB_White.png"
          alt="spotify logo"
          class="w-5 h-5"
        />
        Login With Spotify
      </button>
    </>
  );
};
