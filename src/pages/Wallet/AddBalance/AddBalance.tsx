import {
  Button,
  Flex,
  Image,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useHistory } from "react-router";
import AppShell from "../../../components/AppShell";
import { HeaderComponent } from "../../../components/Header";
import { useAppSelector } from "../../../store/hooks";
import { assistant } from "../../../utils/tgBotUtil";
import { addBalance } from "./addBalance.api";
import { InstructionModal } from "./phonepay-modal";
import { downloadImage } from "../../../utils/media";

const QrCodeSrc = "/bluedibs_qr_2.png";
const payTm = "/paytm.jpeg";
const phonePay = "/phonepay.jpeg";

function AddBalance() {
  const user = useAppSelector((state) => state.user);
  const history = useHistory();
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const instructionImage = useRef(payTm);

  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      transactionId: "",
      amount: 0,
    },

    validate: {
      amount(val) {
        if (!val || +val < 1) return "Invalid Amount";
      },
      transactionId(val) {
        if (val.length < 6) return "Invalid Transaction ID";
      },
    },
  });

  const mutation = useMutation({
    mutationKey: ["add-payment"],
    mutationFn: (val: typeof form.values) => addBalance(val),
    onSuccess(data) {
      // dispatch(updateUser({ balance: user.balance + data.amount }));
      assistant.sendMessage(
        `Payment request from user: ${user.username} of INR: ${form.values.amount}`
      );

      showNotification({
        title: "Payment request sent.",
        message:
          "Your request sent and balance will be credited within a few minutes if not, contact support in settings",
      });

      setLoading(false)

      history.push("/app/wallet");
    },

    onError(err) {
      if (err?.code == "ERR_BAD_REQUEST")
        return showNotification({
          color: "red",
          title: "Balance reuest post failed",
          message: "Previous Payment still in process",
        });
      console.log(err);
      showNotification({
        color: "red",
        title: "Balance fetch failed",
        message: "Payment still in process or Transaction ID is invalid",
      });
    },
  });

  return (
    <>
    <LoadingOverlay visible={loading}/>
      <InstructionModal
        isModalOpen={instructionModalOpen}
        setInstructionModalOpen={setInstructionModalOpen}
        url={instructionImage.current}
      />
      <AppShell header={<HeaderComponent title="Invest" />}>
        <Stack spacing={30} p="sm">
          <Stack spacing={5}>
            <Title order={4} mb="xs" fw={700}>
              Steps to follow before investing.
            </Title>

            <Text size={"sm"}>Step 1: Download QR code or Take Screenshot</Text>
            <Text size={"sm"}>Step 2: Open Paytm or Phonepe </Text>
            <Text size={"sm"}>Step 3: Click on Scan QR Code</Text>
            <Text size={"sm"}>Step 4: Click on the Gallary option</Text>
            <Text size={"sm"}>Step 5: Select Screenshot and pay amount</Text>
            <Text size={"sm"}>Step 6: Copy Transaction ID and paste it</Text>
            <Text size={"sm"}>Step 7: Mark as Paid</Text>
          </Stack>

          <Image
            sx={{ borderRadius: 10, overflow: "hidden" }}
            styles={{ image: { aspectRatio: "1/1" } }}
            style={{
              objectFit: "contain",
            }}
            withPlaceholder
            src={QrCodeSrc}
          />

          <a href={QrCodeSrc} target="_blank" download><Button
            // onClick={() => {
            //   downloadImage(QrCodeSrc);
            // }}
          >
            Download QR Code
          </Button></a>

          <div>
            <Text size={"sm"}> Instructions to get Txn Id</Text>

            <Flex gap={"lg"} justify={"center"} mt={"sm"}>
              <Button
                size="xs"
                onClick={() => {
                  instructionImage.current = phonePay;
                  setInstructionModalOpen(true);
                 
                }}
              >
                Phone Pay
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  instructionImage.current = payTm;
                  setInstructionModalOpen(true);
                }}
              >
                Pay Tm
              </Button>
            </Flex>
          </div>

          <form
            onSubmit={form.onSubmit((val) => {
              console.log(val);
              mutation.mutate(val);
              setLoading(true);
            })}
          >
            <Stack>
              <TextInput
                type="number"
                label="Amount"
                {...form.getInputProps("amount")}
              />
              <TextInput
                label="Transaction ID"
                placeholder="202304020xxxxxxx or T22030xxxxxxxx"
                {...form.getInputProps("transactionId")}
              />

              <Button type="submit" > Mark as paid</Button>
            </Stack>
          </form>
        </Stack>
      </AppShell>
    </>
  );
}

export default AddBalance;
