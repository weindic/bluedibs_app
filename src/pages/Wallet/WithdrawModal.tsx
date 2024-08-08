import { IonModal, IonRouterLink } from "@ionic/react";
import { Anchor, Button, Flex, NumberInput, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import AppShell from "../../components/AppShell";
import { HeaderComponent } from "../../components/Header";
import { useAppSelector } from "../../store/hooks";
import { getFormattedSmallPrice, humanizeNum } from "../../utils";
import { showNotification } from "@mantine/notifications";
import { withdrawalAPI } from "./withdrawal.api";
import { getPaymentMethod } from "./wallt.api";

interface Props {
  isOpen: boolean;
  close: () => void;
}

export function WithdrawModal({ isOpen, close }: Props) {
  const user = useAppSelector((state) => state.user);

  const paymentInfoQuery = useQuery({
    queryKey: ["payment_method"],
    queryFn: getPaymentMethod,
  });

  const form = useForm({
    initialValues: {
      amount: 0,
    },

    validate: {
      amount: (val) => {
        if (!val) return "Minimum amount for withdrawal is 1";
        if (val > user.balance) "Not enough balance";
        return null;
      },
    },
  });

  const mutation = useMutation({
    mutationFn: withdrawalAPI,
    mutationKey: ["withdraw-money"],
    onSuccess() {
      closeModal();

      showNotification({
        color: "green",
        title: "Withdrawal request sent",
        message:
          "your request has been sent money will be credited in your bank account within 24 hours.",
      });
    },
    onError(error) {
      if (error?.response?.status === 422) {
        showNotification({
          color: "red",
          title: "Withdrawal request failed",
          message: "Not enough balance for withdrawal",
        });
      } else {
        showNotification({
          color: "red",
          title: "Withdrawal request failed",
          message: "",
        });
      }
    },
  });

  function closeModal() {
    close();
    form.reset();
  }

  return (
    <IonModal isOpen={isOpen} trigger="open-modal" onWillDismiss={closeModal}>
      <AppShell
        isModal
        header={<HeaderComponent title={"Withdraw Money"} back={closeModal} />}
      >
        <Flex justify={"center"} pb="xl" pt={50} direction={"column"}>
          <Title color="#495057" order={1} align="center" px={"lg"}>
            Withdraw Money
          </Title>

          <Flex direction={"column"} gap={"md"} p={"lg"} mt="xl">
         <NumberInput 
   min={1}
              variant="filled"
              label="Amount"
              {...form.getInputProps("amount")}
              description={`Balance: ${getFormattedSmallPrice(user.balance)}`}
              max={Math.floor(user.balance)}
            />

            <Text size="xs" color="dimmed">
              Total Balance {user.balance}
            </Text>
            <Text size="xs" color="dimmed">
              Balance left after transaction{" "}
              {humanizeNum(
                getFormattedSmallPrice(user.balance - form.values.amount)
              )}
            </Text>

            {/* <Flex mt="xl" justify={"end"}>
              <Anchor
                onClick={closeModal}
                component={IonRouterLink}
                routerLink="/app/withdrawal-requests"
                size="sm"
              >
                View previous requests & invoices.
              </Anchor>
            </Flex> */}
          </Flex>

          <Button
            loading={mutation.isLoading}
            size="md"
            onClick={() => {
              if (form.validate().hasErrors) {
                console.log(form.errors);
                return;
              }

              if (!paymentInfoQuery.data?.upiId) {
                showNotification({
                  color: "red",
                  title: "UPI ID not configured",
                  message: "Please Add upi ID in Settings.",
                });
              }

              mutation.mutate({ amount: form.values.amount });
            }}
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
