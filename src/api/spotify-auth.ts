import { TokenInfo } from "./spotify-auth-types";
import MockAuth from "./__mock__/spotify-auth";
import { assert, Equals } from "tsafe";

export const REDIRECT_URL = import.meta.env.DEV
  ? "http://localhost:3000/redirect"
  : "https://spotify-liked.meizayaga.com/redirect";

export const CLIENT_ID = import.meta.env.DEV
  ? import.meta.env.VITE_SPOTIFY_CLIENT_ID_DEV
  : import.meta.env.VITE_SPOTIFY_CLIENT_ID;

const redirectToSpotifyLogin = (state: string, codeChallenge: string) => {
  const scope = "user-library-read playlist-modify-public ugc-image-upload";

  const args = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URL,
    state: state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = "https://accounts.spotify.com/authorize?" + args;
};

const fetchTokenInfo = async (
  code: string,
  codeVerifier: string
): Promise<TokenInfo> => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URL,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const accessToken = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  })
    .then((r: any) => {
      if (!r.ok) throw new Error("HTTP status: " + r.status);
      return r.json();
    })
    .catch((e: any) => console.error("Error: ", e));

  return accessToken;
};

const ImplAuth = {
  redirectToSpotifyLogin,
  fetchTokenInfo,
};

assert<Equals<typeof ImplAuth, typeof MockAuth>>;

const SpotifyAuth =
  import.meta.env.VITE_API_VERSION === "Impl" ? ImplAuth : MockAuth;
export default SpotifyAuth;
