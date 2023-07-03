export const generateRandomString = (length: number) => {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const generateCodeChallenge = async (codeVerifier: string) => {
  const base64encode = (s: ArrayBuffer) => {
    return btoa(
      String.fromCharCode.apply(null, new Uint8Array(s) as unknown as number[])
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
};

export const redirectToSpotifyLogin = (
  state: string,
  codeChallenge: string
) => {
  const scope = "user-read-private user-read-email user-library-read";

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

export const fetchTokenInfo = async (code: string, codeVerifier: string) => {
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
