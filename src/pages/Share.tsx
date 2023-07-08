import { Component, createResource, onMount } from "solid-js";
import { PlaylistCard } from "../components/PlaylistCard";
import { CaretLeft } from "phosphor-solid";
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

  const handleBack = () => {
    reset();
    navigate("/");
  };

  onMount(() => {
    if (playlistifyProcess().state !== "ready") navigate("/");
  });

  return (
    <>
      <PlaylistCard
        name={playlistifyProcess().safeAsReady()?.value?.name}
        coverArtSrc={playlistCoverArt() || ""}
        href={playlistifyProcess().safeAsReady()?.value?.external_urls.spotify}
        onCoverArtLoadError={refetchCoverArt}
      />
      <button type="button" class="btn btn-primary w-90" onClick={handleBack}>
        <CaretLeft size={24} weight="bold" />
        Back
      </button>
    </>
  );
};
