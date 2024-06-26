import { IonModal } from "@ionic/react";
import {
  Flex,
  Button,
  Tabs,
  Group,
  Title,
  ActionIcon,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRef, useState } from "react";
import { BuyFrom } from "./BuySell/BuyForm";
import { SellForm } from "./BuySell/SellForm";
import AppShell from "../../components/AppShell";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";

export function BuySellModal({
  userData,
  CharHOC,
  onSuccess,
}: {
  userData: any;
  CharHOC: any;
  onSuccess?: () => void;
}) {
  const modal = useRef<HTMLIonModalElement>(null);
  const [modalOpenned, setOpen] = useState<"buy" | "sell" | false>(false);

  const buySellForm = useForm({
    initialValues: {
      amount: 0,
      total: 0,
    },
  });

  return (
    <div>
      <Flex
        style={{
          position: "fixed",
          bottom: 0,
          backgroundColor: "white",
          width: "100%",
          padding: "10px 40px",
        }}
        gap={"lg"}
      >
        <Button
          style={{ flexGrow: 1, borderColor: "#2f9e44", color: "#2f9e44" }}
          variant="outline"
          color="#2f9e44"
          onClick={() => setOpen("sell")}
        >
          Sell
        </Button>
        <Button
          style={{ flexGrow: 1, color: "white" }}
          variant="filled"
          color="green"
          onClick={() => setOpen("buy")}
        >
          Buy
        </Button>
      </Flex>

      <IonModal
        ref={modal}
        isOpen={!!modalOpenned}
        trigger="open-modal"
        onWillDismiss={() => {
          setOpen(false);
        }}
      >
        <AppShell
          isModal
          header={
            <Group spacing={"xs"}>
              <ActionIcon
                onClick={() => {
                  buySellForm.reset();
                  setOpen(false);
                }}
                variant="light"
              >
                <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
              </ActionIcon>

              <Title order={3} fz={20} weight={600}>
                {userData.username}'s' Shares
              </Title>
            </Group>
          }
        >
          <Tabs
            unstyled
            variant="pills"
            styles={(theme) => ({
              root: {
                height: "100%",
              },
              tab: {
                ...theme.fn.focusStyles(),
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.white,
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.gray[9],
                border: `${rem(1)} solid ${
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[4]
                }`,
                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                cursor: "pointer",
                fontSize: theme.fontSizes.sm,
                display: "flex",
                alignItems: "center",

                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },

                "&:not(:first-of-type)": {
                  borderLeft: 0,
                },

                "&:first-of-type": {
                  borderTopLeftRadius: theme.radius.md,
                  borderBottomLeftRadius: theme.radius.md,
                },

                "&:last-of-type": {
                  borderTopRightRadius: theme.radius.md,
                  borderBottomRightRadius: theme.radius.md,
                },

                "&[data-active]": {
                  backgroundColor: theme.colors.blue[7],
                  borderColor: theme.colors.blue[7],
                  color: theme.white,
                },
                width: "100%",

                justifyContent: "center",
              },

              tabIcon: {
                marginRight: theme.spacing.xs,
                display: "flex",
                alignItems: "center",
              },

              tabsList: {
                display: "flex",
              },
            })}
            defaultValue={modalOpenned as "buy" | "sell"}
          >
            <Tabs.List grow p="md">
              <Tabs.Tab value="buy">Buy</Tabs.Tab>
              <Tabs.Tab value="sell">Sell</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="buy" pt="xs">
              <BuyFrom
                userData={userData}
                closeModal={() => setOpen(false)}
                CharHOC={CharHOC}
                onSuccess={onSuccess}
              />
            </Tabs.Panel>

            <Tabs.Panel value="sell" pt="xs">
              <SellForm
                userData={userData}
                closeModal={() => setOpen(false)}
                CharHOC={CharHOC}
                onSuccess={onSuccess}
              />
            </Tabs.Panel>
          </Tabs>
        </AppShell>
      </IonModal>
    </div>
  );
}
