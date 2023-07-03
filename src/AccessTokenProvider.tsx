import {
  createContext,
  useContext,
  ParentComponent,
  createSignal,
  Accessor,
} from "solid-js";

type TokenInfo = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export type AccessTokenContextValue = [
  accessToken: Accessor<TokenInfo | undefined>,
  setAccessToken: (accessToken: Accessor<TokenInfo | undefined>) => void
];
const AccessTokenContext = createContext<AccessTokenContextValue>([
  () => undefined,
  (_: Accessor<TokenInfo | undefined>) => {},
]);

export const AccessTokenProvider: ParentComponent<{}> = (props) => {
  const [tokenInfo, setTokenInfo] = createSignal<TokenInfo | undefined>();

  return (
    <AccessTokenContext.Provider
      value={[
        tokenInfo,
        (tokenInfo: Accessor<TokenInfo | undefined>) => setTokenInfo(tokenInfo),
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
