import { IonModal } from "@ionic/react";
import { Button, Flex, Text, Title } from "@mantine/core";
import AppShell from "../../components/AppShell";
import { HeaderComponent } from "../../components/Header";
import { useAppSelector } from "../../store/hooks";

const LabelVale = (data: any) => (
  <Flex justify={"space-between"}>
    <Text size={"xl"} weight={500} color="#868E96">
      {data.label}
    </Text>
    <Text size={"md"} weight={600} lh={2} color="#868E96">
      {parseFloat(data.value).toFixed(2)}
    </Text>
  </Flex>
);

export function BuyConfirmation({
  txn,
  data,
  onWillDismiss,
  isOpen,
  isLoading,
}: {
  txn: () => void;
  data: any;
  onWillDismiss: any;
  isOpen: boolean;
  isLoading: boolean;
}) {
  const user = useAppSelector((state) => state.user);

  return (
    <IonModal
      isOpen={isOpen}
      trigger="open-modal"
      onWillDismiss={(ev) => onWillDismiss(ev)}
    >
      <AppShell
        isModal
        header={<HeaderComponent title={"Confirm Buy"} back={onWillDismiss} />}
      >
        <Flex justify={"center"} pb="xl" pt={50} direction={"column"}>
          <Title color="#495057" order={1} align="center">
            Confirm Order
          </Title>

          <div
            style={{
              alignItems: "center",
              marginTop: "50px",
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <Text align="center" size={"lg"}>
              You Will Receive
            </Text>

            <Title align="center" order={1} size={40} weight={600}>
              {data.share_amont}
            </Title>

            <Text align="center" size={"lg"}>
              Shares
            </Text>
          </div>

          <div style={{ margin: "15%" }}>
            <LabelVale label="Quantity" value={data.quantity} />
            <LabelVale label="Share Price" value={data.share_price} />
            <LabelVale label="Total Spend" value={data.total_amount} />
            <LabelVale label="Fee (%0.2)" value={data.txn_fee} />

            <LabelVale label="Balance" value={user.balance} />
          </div>

          <Button
            size="md"
            onClick={() => txn()}
            loading={isLoading}
            variant="filled"
            color="green"
            style={{
              bottom: 0,
              position: "fixed",
              width: "100%",
              borderRadius: 0,
            }}
          >
            Confirm
          </Button>
        </Flex>
      </AppShell>
    </IonModal>
  );
}
