import { IonModal } from "@ionic/react";
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import AppShell from "../../components/AppShell";
import { useAppSelector } from "../../store/hooks";
import { selfSellSharesAPI } from "../User/BuySell/buySell.api";
import { SellOwnEquityConfirmation } from "./SellOwnEquityConfirmation";
import { openSuccessModal } from "../SuccessScreen";
import useUserQuery from "../../hooks/useUserQuery";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SelfSellModal({ opened, onClose, onSuccess }: Props) {
  const modal = useRef<HTMLIonModalElement>(null);
  const user = useAppSelector((state: any) => state.user);
  const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false);
  const queryClient = useQueryClient();

  const getUserQuery = useUserQuery();

  useEffect(() => {
    getUserQuery.refetch();
  }, []);

  const form = useForm({
    initialValues: { percentage: 0 },

    validate: {
      percentage(value) {
        if (!value) return "Percentage must be greater than 0";
      },
    },
  });

  const selfSellMutation = useMutation({
    mutationFn: async (vals: typeof form.values) =>
      selfSellSharesAPI({ percentage: vals.percentage }),
    onSuccess() {
      queryClient.fetchQuery(["user"]);
      form.reset();
      setIsConfirmModalOpened(false);
      onClose();

      openSuccessModal({
        title: "Success",
        type: "success",
        message: `You just sold your ${form.values.percentage}% of Dibs to platform`,
      });

      onSuccess();
    },

    onError(err: any) {
      if (err?.response?.status == 403)
        return notifications.show({
          color: "red",
          title: "Error",
          message: "Cannot sell more than 2.5 equity in 24 hours",
        });
      notifications.show({
        color: "red",
        title: "Error",
        message: "Something went wrong",
      });
    },
  });

  const validateSelfSell = async (vals: typeof form.values) => {
    const maxEquity = parseInt(user.shares) * (parseInt(user.userEquity) / 100);
    if (vals.percentage > maxEquity) {
      return form.setFieldError("percentage", "You don't have that much equity");
    }

    return true;
  };

  if (!opened) return null;

  return (
    <div>
      <IonModal
        ref={modal}
        trigger="open-modal"
        isOpen={opened}
        onWillDismiss={onClose}
      >
        <AppShell
          isModal
          header={
            <Group spacing={"xs"}>
              <ActionIcon
                onClick={() => {
                  form.reset();
                  onClose();
                }}
                variant="light"
              >
                <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
              </ActionIcon>

              <Title order={3} fz={20} weight={600}>
                Your Dibs
              </Title>
            </Group>
          }
        >
          <SellOwnEquityConfirmation
            txn={() => selfSellMutation.mutate(form.values)}
            data={{
              percentage: form.values.percentage,
              amount_receive:
                user.currentInvestmentValue * (form.values.percentage / 100) ||
                0,
            }}
            onWillDismiss={() => setIsConfirmModalOpened(false)}
            isOpen={isConfirmModalOpened}
            isLoading={selfSellMutation.isLoading}
          />

          <form
            onSubmit={form.onSubmit(async (vals) => {
              if ((await validateSelfSell(vals)) === true) {
                setIsConfirmModalOpened(true);
              } else {
                notifications.show({
                  color: "red",
                  title: "Error",
                  message: "Invalid sell request",
                });
              }
            })}
          >
            <Flex direction={"column"} gap={"md"} p={"lg"}>
              <Title order={4}> Sell Dibs request to platform </Title>

              <TextInput
                variant="filled"
                label="Name"
                style={{ pointerEvents: "none" }}
                value={user.username}
              />

              <TextInput
                variant="filled"
                label="Email"
                style={{ pointerEvents: "none" }}
                value={user.email}
              />

              <TextInput
                variant="filled"
                label="Phone"
                style={{ pointerEvents: "none" }}
                value={user.mobile}
              />

              <NumberInput
                min={1}
                label="Dibs Quantity"
                hideControls
                max={parseInt(user.shares) * (parseInt(user.userEquity) / 100)}
                {...form.getInputProps("percentage")}
              />
              <small>
                Note: You can sell max{" "}
                {parseInt(user.shares) * (parseInt(user.userEquity) / 100)} only.
              </small>

              <Flex gap={"xs"}>
                <Text size={"sm"} weight={500} ml={"auto"}>
                  Balance:{" "}
                </Text>

                <Text size={"sm"}> ₹ {user.balance} </Text>
              </Flex>
            </Flex>

            <Button
              size="md"
              type="submit"
              variant="filled"
              color="red"
              style={{
                bottom: 0,
                position: "fixed",
                width: "100%",
                borderRadius: 0,
              }}
            >
              Sell
            </Button>
          </form>
        </AppShell>
      </IonModal>
    </div>
  );
}
