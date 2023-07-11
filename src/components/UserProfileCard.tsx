import { Component, Suspense } from "solid-js";

interface UserProfileCardProps {
  displayName: string;
  numberOfSavedSongs: number;
  profileSrc: string;
}

export const UserProfileCard: Component<UserProfileCardProps> = (props) => {
  return (
    <div class="card w-90 bg-base-200 shadow-xl">
      <div class="card-body p-6 flex-row items-center gap-5">
        <Suspense fallback={<div class="skeleton w-14 h-14 rounded-full" />}>
          <img src={props.profileSrc} class="h-14 w-14 rounded-full" />
        </Suspense>
        <div class="flex flex-col">
          <Suspense
            fallback={<div class="skeleton w-32 h-4 rounded-full mb-2" />}
          >
            <h2 class="text-lg">{props.displayName}</h2>
          </Suspense>
          <Suspense fallback={<div class="skeleton w-24 h-4 rounded-full" />}>
            <p class="text-sm">
              {props.numberOfSavedSongs}{" "}
              <span class="text-neutral-500">saved songs</span>
            </p>
          </Suspense>
        </div>
      </div>
    </div>
  );
};
