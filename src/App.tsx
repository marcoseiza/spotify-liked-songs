import { type Component, createResource } from "solid-js";

import { useAccessToken } from "./AccessTokenProvider";

import { UserProfileCard } from "./components/UserProfileCard";

import { Router, Routes, Route, Outlet } from "@solidjs/router";
import { AuthGuard } from "./AuthGuard";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import SpotifyApi from "./api/spotify-api";
import { Redirect } from "./pages/Redirect";
import { Share } from "./pages/Share";
import { ChoosePlaylist } from "./pages/ChoosePlaylist";
import { Loading } from "./pages/Loading";

const App: Component = () => {
  const accessToken = useAccessToken();

  const [userProfile] = createResource(accessToken, (accessToken) =>
    SpotifyApi.getUserProfile(accessToken)
  );
  const [savedSongs] = createResource(accessToken, async (accessToken) => {
    return SpotifyApi.getUserSavedTracks(accessToken, 0, 1);
  });

  return (
    <div class="h-[100svh] overflow-hidden background flex flex-col items-center justify-center">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div class="flex flex-col items-center justify-center gap-5 mb-32">
                <div class="absolute bottom-5">
                  <UserProfileCard
                    displayName={
                      userProfile()?.display_name || userProfile()?.id!
                    }
                    profileSrc={userProfile()?.images?.at(1)?.url!}
                    numberOfSavedSongs={savedSongs()?.total!}
                  />
                </div>
                <Outlet />
              </div>
            }
          >
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/choose-playlist"
              element={
                <AuthGuard>
                  <ChoosePlaylist />
                </AuthGuard>
              }
            />
            <Route
              path="/loading"
              element={
                <AuthGuard>
                  <Loading />
                </AuthGuard>
              }
            />
            <Route
              path="/share"
              element={
                <AuthGuard>
                  <Share />
                </AuthGuard>
              }
            />
          </Route>
          <Route path="/redirect" component={Redirect} />
          <Route path="/login" component={Login} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
