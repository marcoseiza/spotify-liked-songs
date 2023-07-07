import { Accessor, onCleanup } from "solid-js";

export const clickOutside = (el: Element, accessor: Accessor<() => void>) => {
  const onClick = (e: MouseEvent) =>
    !el.contains(e.target as Node) && accessor()?.();
  const onFocus = (e: FocusEvent) =>
    !el.contains(e.target as Node) && accessor()?.();

  document.body.addEventListener("click", onClick);
  document.body.addEventListener("focusin", onFocus);

  onCleanup(() => {
    document.body.removeEventListener("click", onClick);
    document.body.removeEventListener("focusin", onFocus);
  });
};

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:clickOutside
      clickOutside: () => void;
    }
  }
}

export default clickOutside;
