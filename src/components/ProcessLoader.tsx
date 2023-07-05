import { Accessor, Component, Show, createMemo } from "solid-js";
import { Process, getProgress } from "../helpers";
import createTween from "@solid-primitives/tween";

interface ProcessLoaderProps {
  process: Process;
  showStatus?: boolean;
}

export const ProcessLoader: Component<ProcessLoaderProps> = (props) => {
  const progress = createMemo(() => getProgress(props.process));
  const progressTweened = createTween(progress, { duration: 500 });
  const progressTweenedRounded = createMemo(() =>
    Math.round(progressTweened())
  );

  return (
    <div class="card w-80 bg-base-200 shadow-xl">
      <div class="card-body flex-col items-center p-6 text-primary">
        <div
          class="radial-progress"
          style={{
            "--value": progressTweened(),
            "--size": "4em",
          }}
        >
          {progressTweenedRounded()}%
        </div>
        <Show when={props.showStatus}>
          <h3 class="text-base">{props.process.asPending().status}</h3>
        </Show>
      </div>
    </div>
  );
};
