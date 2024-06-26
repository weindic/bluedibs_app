import { Flex, Loader } from "@mantine/core";
import React from "react";

const CustomLoader = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <Flex w="100%" justify={"center"}>
      <Loader my="xl" />
    </Flex>
  );
};

export default CustomLoader;
