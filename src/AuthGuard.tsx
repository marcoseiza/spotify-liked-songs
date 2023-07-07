import { useNavigate } from "@solidjs/router";
import { ParentComponent, onMount } from "solid-js";
import { useAccessToken } from "./AccessTokenProvider";

export const AuthGuard: ParentComponent = (props) => {
  const navigate = useNavigate();
  const accessToken = useAccessToken();
  onMount(async () => {
    if (!accessToken()) {
      navigate("/login", { replace: true });
    }
  });

  return props.children;
};
