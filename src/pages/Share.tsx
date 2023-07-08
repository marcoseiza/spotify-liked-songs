import { Component, createResource, onCleanup, onMount } from "solid-js";
import { PlaylistCard } from "../components/PlaylistCard";
import { IconChevronLeft } from "@tabler/icons-solidjs";
import { usePlaylistifyProcess } from "../Playlistify";
import SpotifyApi from "../api/spotify-api";
import { useAccessToken } from "../AccessTokenProvider";
import { useNavigate } from "@solidjs/router";

export const Share: Component = () => {
  const accessToken = useAccessToken();

  const navigate = useNavigate();

  const [playlistifyProcess, { reset }] = usePlaylistifyProcess();

  const [playlistCoverArt, { refetch: refetchCoverArt }] = createResource(
    playlistifyProcess,
    async (process) => {
      if (process.state !== "ready" || !accessToken()) return undefined;
      const coverArtImages = await SpotifyApi.getPlaylistCoverArt(
        accessToken()!,
        process.value.id
      );
      return coverArtImages.at(0)?.url;
    }
  );

  onMount(() => {
    if (playlistifyProcess().state !== "ready") navigate("/");
  });

  onCleanup(() => {
    reset();
  });

  return (
    <>
      <PlaylistCard
        name={playlistifyProcess().safeAsReady()?.value?.name}
        coverArtSrc={playlistCoverArt() || ""}
        href={playlistifyProcess().safeAsReady()?.value?.external_urls.spotify}
        onCoverArtLoadError={refetchCoverArt}
      />
      <button
        type="button"
        class="btn btn-primary w-90"
        onClick={() => navigate("/")}
      >
        <IconChevronLeft size={24} stroke-width={2} />
        Back
      </button>
    </>
  );
};
