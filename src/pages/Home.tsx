import { IconAlertCircle, IconReload } from "@tabler/icons-solidjs";
import {
  Component,
  Show,
  Suspense,
  createEffect,
  createMemo,
  createResource,
} from "solid-js";
import { Playlistify } from "../Playlistify";
import { BottomDrawer } from "../components/BottomDrawer";
import { useAccessToken } from "../AccessTokenProvider";
import SpotifyApi from "../api/spotify-api";
import dateformat from "dateformat";
import { createStore } from "solid-js/store";

export const Home: Component = () => {
  const accessToken = useAccessToken();

  const defaultPlaylistName = `Saved Songs ${dateformat(
    Date.now(),
    "d-m-yyyy"
  )}`;

  const [optionsStore, setOptionsStore] = createStore<{
    playlistName: string;
    numberOfSongs: number;
  }>({
    playlistName: defaultPlaylistName,
    numberOfSongs: 0,
  });

  const [savedSongs] = createResource(accessToken, async (accessToken) => {
    return SpotifyApi.getUserSavedTracks(accessToken, 0, 1);
  });

  createEffect(() => {
    if (savedSongs()?.total)
      setOptionsStore("numberOfSongs", savedSongs()?.total!);
  });

  const validOptions = createMemo(() => {
    let valid = true;

    const playlistNameValid = (() => {
      if (optionsStore.playlistName.length == 0) {
        valid = false;
        return { valid: false, error: "Playlist Name cannot be empty" };
      }
      return { valid: true };
    })();
    const numberOfSongsValid = (() => {
      if (
        optionsStore.numberOfSongs < 0 ||
        optionsStore.numberOfSongs > (savedSongs()?.total || Infinity)
      ) {
        valid = false;
        return {
          valid: false,
          error: `Number must be greater than 0 and less than ${
            savedSongs()?.total
          }`,
        };
      }
      return { valid: true };
    })();

    return {
      valid,
      params: {
        playlistName: playlistNameValid,
        numberOfSongs: numberOfSongsValid,
      },
    };
  });
  return (
    <>
      <div class="flex flex-col items-center gap-3">
        <Playlistify
          totalSongs={optionsStore.numberOfSongs}
          playlistName={optionsStore.playlistName}
          disabled={!validOptions().valid}
        />
        <Show when={!validOptions().valid}>
          <div class="flex gap-2 text-error">
            <IconAlertCircle size={24} stroke-width={2} />
            <span class="text-error">Error in options</span>
          </div>
        </Show>
      </div>
      <BottomDrawer>
        {(expanded) => (
          <Suspense fallback={<div>Loading...</div>}>
            <h1 class="text-lg">Playlistify Options</h1>
            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Playlist Name</span>
              </label>
              <div class="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Type here"
                  value={optionsStore.playlistName}
                  onInput={(e) =>
                    setOptionsStore("playlistName", e.target.value)
                  }
                  class="input input-bordered w-full max-w-xs"
                  classList={{
                    "input-error": !validOptions().params.playlistName.valid,
                  }}
                  tabindex={!expanded ? -1 : undefined}
                />
                <Show when={optionsStore.playlistName !== defaultPlaylistName}>
                  <div class="tooltip" data-tip="Reset name">
                    <button
                      type="button"
                      class="btn btn-md btn-square btn-ghost"
                      onClick={() =>
                        setOptionsStore("playlistName", defaultPlaylistName)
                      }
                    >
                      <IconReload size={24} stroke-width={2} />
                    </button>
                  </div>
                </Show>
              </div>
              <label class="label pb-0">
                <span class="label-text-alt text-error">
                  {validOptions().params.playlistName.error}&ensp;
                </span>
              </label>
            </div>
            <div class="form-control w-full max-w-xs">
              <label class="label pt-0">
                <span class="label-text">Number of songs</span>
              </label>
              <div class="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={savedSongs()?.total}
                  value={optionsStore.numberOfSongs}
                  onInput={(e) =>
                    setOptionsStore(
                      "numberOfSongs",
                      e.target.value as unknown as number
                    )
                  }
                  class="range flex-grow"
                  step={1}
                  tabindex={!expanded ? -1 : undefined}
                />
                <input
                  type="number"
                  value={optionsStore.numberOfSongs}
                  onInput={(e) =>
                    setOptionsStore(
                      "numberOfSongs",
                      e.target.value as unknown as number
                    )
                  }
                  class="input input-ghost hide-arrows w-[4.6rem] text-right"
                  step={1}
                  tabindex={!expanded ? -1 : undefined}
                />
              </div>
              <div class="w-full flex justify-between text-xs px-2 pr-[5.1rem]">
                <div class="flex flex-col gap-1 items-center">
                  <span>|</span>
                  <span>0</span>
                </div>
                <div class="flex flex-col items-center">
                  <span>|</span>
                  <span>{savedSongs()?.total}</span>
                </div>
              </div>
              <label class="label">
                <span class="label-text-alt text-error">
                  {validOptions().params.numberOfSongs.error}&ensp;
                </span>
              </label>
            </div>
          </Suspense>
        )}
      </BottomDrawer>
    </>
  );
};
