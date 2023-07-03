import {
  createContext,
  useContext,
  ParentComponent,
  createSignal,
  Accessor,
} from "solid-js";

export type AccessTokenContextValue = [
  accessToken: Accessor<string | undefined>,
  setAccessToken: (accessToken: Accessor<string | undefined>) => void
];
const AccessTokenContext = createContext<AccessTokenContextValue>([
  () => undefined,
  (_: Accessor<string | undefined>) => {},
]);

export const AccessTokenProvider: ParentComponent<{}> = (props) => {
  const [accessToken, setAccessToken] = createSignal<string | undefined>();
  // const [{ accessToken }, setAccessToken] = createStore<{
  //   accessToken: string | undefined;
  // }>({
  //   accessToken: undefined,
  // });

  return (
    <AccessTokenContext.Provider
      value={[
        accessToken,
        (accessToken: Accessor<string | undefined>) =>
          setAccessToken(accessToken),
      ]}
    >
      {props.children}
    </AccessTokenContext.Provider>
  );
};

export const useAccessToken = () => {
  return useContext(AccessTokenContext);
};

export default AccessTokenProvider;
