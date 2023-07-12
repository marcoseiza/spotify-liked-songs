import { useBeforeLeave, useNavigate } from "@solidjs/router";
import { Component, createEffect, onCleanup, onMount } from "solid-js";
import { usePlaylistifyProcess } from "../Playlistify";
import { ProcessLoader } from "../components/ProcessLoader";
import toast from "../helpers/custom-toast";

export const Loading: Component = () => {
  const navigate = useNavigate();
  const [playlistifyProcess, { abort }] = usePlaylistifyProcess();

  onMount(() => {
    if (playlistifyProcess().state !== "pending") navigate("/");
  });

  createEffect(() => {
    if (playlistifyProcess().state === "ready") navigate("/share");
    else if (playlistifyProcess().state === "errored") {
      toast.error(playlistifyProcess().asErrored().error);
      navigate("/");
    }
  });

  // Abort playlistify process if user navigates out of the loading page.
  onCleanup(() => {
    if (playlistifyProcess().state !== "ready") abort();
  });

  return <ProcessLoader process={playlistifyProcess()} showStatus={false} />;
};
