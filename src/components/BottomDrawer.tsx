import { CaretUp, CaretDown } from "phosphor-solid";
import { ParentComponent, createSignal } from "solid-js";

export const BottomDrawer: ParentComponent<{}> = (props) => {
  const [expandOptionDrawer, setExpendOptionDrawer] = createSignal(false);

  return (
    <div class="absolute inset-x-0 bottom-0">
      <div
        class="card bg-base-200 shadow-xl absolute top-3 inset-x-3 transition-transform"
        classList={{
          "-translate-y-[calc(100%+1.5em)]": expandOptionDrawer(),
          "duration-300 delay-75": !expandOptionDrawer(),
          "duration-500 delay-100": expandOptionDrawer(),
        }}
      >
        <div
          class="flex bg-base-200 absolute left-1/2 -translate-x-1/2 rounded-full transition-all overflow-hidden"
          classList={{
            "rounded-b-none": expandOptionDrawer(),
            "bottom-[calc(100%+2em)]": !expandOptionDrawer(),
            "bottom-full": expandOptionDrawer(),

            "duration-200": !expandOptionDrawer(),
            "duration-300": expandOptionDrawer(),
          }}
        >
          <button
            type="button"
            class="btn btn-ghost btn-md btn-square no-animation swap rounded-full transition-all"
            classList={{
              "rounded-b-none": expandOptionDrawer(),
              "swap-active": expandOptionDrawer(),
            }}
            onClick={() => setExpendOptionDrawer((p) => !p)}
          >
            <CaretUp size={24} weight="bold" class="swap-off" />
            <CaretDown size={24} weight="bold" class="swap-on" />
          </button>
        </div>
        <div class="card-body">{props.children}</div>
      </div>
    </div>
  );
};
