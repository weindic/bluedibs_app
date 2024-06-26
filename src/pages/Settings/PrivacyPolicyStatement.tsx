import { Title, Text } from "@mantine/core";

export const HeadAndBodyStmts = ({
  title,
  subHeads,
}: {
  title: string;
  subHeads: string[];
}) => (
  <div>
    <Title order={5} mt={"md"}>
      {" "}
      {title}
    </Title>
    {subHeads.map((item) => (
      <Text size={"sm"}>{item}</Text>
    ))}
  </div>
);
