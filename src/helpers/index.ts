import { Accessor } from "solid-js";

export type ExtractAccessorType<T extends Accessor<any>> = T extends Accessor<
  infer U
>
  ? U
  : never;
