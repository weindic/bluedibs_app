import { IonModal, IonRouterLink } from "@ionic/react";
import {
  Anchor,
  Button,
  Code,
  Flex,
  NumberInput,
  Text,
  Title,
} from "@mantine/core";
import AppShell from "../../components/AppShell";
import { HeaderComponent } from "../../components/Header";
import { getFormattedSmallPrice, humanizeNum } from "../../utils";
import { IInvoicesData } from "./WithdrawalRequests";
import { useMutation } from "@tanstack/react-query";

type Props = {
  data: IInvoicesData | null;
  isOpen: boolean;
  closeModal: () => void;
};

function WithdrawCancelConfirmationModal({ isOpen, data, closeModal }: Props) {
  const mutation = useMutation({
    mutationKey: ["cancel-withdrawal-req", data?.id ?? ""],
  });

  return (
    <IonModal isOpen={isOpen} trigger="open-modal" onWillDismiss={closeModal}>
      <AppShell
        isModal
        header={<HeaderComponent title={"Confirm Cancel"} back={closeModal} />}
      >
        {data && (
          <Flex justify={"center"} pb="xl" pt={50} direction={"column"}>
            <Title color="#495057" order={1} align="center" px={"lg"} size={30}>
              Cancel Waithdrawal Request
            </Title>

            <Flex direction={"column"} gap={"md"} p={"lg"} mt="xl">
              <Text>
                Do you wish to cancel withdrawal request with id{" "}
                <Code> {data.id} </Code> & amount <Code>{data.amount}</Code>
              </Text>
            </Flex>

            <Button
              loading={mutation.isLoading}
              size="md"
              onClick={() => mutation.mutate()}
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
        )}
      </AppShell>
    </IonModal>
  );
}

export default WithdrawCancelConfirmationModal;
