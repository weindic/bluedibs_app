import { IonModal } from "@ionic/react";
import { Button, Flex, Text, Title } from "@mantine/core";
import AppShell from "../../components/AppShell";
import { HeaderComponent } from "../../components/Header";
import { useAppSelector } from "../../store/hooks";
import { getFormattedSmallPrice } from "../../utils";

const LabelVale = (data: any) => (
  <Flex justify={"space-between"}>
    <Text size={"lg"} weight={500} color="#868E96">
      {data.label}
    </Text>
    <Text size={"lg"} weight={600} color="#868E96">
      {data.value}
    </Text>
  </Flex>
);

export function SellOwnEquityConfirmation({
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
        header={<HeaderComponent title={"Confirm Sell"} back={onWillDismiss} />}
      >
        <Flex justify={"center"} pb="xl" pt={50} direction={"column"}>
          <Title color="#495057" order={1} align="center">
            Confirm Order
          </Title>

          <div style={{ alignItems: "center", marginTop: "50px" }}>
            <Text align="center" size={"lg"}>
              You Will Receive
            </Text>

            <Title align="center" order={1} size={40} weight={600}>
              {getFormattedSmallPrice(data.amount_receive)}
            </Title>

            <Text align="center" size={"lg"}>
              Rupees
            </Text>
          </div>

          <div style={{ margin: "15%" }}>
            <LabelVale label="TIIYD" value={user.currentInvestmentValue} />
            <LabelVale label="Dibs Sell" value={data.percentage} />
            <LabelVale label={`Platform Dibs Sell `} value={"2.5%"} />
          </div>

          <Button
            loading={isLoading}
            size="md"
            onClick={() => txn()}
            variant="filled"
            color="red"
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
