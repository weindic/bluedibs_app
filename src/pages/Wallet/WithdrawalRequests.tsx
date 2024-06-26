import { Button, Flex, Stack, Text, Title } from "@mantine/core";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import { HeaderComponent } from "../../components/Header";
import { useState } from "react";
import WithdrawCancelConfirmationModal from "./WithdrawCancelConfirmationModal";

type Props = {};

export type IInvoicesData = {
  type: "invoice" | "request";
  id: string;
  amount: number;
  status: "paid" | "unpaid" | "cancelled";
};

function WithdrawalRequests({}: Props) {
  const [selectedInvoice, setselectedInvoice] = useState<null | IInvoicesData>(
    null
  );

  const arr: IInvoicesData[] = Array(10)
    .fill(0)
    .map((_, index) => {
      let rand = Math.random();
      let status: IInvoicesData["status"] = "paid";
      if (rand > 0) status = "cancelled";

      if (rand > 0.33) status = "unpaid";

      if (rand > 0.66) status = "paid";

      return {
        type: Math.random() > 0.5 ? "invoice" : "request",
        id: "_" + crypto.randomUUID().replaceAll(/-/g, "").slice(0, 10),
        amount: Math.floor(Math.random() * 10000),
        status,
      };
    });

  function confimCancel(index: number) {
    setselectedInvoice(arr[index]);
  }

  return (
    <AppShell header={<HeaderComponent title="Withdrawal Requests" />}>
      <WithdrawCancelConfirmationModal
        data={selectedInvoice}
        isOpen={!!selectedInvoice}
        closeModal={() => {
          setselectedInvoice(null);
        }}
      />

      <Stack p="md">
        {arr.map((data, index) => {
          return (
            <Invoice
              key={data.id}
              {...data}
              onCancel={() => confimCancel(index)}
            />
          );
        })}
      </Stack>
    </AppShell>
  );
}

function Invoice(props: IInvoicesData & { onCancel: () => void }) {
  return (
    <Flex
      sx={(theme) => ({
        padding: "7px 10px",
        background: theme.colors.gray[0],
        border: `1px solid ${theme.colors.gray[2]}`,
        borderRadius: theme.radius.md,
      })}
      gap={"md"}
      align={"center"}
    >
      <Flex direction={"column"} w="100%">
        <Title order={6} fw={600}>
          Invoice id:{" "}
          <Text size={"xs"} component="span" fw={400}>
            {props.id}{" "}
          </Text>
        </Title>

        <Text size="xs" color="dimmed" weight={400}>
          Status:{" "}
          <Text
            component="span"
            py={1}
            px={3}
            sx={(theme) => {
              let bg: keyof typeof theme.colors = "red";
              let color: keyof typeof theme.colors = "dark";

              if (props.status === "cancelled") {
                bg = "red";
                color = "white";
              }
              if (props.status === "unpaid") bg = "yellow";
              if (props.status === "paid") bg = "green";

              return {
                borderRadius: theme.radius.sm,
                background: theme.colors[bg][6],
                color: theme.colors[color]?.[9] ?? color,
              };
            }}
          >
            {props.status === "paid" && "Paid"}
            {props.status === "unpaid" && "Unpaid"}
            {props.status === "cancelled" && "Cancelled"}
          </Text>
        </Text>

        <Text size="xs" color="dimmed" weight={400}>
          Amount: {props.amount}
        </Text>
      </Flex>

      {props.status === "unpaid" && (
        <Button onClick={props.onCancel} size="xs">
          Cancel
        </Button>
      )}
    </Flex>
  );
}

export default WithdrawalRequests;
