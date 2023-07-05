import { SpotifyAuth } from "../spotify-auth";
import { TokenInfo } from "../spotify-auth-types";

export const redirectToSpotifyLogin = (
  state: string,
  _codeChallenge: string
) => {
  const args = new URLSearchParams({
    state: state,
    code: "mock-spotify-code",
  });

  window.location.href = "/?" + args;
};

export const fetchTokenInfo = async (
  _code: string,
  _codeVerifier: string
): Promise<TokenInfo> => {
  return new Promise((r) => {
    setTimeout(() => {
      r({
        access_token: "mock-spotify-token",
        expires_in: Infinity,
        refresh_token: "mock-spotify-refresh-token",
        scope: "mock-spotify-scope",
      });
    }, 500);
  });
};

export default {
  redirectToSpotifyLogin,
  fetchTokenInfo,
} satisfies SpotifyAuth;
