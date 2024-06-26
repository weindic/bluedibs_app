import { Anchor, Flex, Table, Text, Title } from "@mantine/core";

type Props = {};

const HelpSupport = (props: Props) => {
  return (
    <Flex pt="xl" justify={"center"} h="100%" align={"center"}>
      <Flex direction={"column"} align={"center"} gap={3}>
        <Title order={2}> Help & Support </Title>

        <Text size={"sm"} color="dimmed" mb="md">
          To get help & support, email or WhatsApp us at:{" "}
        </Text>

        <Table>
          <tr>
            <td style={{ textAlign: "right", paddingRight: 10 }}>Email:</td>
            <td>
              <Anchor href="mailto:Support@bluedibs.com">
                Support@bluedibs.com
              </Anchor>
            </td>
          </tr>

          <tr>
            <td style={{ textAlign: "right", paddingRight: 10 }}>Whatsapp:</td>
            <td>
              <Anchor href="tel:918297373496">+91 8297373496</Anchor>
            </td>
          </tr>
        </Table>
      </Flex>
    </Flex>
  );
};

export default HelpSupport;
