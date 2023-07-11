import {
  Component,
  For,
  JSX,
  Signal,
  createResource,
  createSelector,
  onMount,
} from "solid-js";
import { generateRandomString } from "../helpers";
import { IconPlus } from "@tabler/icons-solidjs";
import { useAccessToken } from "../AccessTokenProvider";
import SpotifyApi from "../api/spotify-api";

interface ChoosePlaylistProps {
  playlistIdSignal: Signal<string>;
}
const ChoosePlaylist: Component<ChoosePlaylistProps> = (props) => {
  const accessToken = useAccessToken();
  const [playlists] = createResource(accessToken, async (accessToken) => {
    const user = await SpotifyApi.getUserProfile(accessToken);
    return await SpotifyApi.getUserPlaylists(accessToken, user.id);
  });
  const newPlaylistId = `new-playlist-id-${generateRandomString(5)}`;
  onMount(() => {
    props.playlistIdSignal[1](newPlaylistId);
  });
  const playlistIsSelected = createSelector(props.playlistIdSignal[0]);
  const onChosenPlaylistChange: JSX.ChangeEventHandler<
    HTMLInputElement,
    Event
  > = (e) => {
    props.playlistIdSignal[1](e.target.value);
  };
  return (
    <>
      <h3>Choose A Playlist</h3>
      <div class="list-none flex flex-row gap-2 w-full overflow-scroll pb-3">
        <li class="w-20 flex-shrink-0">
          <label class="radio-custom">
            <input
              type="radio"
              name="playlist"
              value={newPlaylistId}
              checked={playlistIsSelected(newPlaylistId)}
              onChange={onChosenPlaylistChange}
            />
            <div class="aspect-square bg-primary rounded overflow-hidden flex items-center justify-center mb-1 outline">
              <IconPlus size={28} stroke-width={2} />
            </div>
            <h4 class="w-full text-xs overflow-hidden text-ellipsis whitespace-nowrap text-center">
              New Playlist
            </h4>
          </label>
        </li>
        <For each={playlists()}>
          {(playlist, _i) => (
            <li class="w-20 flex-shrink-0">
              <label class="radio-custom">
                <input
                  type="radio"
                  name="playlist"
                  value={playlist.id}
                  checked={playlistIsSelected(playlist.id)}
                  onChange={onChosenPlaylistChange}
                />
                <div class="placeholder rounded overflow-hidden mb-1 outline">
                  <div class="bg-neutral-focus text-neutral-content w-full aspect-square relative">
                    <img
                      class="absolute inset-0"
                      src={playlist.images.at(0)?.url}
                    />
                  </div>
                </div>
                <h4 class="w-full text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {playlist.name}
                </h4>
              </label>
            </li>
          )}
        </For>
      </div>
    </>
  );
};

export default ChoosePlaylist;
