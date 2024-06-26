import { Box, Flex, Text, Title } from "@mantine/core";
import { PropsWithChildren, useEffect, useState } from "react";

import SuccessAnimationRaw from "../animations/success.json";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

type Props = {} & PropsWithChildren;

type SuccessScreenState = {
  title: string;
  message?: string;
  // type: "success" | "error";
  type: "success";
};

type Ref = {
  openSuccessModal?: (state: SuccessScreenState) => void;
};

const ref: Ref = {};

const MTitle = motion(Title);

export default function SuccessScreen({ children }: Props): JSX.Element {
  const [state, setState] = useState<null | SuccessScreenState>(null);

  ref.openSuccessModal = setState;

  useEffect(() => {
    if (!state) return;

    const timeout = setTimeout(() => {
      setState(null);
      clearTimeout(timeout);
    }, 4000);
  }, [state]);

  if (!!state) {
    return (
      <Flex
        sx={(theme) => ({
          height: "100vh",
          width: "100vw",
          background:
            state.type === "success" ? "rgb(39, 174, 96)" : theme.colors.red[7],

          color: "white",
        })}
        justify={"center"}
        align={"center"}
      >
        <Flex px="xl" direction={"column"} align={"center"}>
          <Lottie animationData={SuccessAnimationRaw} loop={false} />

          <MTitle mb="md" layout>
            {state?.title}
          </MTitle>

          {state?.message && (
            <Text component={motion.p} ta="center" layout>
              {state?.message}
            </Text>
          )}
        </Flex>
      </Flex>
    );
  }

  return <>{children}</>;
}

function openSuccessModal(args: SuccessScreenState) {
  ref.openSuccessModal?.(args);
}

export { openSuccessModal };
