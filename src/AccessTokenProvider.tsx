import {
  createContext,
  useContext,
  ParentComponent,
  createSignal,
  Accessor,
  createMemo,
} from "solid-js";
import { TokenInfo } from "./api/spotify-auth-types";

export type AccessTokenContextValue = [
  accessToken: Accessor<TokenInfo | undefined>,
  setAccessToken: (accessToken: TokenInfo | undefined) => void
];
const AccessTokenContext = createContext<AccessTokenContextValue>([
  () => undefined,
  (_: TokenInfo | undefined) => {},
]);

export const AccessTokenProvider: ParentComponent<{}> = (props) => {
  const [tokenInfo, setTokenInfo] = createSignal<TokenInfo | undefined>();

  return (
    <AccessTokenContext.Provider
      value={[
        tokenInfo,
        (tokenInfo: TokenInfo | undefined) => setTokenInfo(tokenInfo),
      ]}
    >
      {props.children}
    </AccessTokenContext.Provider>
  );
};

export const useTokenInfo = () => {
  return useContext(AccessTokenContext);
};

export const useAccessToken = () => {
  const [tokenInfo] = useContext(AccessTokenContext);
  const accessToken = createMemo(() => {
    return tokenInfo()?.access_token;
  });

  return accessToken;
};

export default AccessTokenProvider;
