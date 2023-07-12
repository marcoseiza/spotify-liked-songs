import {
  Component,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Process, getProgress } from "../helpers";
import createTween from "@solid-primitives/tween";

interface ProcessLoaderProps {
  process: Process;
  showStatus?: boolean;
}

function blendColors(colorA: string, colorB: string, amount: number) {
  const colorARGB = colorA.match(/\w\w/g)?.map((c) => parseInt(c, 16));
  const colorBRGB = colorB.match(/\w\w/g)?.map((c) => parseInt(c, 16));

  if (!colorARGB || !colorBRGB) return colorA;

  const [rA, gA, bA] = colorARGB;
  const [rB, gB, bB] = colorBRGB;

  const r = Math.round(rA + (rB - rA) * amount)
    .toString(16)
    .padStart(2, "0");
  const g = Math.round(gA + (gB - gA) * amount)
    .toString(16)
    .padStart(2, "0");
  const b = Math.round(bA + (bB - bA) * amount)
    .toString(16)
    .padStart(2, "0");

  return "#" + r + g + b;
}

export const ProcessLoader: Component<ProcessLoaderProps> = (props) => {
  const progress = createMemo(() => getProgress(props.process));
  const progressTweened = createTween(progress, { duration: 500 });
  const progressTweenedRounded = createMemo(() =>
    Math.round(progressTweened())
  );

  const [blend, setBlend] = createSignal(0);
  const DURATON = 400;
  const blendTween = createTween(blend, { duration: 1000 });
  onMount(() => {
    const interval = setInterval(() => {
      setBlend(blend() === 0 ? 1 : 0);
    }, DURATON);
    onCleanup(() => clearInterval(interval));
  });

  const color = createMemo(() =>
    blendColors("#1db954", "#428a5b", blendTween())
  );

  return (
    <div class="card w-90 bg-base-200 shadow-xl">
      <div class="card-body flex-col items-center p-6 text-primary">
        <div
          class="radial-progress text-white"
          style={{
            "--value": progressTweened(),
            "--size": "4em",
            color: color(),
          }}
        >
          <span class="text-primary"> {progressTweenedRounded()}%</span>
        </div>
        <Show when={props.showStatus}>
          <h3 class="text-base">{props.process.asPending().status}</h3>
        </Show>
      </div>
    </div>
  );
};
