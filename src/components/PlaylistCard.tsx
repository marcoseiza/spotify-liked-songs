import { IconLink, IconClipboard, IconShare2 } from "@tabler/icons-solidjs";
import { Component, Suspense, createResource } from "solid-js";
import toast from "../helpers/custom-toast";
import SpotifyApi from "../api/spotify-api";
import { useAccessToken } from "../AccessTokenProvider";

interface PlaylistCardProps {
  coverArtSrc: string;
  name: string;
  href: string;
  onCoverArtLoadError?: () => void;
}

export const PlaylistCard: Component<PlaylistCardProps> = (props) => {
  const accessToken = useAccessToken();
  const [userProfile] = createResource(accessToken, (accessToken) =>
    SpotifyApi.getUserProfile(accessToken)
  );

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
        <div class="h-sm:flex h-sm:items-stretch h-sm:gap-2 mb-3">
          <div class="placeholder w-full aspect-square h-sm:w-1/5 h-sm:flex-shrink-0 rounded-md overflow-hidden">
            <div class="bg-neutral-focus text-neutral-content w-full h-full relative">
              <img
                class="absolute inset-0"
                src={props.coverArtSrc || ""}
                onError={props.onCoverArtLoadError}
              />
            </div>
          </div>
          <div class="overflow-hidden flex flex-col justify-between h-sm:py-1">
            <h3 class="text-base text-neutral-300 min-h-sm:mt-3 h-sm:overflow-hidden h-sm:whitespace-nowrap h-sm:w-full h-sm:text-ellipsis">
              {props.name}
            </h3>
            <h3 class="text-base text-neutral-500 min-h-sm:hidden">
              Playlist &#183;{" "}
              <Suspense
                fallback={<span class="skeleton w-20 h-4 rounded-xl" />}
              >
                {userProfile()?.display_name || userProfile()?.id}
              </Suspense>
            </h3>
          </div>
        </div>
        <div class="flex gap-2">
          <a
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            class="flex-grow btn btn-md btn-primary"
          >
            <IconLink size={24} stroke-width={2} />
            Open Playlist
          </a>
          <div class="tooltip" data-tip="Copy link to clipboard">
            <button
              type="button"
              class="btn btn-md btn-square btn-outline btn-primary"
              onClick={copyToClipboard}
            >
              <IconClipboard size={24} stroke-width={2} />
            </button>
          </div>
          <div class="tooltip" data-tip="Share link">
            <button
              type="button"
              class="btn btn-md btn-square btn-outline btn-primary"
              onClick={shareUrl}
            >
              <IconShare2 size={24} stroke-width={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
