import { Accessor } from "solid-js";

export type ExtractAccessorType<T extends Accessor<any>> = T extends Accessor<
  infer U
>
  ? U
  : never;

export const generateRandomString = (length: number) => {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const generateCodeChallenge = async (codeVerifier: string) => {
  const base64encode = (s: ArrayBuffer) => {
    return btoa(
      String.fromCharCode.apply(null, new Uint8Array(s) as unknown as number[])
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
};

export type ProcessHelpers<T = any> = {
  asUnresolved: () => Unresolved;
  asReady: () => Ready<T>;
  asPending: () => Pending;
  asErrored: () => Errored;
};

export type Unresolved = { state: "unresolved" } & ProcessHelpers;
export type Ready<T> = { state: "ready"; value?: T } & ProcessHelpers<T>;
export type Pending = {
  state: "pending";
  status: string;
  progress: number;
} & ProcessHelpers;
export type Errored = { state: "errored"; error: any } & ProcessHelpers;

export const unresolved = (): Unresolved => ({
  state: "unresolved",
  asUnresolved() {
    return this as Unresolved;
  },
  asReady() {
    throw new Error("type is not of state ready");
  },
  asPending() {
    throw new Error("type is not of state pending");
  },
  asErrored() {
    throw new Error("type is not of state errored");
  },
});
export const pending = (
  opts: Omit<Pending, "state" | keyof ProcessHelpers>
): Pending => ({
  state: "pending",
  ...opts,
  asUnresolved() {
    throw new Error("type is not of state unresolved");
  },
  asReady() {
    throw new Error("type is not of state ready");
  },
  asPending() {
    return this as Pending;
  },
  asErrored() {
    throw new Error("type is not of state errored");
  },
});
export const ready = <T extends any>(
  opts: Omit<Ready<T>, "state" | keyof ProcessHelpers>
): Ready<T> => ({
  state: "ready",
  ...opts,
  asUnresolved() {
    throw new Error("type is not of state unresolved");
  },
  asReady() {
    return this as Ready<T>;
  },
  asPending() {
    throw new Error("type is not of state ready");
  },
  asErrored() {
    throw new Error("type is not of state errored");
  },
});
export const errored = (error: any): Errored => ({
  state: "errored",
  error,
  asUnresolved() {
    throw new Error("type is not of state unresolved");
  },
  asReady() {
    throw new Error("type is not of state unresolved");
  },
  asPending() {
    throw new Error("type is not of state ready");
  },
  asErrored() {
    return this as Errored;
  },
});

export type Process<T = any> = Unresolved | Pending | Ready<T> | Errored;

export const getProgress = (p: Process, defaultProgress: number = 0) =>
  p.state === "pending" ? p.progress : defaultProgress;
export const fromPrevious = () => {
  return {
    unresolved: (opts: Partial<Unresolved>) => {
      return (previous: Process) => {
        if (previous.state !== "unresolved")
          throw new Error("previous was not of state unresolved");
        return { ...previous, ...opts } as Unresolved;
      };
    },
    pending: (opts: Partial<Pending>) => {
      return (previous: Process) => {
        if (previous.state !== "pending")
          throw new Error("previous was not of state pending");
        return { ...previous, ...opts } as Pending;
      };
    },
    ready: <T extends any>(opts: Partial<Ready<T>>) => {
      return (previous: Process) => {
        if (previous.state !== "ready")
          throw new Error("previous was not of state ready");
        return { ...previous, ...opts } as Ready<T>;
      };
    },
    errored: (opts: Partial<Errored>) => {
      return (previous: Process) => {
        if (previous.state !== "errored")
          throw new Error("previous was not of state errored");
        return { ...previous, ...opts } as Errored;
      };
    },
  };
};
