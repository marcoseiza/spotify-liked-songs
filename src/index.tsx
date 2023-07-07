/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { Router, Routes, Route } from "@solidjs/router";
import AccessTokenProvider from "./AccessTokenProvider";
import { Toaster } from "solid-toast";
import { PlaylistifyProvider } from "./Playlistify";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(
  () => (
    <AccessTokenProvider>
      <PlaylistifyProvider>
        <App />
        <Toaster position="top-right" />
      </PlaylistifyProvider>
    </AccessTokenProvider>
  ),
  root!
);
