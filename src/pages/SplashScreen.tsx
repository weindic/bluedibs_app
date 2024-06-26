import { Flex } from "@mantine/core";
import AppShell from "../components/AppShell";
import { AuthBranding } from "./Onboarding";

type Props = {};

function SplashScreen({}: Props) {
  return (
    <AppShell>
      <Flex
        h="auto"
        mih="100%"
        w="100%"
        align={"center"}
        justify={"center"}
        p="xl"
      >
        <AuthBranding py={0} />
      </Flex>
    </AppShell>
  );
}

export default SplashScreen;
