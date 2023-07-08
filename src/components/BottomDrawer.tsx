import { IconChevronUp, IconChevronDown } from "@tabler/icons-solidjs";
import { Component, JSX, createSignal } from "solid-js";
import clickOutside from "../helpers/clickOutside";

false && clickOutside;

interface BottomDrawerProps {
  children: ((expanded: boolean) => JSX.Element) | JSX.Element;
}

export const BottomDrawer: Component<BottomDrawerProps> = (props) => {
  const [expandOptionDrawer, setExpendOptionDrawer] = createSignal(false);

  return (
    <div class="absolute inset-x-0 bottom-0">
      <div
        class="card bg-base-200 shadow-xl absolute top-3 left-1/2 -translate-x-1/2 max-w-lg w-[calc(100%-1.5rem)] transition-transform"
        classList={{
          "-translate-y-[calc(100%+1.5em)] duration-500 delay-100":
            expandOptionDrawer(),
          "duration-300 delay-75": !expandOptionDrawer(),
        }}
        use:clickOutside={() => setExpendOptionDrawer(false)}
      >
        <div
          class="flex absolute left-1/2 -translate-x-1/2 transition-all"
          classList={{
            "bottom-[99.5%] duration-300": expandOptionDrawer(),
            "bottom-[calc(100%+2em)] duration-200": !expandOptionDrawer(),
          }}
        >
          <button
            type="button"
            class="btn btn-md btn-square swap rounded-full transition-all shadow-xl"
            classList={{
              "rounded-b-none swap-active": expandOptionDrawer(),
              "btn-primary": !expandOptionDrawer(),
            }}
            onClick={() => setExpendOptionDrawer((p) => !p)}
          >
            <IconChevronUp size={24} stroke-width={2} class="swap-off" />
            <IconChevronDown size={24} stroke-width={2} class="swap-on" />
          </button>
        </div>
        <div class="card-body">
          {typeof props.children === "function"
            ? props.children(expandOptionDrawer())
            : props.children}
        </div>
      </div>
    </div>
  );
};
