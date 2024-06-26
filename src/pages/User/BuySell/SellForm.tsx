import { Button, Flex, NumberInput, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store/hooks";
import { getFormattedSmallPrice, humanizeNum } from "../../../utils";
import { SellConfirmation } from "../../Wallet/Sell Confirmaation";
import { NotifyUser } from "../../../utils/notification";
import { sellSharesAPI } from "./buySell.api";
import { showNotification } from "@mantine/notifications";
import { openSuccessModal } from "../../SuccessScreen";
import { sendNotificationApi } from "../../Notification/notification.api";

export function SellForm({
  userData,
  CharHOC,
  closeModal,
  onSuccess,
}: {
  userData: any;
  CharHOC: any;
  closeModal: () => void;
  onSuccess?: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const user = useAppSelector((state) => state.user);
  const diapatch = useDispatch();
  const client = useQueryClient();

  const sellForm = useForm({
    initialValues: {
      amount: 0,
    },
    validate: {
      amount: (vals) => (!vals ? "Amont but not be empty" : null),
    },
  });

  const availableShares = useMemo(
    () => userData.Sold.find(({ buyer_id }) => buyer_id === user.id)?.amount,
    [userData, user]
  );

  const sell_shares_mut = useMutation({
    mutationFn: async (vals: any) => sellSharesAPI(userData.id, vals),
    // mutationFn: (vals: any) => sellSharesAPI(userData.id, vals),
    onError({ response }) {
      // console.log(err)
      showNotification({
        message: response.data.message || "something went wrong",
        color: "red",
      });
    },

    async onSuccess(_, vals) {
      await client.refetchQueries(["user"]);
      //  diapatch(setUser(data))
      // TODO : refactor like sell form, instead of amount INR should be taken input from the user
      // NotifyUser(userData.id, {
      //   from: user.id,
      //   message: `${user.username} sold ${
      //     sellForm.values.amount
      //   } Shares back to you,  ${
      //     (sellForm.values.amount * 0.2) / 100
      //   } added to your balance`,
      // });

      let message = `${user.username} sold ${
        sellForm.values.amount
      } Shares back to you,  ${
        (sellForm.values.amount * 0.2) / 100
      } added to your balance`;


      sendNotificationApi(user.id, userData.id, userData.id, message, 'sell')

      closeModal();
      // diapatch(
      //   updateUser({ balance: user.balance - userData.price * vals.amount })
      // );

      openSuccessModal({
        title: "Success",
        type: "success",
        message: `You sold shares of @${userData.username} worth ${humanizeNum(
          getFormattedSmallPrice(sellForm.values.amount)
        )} Rs`,
      });

      onSuccess?.();
    },
  });

  return (
    <form
      onSubmit={sellForm.onSubmit((vals) => setConfirm(true))}
      style={{ paddingBottom: 40 }}
    >
      <SellConfirmation
        txn={() => sell_shares_mut.mutate(sellForm.values)}
        data={{
          shares_amount: sellForm.values.amount,
          amount_receive: sellForm.values.amount * userData.price,
          share_price: userData.price,
          quantity: sellForm.values.amount,
        }}
        onWillDismiss={() => setConfirm(false)}
        isOpen={confirm}
        isLoading={sell_shares_mut.isLoading}
      />

      {!!userData?.graphData && <div style={{ height: 200 }}>{CharHOC}</div>}

      <Flex direction={"column"} gap={"md"} p={"lg"}>
        <TextInput
          variant="filled"
          label="Market Rate"
          style={{ pointerEvents: "none" }}
          value={`₹ ${userData.price}`}
        />

        <TextInput
          variant="filled"
          label="Shares Holding"
          style={{ pointerEvents: "none" }}
          value={`${availableShares ?? 0}`}
        />

        <TextInput
          variant="filled"
          label="Total"
          style={{ pointerEvents: "none" }}
          {...sellForm.getInputProps("total")}
          value={`₹ ${(sellForm.values.amount || 0) * userData.price}`}
        />

        <NumberInput
          hideControls
          type="number"
          variant="filled"
          label="Amount"
          {...sellForm.getInputProps("amount")}
          onChange={(e) => {
            sellForm.getInputProps("amount").onChange(e);
            sellForm.setValues({
              amount: parseInt(e.target.value),
              total: parseInt(e.target.value) * userData.price,
            });
          }}
          placeholder="Shares Quantity"
          max={availableShares}
        />

        <Flex gap={"xs"}>
          <Text size={"sm"} weight={500}>
            Platform Fees:{" "}
          </Text>

          <Text size={"sm"}> 0.2% </Text>
          <Text size={"sm"} weight={500} ml={"auto"}>
            Balance:{" "}
          </Text>

          <Text size={"sm"}>
            {" "}
            ₹ {humanizeNum(getFormattedSmallPrice(user.balance))}{" "}
          </Text>
        </Flex>
      </Flex>

      <Button
        type="submit"
        size="md"
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
  );
}
