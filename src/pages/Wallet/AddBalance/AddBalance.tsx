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
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

const QrCodeSrc = "/bluedibs_qr_2.png";
const payTm = "/paytm.jpeg";
const phonePay = "/phonepay.jpeg";

function AddBalance() {
  const user = useAppSelector((state) => state.user);
  const history = useHistory();
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const instructionImage = useRef(payTm);

  const [loading, setLoading] = useState(false);

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
      assistant.sendMessage(
        `Payment request from user: ${user.username} of INR: ${form.values.amount}`
      );

      showNotification({
        title: "Payment request sent.",
        message:
          "Your request sent and balance will be credited within a few minutes if not, contact support in settings",
      });

      setLoading(false);

      history.push("/app/wallet");
    },

    onError(err) {
      setLoading(false); // Stop loading on error
      if (err?.code === "ERR_BAD_REQUEST") {
        return showNotification({
          color: "red",
          title: "Balance request post failed",
          message: "Previous Payment still in process",
        });
      }
      console.error(err);
      showNotification({
        color: "red",
        title: "Balance fetch failed",
        message: "Payment still in process or Transaction ID is invalid",
      });
    },
  });

  const downloadImageToGallery = async (imageUrl: string) => {
    try {
      setLoading(true); // Start loading

      // Step 1: Fetch the image data as a Blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Step 2: Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Step 3: Write the file to the device's filesystem
        const fileName = "downloaded-image.jpg";
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data.split(",")[1], // Remove the base64 prefix
          directory: Directory.Documents, // Use Documents for better compatibility
        });

        // Step 4: Share the file to the gallery
        await Share.share({
          title: "Download Complete",
          text: "Image saved to gallery.",
          url: Capacitor.convertFileSrc(savedFile.uri),
          dialogTitle: "Save to gallery",
        });

        console.log("Image saved to gallery:", savedFile);
      };

      setLoading(false); // Stop loading after operation completes
    } catch (error) {
      setLoading(false); // Stop loading on error
      console.error("Error downloading image to gallery:", error);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
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

            <Text size={"sm"}>
              Step 1: Download QR code or Take Screenshot
            </Text>
            <Text size={"sm"}>Step 2: Open Paytm or Phonepe </Text>
            <Text size={"sm"}>Step 3: Click on Scan QR Code</Text>
            <Text size={"sm"}>Step 4: Click on the Gallery option</Text>
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

          <Button
            onClick={() => {
              downloadImageToGallery(
                "https://res.cloudinary.com/dzmexswgf/image/upload/v1723146123/bluedibs_qr_2_2_kyyoxx.png"
              );
            }}
          >
            Download QR Code
          </Button>

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
              setLoading(true); // Start loading when submitting the form
              mutation.mutate(val);
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

              <Button type="submit"> Mark as paid</Button>
            </Stack>
          </form>
        </Stack>
      </AppShell>
    </>
  );
}

export default AddBalance;
