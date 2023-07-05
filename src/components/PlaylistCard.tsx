import { ArrowUpRight } from "phosphor-solid";
import { Component } from "solid-js";

interface PlaylistCardProps {
  coverArtSrc: string;
  name: string;
  href: string;
}

export const PlaylistCard: Component<PlaylistCardProps> = (props) => {
  return (
    <div class="card w-80 bg-base-200 shadow-xl">
      <div class="card-body p-6">
        <div class="placeholder">
          <div class="bg-neutral-focus text-neutral-content w-full aspect-square relative mb-1">
            <img class="absolute inset-0" src={props.coverArtSrc || ""} />
          </div>
        </div>
        <h3 class="text-base mb-3">{props.name}</h3>
        <a href={props.href} class="btn btn-primary">
          Open Playlist
          <ArrowUpRight size={28} />
        </a>
      </div>
    </div>
  );
};
