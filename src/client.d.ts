/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  readonly VITE_SPOTIFY_CLIENT_ID_DEV: string;
  readonly VITE_API_VERSION: "Mock" | "Impl";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
