import { Link, Clipboard, Export } from "phosphor-solid";
import { Component } from "solid-js";
import toast from "../helpers/custom-toast";

interface PlaylistCardProps {
  coverArtSrc: string;
  name: string;
  href: string;
}

export const PlaylistCard: Component<PlaylistCardProps> = (props) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.href);
      toast.success("Copied link to clipboard!");
    } catch (e) {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const shareUrl = () => {
    const data: ShareData = {
      title: "my liked songs on spotify :)",
      url: props.href,
    };
    if (navigator.canShare(data)) {
      navigator.share(data);
    }
  };

  return (
    <div class="card w-90 bg-base-200 shadow-xl">
      <div class="card-body p-6">
        <div class="placeholder">
          <div class="bg-neutral-focus text-neutral-content w-full aspect-square relative">
            <img class="absolute inset-0" src={props.coverArtSrc || ""} />
          </div>
        </div>
        <h3 class="text-base text-neutral-500 mb-3">{props.name}</h3>
        <div class="flex gap-2">
          <a href={props.href} class="flex-grow btn btn-md btn-primary">
            <Link size={28} />
            Open Playlist
          </a>
          <div class="tooltip" data-tip="Copy link to clipboard">
            <button
              type="button"
              class="btn btn-md btn-square btn-outline btn-primary"
              onClick={copyToClipboard}
            >
              <Clipboard size={28} />
            </button>
          </div>
          <div class="tooltip" data-tip="Share link">
            <button
              type="button"
              class="btn btn-md btn-square btn-outline btn-primary"
              onClick={shareUrl}
            >
              <Export size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
