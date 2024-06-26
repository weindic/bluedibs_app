import { Flex, Text, createStyles, getStylesRef } from "@mantine/core";
import { PropsWithChildren } from "react";

type TStatement = {
  label: string;
  value: string | number;
  Component?: React.ComponentType;
};

const useStyles = createStyles((theme, params) => ({
  root: {
    borderStyle: "solid",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: "8px",
    overflow: "hidden",
  },

  statement: {
    ref: getStylesRef("statement"),
    padding: "4px 20px",
    backgroundColor: "white",

    ":not(:nth-last-of-type(1))": {
      borderBottom: "1px solid #ccc",
    },
  },
}));

export const Statement = ({ Component, ...data }: TStatement) => {
  const { classes } = useStyles();

  if (!!Component)
    return (
      <Flex className={classes.statement} justify={"space-between"}>
        <Text weight={600} size={"md"}>
          {data.label}
        </Text>

        <Component />
      </Flex>
    );
  else
    return (
      <Flex className={classes.statement} justify={"space-between"}>
        <Text weight={600} size={"md"}>
          {data.label}
        </Text>

        <Text weight={400} ff="Nunito Sans" size={"sm"}>
          {data.value}
        </Text>
      </Flex>
    );
};

Statement.Group = ({ children }: PropsWithChildren) => {
  const { classes } = useStyles();
  return <div className={classes.root}> {children} </div>;
};
