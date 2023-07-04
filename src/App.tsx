import {
  type Component,
  Match,
  Switch,
  createMemo,
  createResource,
  createSignal,
  Suspense,
  Index,
  Accessor,
} from "solid-js";

import styles from "./App.module.css";
import { useAccessToken } from "./AccessTokenProvider";
import {
  GET_USER_SAVED_TRACKS_LIMIT,
  MAX_NUMBER_OF_ITEMS,
  addItemsToPlaylist,
  createPlaylist,
  getUserProfile,
  getUserSavedTracks,
} from "./api/spotify-api";
import type { ExtractAccessorType } from "./helpers";
import { SavedTrackObject } from "./api/spotify-api-types";
import SpotifyLogin from "./SpotifyLogin";
import dateformat from "dateformat";

const App: Component = () => {
  const [tokenInfo] = useAccessToken();

  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });

  const [currentOffset, setCurrentOffset] = createSignal(0);

  const userSavedTrackData = createMemo<[string, number] | undefined>(() => {
    if (!accessToken()) return undefined;
    return [accessToken()!, currentOffset()];
  });

  const [likedSongs] = createResource(
    userSavedTrackData,
    async ([accessToken, currentOffset]: NonNullable<
      ExtractAccessorType<typeof userSavedTrackData>
    >) => {
      return getUserSavedTracks(accessToken, currentOffset);
    }
  );

  const [userProfile] = createResource(accessToken, getUserProfile);

  const [progress, setProgress] = createSignal(0);
  const [progressStatus, setProgressStatus] = createSignal("");

  const [playlistHref, setPlaylistHref] = createSignal("");

  const handlePlaylistifyLikedSongs = async () => {
    if (!userProfile()?.id || !accessToken() || !likedSongs()) return;
    setProgressStatus("Creating playlist");
    const newPlaylist = await createPlaylist(
      accessToken()!,
      userProfile()!.id,
      {
        name: `Liked Songs ${dateformat(Date.now(), "d-m-yyyy")}`,
      }
    );
    setPlaylistHref(newPlaylist.external_urls.spotify);
    setProgress(10);
    setProgressStatus("Adding liked songs to playlist");
    const total = likedSongs()!.total;
    // const total = 150;
    let currentOffset = 0;

    const songsToAdd = Array<string>(MAX_NUMBER_OF_ITEMS);
    let lastSongIndex = 0;

    while (currentOffset <= total) {
      const likedSongsInfo = await getUserSavedTracks(
        accessToken()!,
        currentOffset
      );
      const likedSongs = likedSongsInfo.items;
      currentOffset += GET_USER_SAVED_TRACKS_LIMIT;

      for (let i = 0; i < likedSongs.length; i++) {
        songsToAdd[i + lastSongIndex] = likedSongs[i].track.uri;
      }

      lastSongIndex += likedSongs.length;

      if (
        lastSongIndex === MAX_NUMBER_OF_ITEMS ||
        likedSongs.length < GET_USER_SAVED_TRACKS_LIMIT
      ) {
        const songList = songsToAdd.slice(0, lastSongIndex);

        await addItemsToPlaylist(accessToken()!, newPlaylist.id, {
          uris: songList,
          position: currentOffset - MAX_NUMBER_OF_ITEMS,
        });

        const progress =
          (currentOffset - MAX_NUMBER_OF_ITEMS + lastSongIndex) /
          likedSongsInfo.total;
        setProgress(10 + 90 * progress);
        setProgressStatus(
          `Adding liked songs to playlist ${
            currentOffset - MAX_NUMBER_OF_ITEMS
          } - ${currentOffset - MAX_NUMBER_OF_ITEMS + lastSongIndex} / ${
            likedSongsInfo.total
          }`
        );

        lastSongIndex = 0;
      }
    }
  };

  return (
    <div class={styles.App}>
      <Switch>
        <Match when={!tokenInfo()}>
          <SpotifyLogin />
        </Match>
        <Match when={tokenInfo()}>
          <Suspense fallback={<div>Loading...</div>}>
            <h3>{userProfile()?.display_name}</h3>
            <h4>{userProfile()?.id}</h4>
          </Suspense>
          <button onClick={handlePlaylistifyLikedSongs}>
            Playlistify your liked songs
          </button>
          <h3>
            Platlist Link: <a href={playlistHref()}>{playlistHref()}</a>
          </h3>
          <h3>{progress()} / 100</h3>
          <h3>{progressStatus()}</h3>

          <Suspense fallback={<div>Loading...</div>}>
            <h3>
              Liked songs {likedSongs()?.offset} -{" "}
              {(likedSongs()?.offset || 0) + (likedSongs()?.limit || 0)} /{" "}
              {likedSongs()?.total || 0}
            </h3>
          </Suspense>
          <button
            onClick={() =>
              setCurrentOffset((p) =>
                Math.max(p - (likedSongs()?.limit || 20), 0)
              )
            }
          >
            previous
          </button>
          <button
            onClick={() =>
              setCurrentOffset((p) =>
                Math.min(
                  likedSongs()?.total || Infinity,
                  p + (likedSongs()?.limit || 20)
                )
              )
            }
          >
            next
          </button>
          <Suspense fallback={<div>Loading...</div>}>
            <Index
              each={likedSongs()?.items}
              fallback={<div>Error showing liked songs</div>}
            >
              {(item: Accessor<SavedTrackObject>) => (
                <div>{item().track.name}</div>
              )}
            </Index>
          </Suspense>
          <button
            onClick={() =>
              setCurrentOffset((p) =>
                Math.max(p - (likedSongs()?.limit || 20), 0)
              )
            }
          >
            previous
          </button>
          <button
            onClick={() =>
              setCurrentOffset((p) =>
                Math.min(
                  likedSongs()?.total || Infinity,
                  p + (likedSongs()?.limit || 20)
                )
              )
            }
          >
            next
          </button>
        </Match>
      </Switch>
    </div>
  );
};

export default App;
