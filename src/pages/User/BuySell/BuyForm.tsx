import { Button, Flex, NumberInput, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { getFormattedSmallPrice, humanizeNum } from "../../../utils";
import { BuyConfirmation } from "../../Wallet/BuyConfirmaation";
import { buySharesAPI } from "./buySell.api";
import { database } from "../../../utils/firebase";
import { push, ref } from "firebase/database";
import { NotifyUser } from "../../../utils/notification";
import useUserQuery from "../../../hooks/useUserQuery"; // Import useUserQuery hook
import { openSuccessModal } from "../../SuccessScreen";
import { showNotification } from "@mantine/notifications";
import { sendNotificationApi } from "../../Notification/notification.api";
import { IonCard } from "@ionic/react";

export function BuyFrom({
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
  const user = useAppSelector((state) => state.user);
  const client = useQueryClient();

  const getUserQuery = useUserQuery(); // Use the useUserQuery hook to fetch user data

  useEffect(() => {

    getUserQuery.refetch();
    
  }, []); // Add getUserQuery to the dependency array

  const sharesVailable =
    userData.shares -
    ((userData.Sold as any[]) || [{ amount: 0 }]).reduce(
      (acc, cur) => acc + cur.amount,
      0
    );

  const [confirm, setConfirm] = useState(false);
  
  const buySharesMut = useMutation({


    mutationFn: (vals: any) => buySharesAPI(userData.id, vals),

    onError({ response }) {
      if (response.status == 403) {
        showNotification({
          color: "red",
          message: response.data.message,
        });
      }
    },

    async onSuccess(_, value) {
      await client.fetchQuery(["user"]);

      let message = `${user.username} bought ${buyForm.values.amount} Dibs, ${
        (buyForm.values.total * 0.2) / 100
      } added to your balance `;

      sendNotificationApi(user.id, userData.id, userData.id, message, "buy");

      openSuccessModal({
        title: "Success",
        type: "success",
        message: `You just baught Dibs of @${userData.username} worth ${humanizeNum(
          getFormattedSmallPrice(buyForm.values.amount)
        )} Rs`,
      });

      closeModal();
      onSuccess?.();
    },
  });

  const buyForm = useForm<{
    amount: number;
    total: number;
    buyer_id:string;
  }>({
    initialValues: {
      total: 0,
      amount: 0,
      buyer_id:user.id
    },
    validate: {
      amount: (val) => {
        if (!val) return "Amount must not be empty";
      },

      total: (value: number) =>
        value > userData.shares - (userData.sold || 0)
          ? `Not enough Dibs left, current: ${getFormattedSmallPrice(
              userData.shares - (userData.sold || 0) < 0
                ? 0
                : userData.shares - (userData.sold || 0)
            )}`
          : null,
    },
  });

  return (
    <form
      onSubmit={buyForm.onSubmit(() => setConfirm(true))}
      style={{ paddingBottom: 40 }}
    >
      <BuyConfirmation
        isOpen={confirm}
        txn={() => {
          buySharesMut.mutate(buyForm.values);
        }}
        onWillDismiss={() => setConfirm(false)}
        data={{
          share_amont: buyForm.values.amount,
          share_price: userData.price,
          total_amount:
            userData.price * buyForm.values.amount +
            (userData.price * buyForm.values.amount * 0.2) / 100,
          txn_fee: (userData.price * buyForm.values.amount * 0.2) / 100,
          quantity: buyForm.values.total,
        }}
        isLoading={buySharesMut.isLoading}
      />

      <div style={{ height: 200 }}>{CharHOC}</div>
      <Flex direction={"column"} gap={"md"} p={"lg"}>
        <TextInput
          variant="filled"
          label="Market Rate"
          style={{ pointerEvents: "none" }}
          value={`₹ ${userData.price}`}
        />

        <TextInput
          variant="filled"
          label="Total Dibs Allocated"
          style={{ pointerEvents: "none" }}
          value={`${getFormattedSmallPrice(userData.shares)}`}
        />

        <TextInput
          variant="filled"
          label="Dibs Available"
          style={{ pointerEvents
            : "none" }}
            value={`${getFormattedSmallPrice(sharesVailable)}`}
          />
  
          <TextInput
            mt={"lg"}
            variant="filled"
            label="Quantity"
            style={{ pointerEvents: "none" }}
            {...buyForm.getInputProps("total")}
          />
  
       <NumberInput 
   min={1}
            hideControls
            type="number"
            variant="filled"
            label="Amount INR"
            placeholder="Amount in INR eg: 1000"
            {...buyForm.getInputProps("amountMoney")}
            onChange={(e: number) => {
              buyForm.setValues({
                amount: e / userData.price,
                total: e / userData.price,
              });
            }}
          />
  
          {/* Add radio buttons for payment method */}

         
            <small>Choose payment method.</small>
          <Flex gap="md" align="center">
            <input
              type="radio"
              id="wallet"
              name="type"
              value="wallet"
              checked={buyForm.values.type === "wallet"}
              onChange={() => buyForm.setFieldValue("type", "wallet")}
            />
            <label htmlFor="wallet">Wallet Balance</label>
  
            <input
              type="radio"
              id="refferal"
              name="type"
              value="refferal"
              checked={buyForm.values.type === "refferal"}
              onChange={() => buyForm.setFieldValue("type", "refferal")}
            />
            <label htmlFor="refferal">Refferal Balance</label>
          </Flex>
   
        
  
          <Flex gap={"xs"}>
            <Text size={"sm"} weight={500}>
              Platform Fees:{" "}
            </Text>
  
            <Text size={"sm"}> 0.2% </Text>
            <Text size={"sm"} weight={500} ml={"auto"}>
              Balance:{" "}
            </Text>
  
            <Text size={"sm"}> ₹ {user.balance}</Text>
          </Flex>
        </Flex>
  
        <Button
          type="submit"
          size="md"
          variant="filled"
          color="green"
          style={{
            bottom: 0,
            position: "fixed",
            width: "100%",
            borderRadius: 0,
          }}
        >
          Buy
        </Button>
      </form>
    );
  }
  