import { IconAlertCircle, IconReload } from "@tabler/icons-solidjs";
import { Component, Show, createEffect, createMemo } from "solid-js";
import {
  Playlistify,
  PlaylistifyPeriods,
  calculateDateTimeLimitFromPeriod,
} from "../Playlistify";
import { createStore } from "solid-js/store";
import { V } from "../helpers/valid";
import dateFormat from "dateformat";

const OptionsSchema = V.collection({
  period: V.enum(PlaylistifyPeriods),
  playlistName: V.string().nonempty(),
});

const makePlaylistName = (period: PlaylistifyPeriods) => {
  switch (period) {
    case "LastDay":
    case "LastMonth":
    case "LastYear":
      return `Saved Songs ${dateFormat(
        new Date(calculateDateTimeLimitFromPeriod(period)),
        "dd-mm-yy"
      )} To ${dateFormat(Date.now(), "dd-mm-yy")}`;
    case "AllTime":
      return `Saved Songs On ${dateFormat(Date.now(), "dd-mm-yy")}`;
  }
};

export const Home: Component = () => {
  const [optionsStore, setOptionsStore] = createStore<
    V.infer<typeof OptionsSchema>
  >({
    playlistName: "Playlist",
    period: "LastDay",
  });

  const validOptions = createMemo(() => {
    return OptionsSchema.parse(optionsStore);
  });

  createEffect(() =>
    setOptionsStore("playlistName", makePlaylistName(optionsStore.period))
  );

  return (
    <>
      <div class="card w-90 bg-base-200 shadow-xl">
        <div class="card-body p-6 flex-col gap-2">
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">Playlistify Last</span>
            </label>
            <div class="join">
              <input
                type="radio"
                name="category"
                class="join-item flex-grow btn btn-sm bg-base-100 h-10"
                aria-label="Day"
                value={PlaylistifyPeriods.LastDay}
                onChange={(e) =>
                  setOptionsStore(
                    "period",
                    e.target.value as PlaylistifyPeriods
                  )
                }
                checked={optionsStore.period === PlaylistifyPeriods.LastDay}
              />
              <input
                type="radio"
                name="category"
                class="join-item flex-grow btn btn-sm bg-base-100 h-10"
                aria-label="Month"
                value={PlaylistifyPeriods.LastMonth}
                onChange={(e) =>
                  setOptionsStore(
                    "period",
                    e.target.value as PlaylistifyPeriods
                  )
                }
                checked={optionsStore.period === PlaylistifyPeriods.LastMonth}
              />
              <input
                type="radio"
                name="category"
                class="join-item flex-grow btn btn-sm bg-base-100 h-10"
                aria-label="Year"
                value={PlaylistifyPeriods.LastYear}
                onChange={(e) =>
                  setOptionsStore(
                    "period",
                    e.target.value as PlaylistifyPeriods
                  )
                }
                checked={optionsStore.period === PlaylistifyPeriods.LastYear}
              />
              <input
                type="radio"
                name="category"
                class="join-item flex-grow btn btn-sm bg-base-100 h-10"
                aria-label="All Time"
                value={PlaylistifyPeriods.AllTime}
                onChange={(e) =>
                  setOptionsStore(
                    "period",
                    e.target.value as PlaylistifyPeriods
                  )
                }
                checked={optionsStore.period === PlaylistifyPeriods.AllTime}
              />
            </div>
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">Playlist Name</span>
            </label>
            <div class="join">
              <input
                type="text"
                placeholder="Type here"
                value={optionsStore.playlistName}
                onInput={(e) => setOptionsStore("playlistName", e.target.value)}
                class="input input-bordered join-item w-full max-w-xs"
                classList={{
                  "input-error": !validOptions().params.playlistName.success,
                }}
              />
              <div class="tooltip" data-tip="Reset name">
                <button
                  type="button"
                  class="btn btn-md btn-square btn-primary join-item"
                  onClick={() =>
                    setOptionsStore(
                      "playlistName",
                      makePlaylistName(optionsStore.period)
                    )
                  }
                  disabled={
                    optionsStore.playlistName ===
                    makePlaylistName(optionsStore.period)
                  }
                >
                  <IconReload size={24} stroke-width={2} />
                </button>
              </div>
            </div>
            <label class="label pb-0">
              <span class="label-text-alt text-error">
                <Show when={!validOptions().params.playlistName.success}>
                  {(
                    validOptions().params.playlistName as V.VResultFailure
                  ).issues
                    .map((i) => i.message)
                    .join(", ")}
                </Show>
                &ensp;
              </span>
            </label>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-3">
        <Playlistify {...optionsStore} disabled={!validOptions().success} />
        <div class="flex items-center gap-2 text-error">
          <Show when={!validOptions().params.playlistName.success}>
            <IconAlertCircle size={18} stroke-width={2} />
            <span class="label-text-alt text-error">Error in options</span>
          </Show>
          &ensp;
        </div>
      </div>
    </>
  );
};
