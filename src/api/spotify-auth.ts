import { TokenInfo } from "./spotify-auth-types";

export const redirectToSpotifyLogin = (
  state: string,
  codeChallenge: string
) => {
  const scope = "user-library-read playlist-modify-public ugc-image-upload";

  const args = new URLSearchParams({
    response_type: "code",
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: "http://localhost:3000",
    state: state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = "https://accounts.spotify.com/authorize?" + args;
};

export const fetchTokenInfo = async (
  code: string,
  codeVerifier: string
): Promise<TokenInfo> => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: "http://localhost:3000",
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
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

const api = {
  redirectToSpotifyLogin,
  fetchTokenInfo,
};

export type SpotifyAuth = typeof api;
export default api;
