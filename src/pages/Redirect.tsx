import { Component, onMount } from "solid-js";
import SpotifyAuth from "../api/spotify-auth";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useTokenInfo } from "../AccessTokenProvider";

export const Redirect: Component = () => {
  const [, setTokenInfo] = useTokenInfo();
  onMount(async () => {
    const [params] = useSearchParams();

    if (params.code !== undefined && params.state !== undefined) {
      const state = localStorage.getItem("spotify-login-state");

      const navigate = useNavigate();

      if (state !== params.state) {
        console.error("state is not equal");
        navigate("/login", { replace: true });
        return;
      }

      localStorage.removeItem("spotify-login-state");

      const codeVerifier = localStorage.getItem("spotify-code-verifier");

      if (!codeVerifier) {
        console.error("code verifier not set");
        navigate("/login", { replace: true });
        return;
      }

      setTokenInfo(await SpotifyAuth.fetchTokenInfo(params.code, codeVerifier));
      navigate("/", { replace: true });
    }
  });
  return (
    <>
      <div class="skeleton w-90 h-24 rounded-xl" />
      <div class="skeleton w-90 h-16 rounded-xl" />
    </>
  );
};
