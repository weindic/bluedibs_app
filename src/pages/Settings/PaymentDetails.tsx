import { Button, Flex, TextInput } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { addPaymentMethod, getPaymentMethod } from "../Wallet/wallt.api";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

type Props = {};

export function usePaymentInfoQuery() {
  return useQuery({
    queryKey: ["payment_method"],
    queryFn: getPaymentMethod,
    placeholderData: [],
  });
}

function PaymentDetails({}: Props) {

  

  const paymentInfoQuery = usePaymentInfoQuery();
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      upiId: "",
      
    },
  });

  const mutation = useMutation({
    mutationKey: [
      !!paymentInfoQuery.data?.upiId ? "update" : "add",
      "payment-info",
    ],
    mutationFn: addPaymentMethod,

    onSuccess(_, variables) {
      notifications.show({
        message: "Payment Information Successfully Saved!",
      });


  

      queryClient.setQueryData(["payment_method"], (prev: any) => {
        const data: Record<string, any> = prev ? structuredClone(prev) : {};
        data.upiId = variables.upiId;
        data.id = user.id;

        return data;
      });
    },
  });

  useEffect(() => {
    if (!!paymentInfoQuery.data?.upiId) {
      form.setValues({
        upiId: paymentInfoQuery.data.upiId,
      });
    }
  }, [paymentInfoQuery.data]);

  return (
    <Flex py="xl" justify={"center"} h="100%" align={"center"}>
      <Flex direction={"column"} align={"center"} gap={"xs"}>
        <form
          onSubmit={form.onSubmit((vals) => mutation.mutate(vals))}
          style={{ minWidth: 250 }}
        >
          <Flex direction={"column"} w="100%" gap="xs">
            <TextInput
              label="UPI Id"
              defaultValue={paymentInfoQuery.data?.upiId}
              description="Enter your UPI Id"
              w="100%"
              placeholder="abc@okaxis"
              {...form.getInputProps("upiId")}
            />

            <Button type="submit" loading={mutation.isLoading}>
              Submit
            </Button>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
}

export default PaymentDetails;
