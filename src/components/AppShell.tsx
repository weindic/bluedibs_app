import { IonContent, IonPage } from "@ionic/react";
import { Box, Flex, Header, FlexProps } from "@mantine/core";
import { PropsWithChildren, useMemo } from "react";

interface Props extends PropsWithChildren, FlexProps {
  header?: JSX.Element;
  isModal?: boolean;
}

function AppShell({
  header,
  children,
  isModal = false,
  style,
  direction,
  ...others
}: Props) {
  const [PageComponent, ContentComponent] = useMemo(
    () => (isModal === true ? [Box, Box] : [IonPage, IonContent]),
    [isModal]
  );

  return (
    <PageComponent sx={{ height: "100vh" }}>
      <Flex
        direction={"column"}
        style={{
          ...style,
          height: "100%",
          position: "relative",
        }}
        {...others}
      >
        {header && (
          <Header
            height={55}
            styles={{ root: { background: "white", position: "sticky" } }}
            px="md"
          >
            <Flex align={"center"} h="100%" w="100%">
              <div style={{ width: "100%" }}>{header}</div>
            </Flex>
          </Header>
        )}

        <ContentComponent
          sx={{
            height: "calc(100% - 55px)",
            overflow: isModal ? "scroll" : "hidden",
          }}
        >
          {children}
        </ContentComponent>
      </Flex>
    </PageComponent>
  );
}

export default AppShell;
