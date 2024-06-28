import { Button, Flex, FlexProps, Stack, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useHistory } from "react-router";
import AppShell from "../components/AppShell";
import { motion } from "framer-motion";

type Props = {};

const items = [
  "Buy/Sell your friend's Units.",
  "Share/Earn Without Limit.",
  "Your Network is Your Net Worth.",
];

const MotionText = motion(Text);

function Onboarding({}: Props) {
  const history = useHistory();

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
        <Stack spacing={60} align="center">
          <AuthBranding py={0} />

          <Stack align="center">
            {items.map((item, index) => (
              <MotionText
                component="span"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index / 2.5,
                  stiffness: 0,
                  ease: "easeOut",
                  duration: 0.5,
                }}
                fw={600}
                key={index}
              >
                • {item}
              </MotionText>
            ))}
          </Stack>

          <Button
            rightIcon={<IconChevronRight size={18} />}
            onClick={() =>{ history.push("/auth/login"); }}
          >
            Get Started for Free
          </Button>
        </Stack>
      </Flex>
    </AppShell>
  );
}

export function AuthBranding(props: FlexProps) {
  return (
    <Flex justify={"center"} w="100%" pt={10} pb={10} {...props}>
      <motion.img layout src={"/logo.png"} style={{ maxWidth: 200 }} />
    </Flex>
  );
}

export default Onboarding;
