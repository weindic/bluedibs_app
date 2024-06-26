import React, { useEffect } from "react";
import { useHistory } from "react-router";

type Props = { to: string; state?: Record<string, any>; replace?: boolean };

function RedirectWithState({ to, state, replace }: Props) {
  const history = useHistory();

  useEffect(() => {
    if (replace) {
      history.replace(to, state);
    } else {
      history.push(to, state);
    }
  }, []);

  return null;
}

export default RedirectWithState;
