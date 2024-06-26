import type { IonicReactProps } from "@ionic/react/dist/types/components/IonicReactProps";
import { LoadingOverlay } from "@mantine/core";
import React, { PropsWithChildren } from "react";
import AppShell from "./AppShell";

interface Props extends PropsWithChildren {
  style: IonicReactProps["style"];
  loading: boolean;
  header: React.ReactElement;
}

const PageWithLoader = ({ style, loading, header, ...props }: Props) => {
  return (
    <AppShell header={header}>
      {loading ? <LoadingOverlay visible /> : props.children}
    </AppShell>
  );
};

export default PageWithLoader;
