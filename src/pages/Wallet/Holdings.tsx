import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonModal,
} from "@ionic/react";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { searchOutline } from "ionicons/icons";
import { useMemo, useState } from "react";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import { Chart } from "../../components/Chart";
import { HeaderComponent } from "../../components/Header";
import { getFormattedSmallPrice, humanizeNum } from "../../utils";
import { usePaymentInfoQuery } from "../Settings/PaymentDetails";
import { SellForm } from "../User/BuySell/SellForm";
import { fetchUserDetails } from "../User/api.user";
import { Statement } from "./Statement";
import { notifications, showNotification } from "@mantine/notifications";

export function Holdings({ query }: { query: UseQueryResult<any, unknown> }) {
  const [modalOpenned, setOpen] = useState<boolean>(false);
  const [userDet, setUserDet] = useState<any | null>();
  const history = useHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200, {
    leading: true,
  });

  const fetchUserProfile = async (id: string) => {
    const details = await fetchUserDetails(id);
    setUserDet(details);
    setOpen(true);
  };

  const paymentInfoQuery = usePaymentInfoQuery();

  const queryClient = useQueryClient();

  const chart = useMemo(() => {
    const chartsData = userDet?.graphData?.map((item: any) => ({
      x: new Date(item.date),
      y: item.price,
    }));

    console.log('chartsData', chartsData)

    return <Chart data={chartsData} />;
  }, [userDet]);



  return (
    <div>
      <IonModal trigger="open-modal" isOpen={modalOpenned}>
        <AppShell
          isModal
          header={
            <HeaderComponent title="Dibs" back={() => setOpen(false)} />
          }
        >
          {!!userDet && (
            <SellForm
              onSuccess={() => {
                query.refetch();
                queryClient.invalidateQueries(["user", userDet.id]);
              }}
              userData={userDet}
              CharHOC={chart}
              closeModal={() => setOpen(false)}
            />
          )}
        </AppShell>
      </IonModal>

      <Stack mt={"sm"} pt="xl">
        <Statement.Group>
          <Statement
            label="Balance"
            value={`₹ ${humanizeNum(query.data?.balance || 0)}`}
          />

          <Statement
            label="Total Investment"
            value={`₹ ${humanizeNum(query.data?.ttlInvestment || 0)}`}
          />

          <Statement
            label="Total Returns"
            value={``}
            Component={() => {
              if (query.data?.ttlReturns < 0) {
                return (
                  <Text ff="Nunito Sans" weight={400} size={"sm"} color="red">
                    {" "}
                    {humanizeNum(query.data?.ttlReturns || 0)
                      .toString()
                      .replace("-", "₹ - ")}
                  </Text>
                );
              } else
                return (
                  <Text ff="Nunito Sans" weight={400} size={"sm"} color="green">
                    + ₹ {getFormattedSmallPrice(query.data?.ttlReturns || 0)}
                  </Text>
                );
            }}
          />
        </Statement.Group>

        <Flex gap="sm" w="100%">
          <Button
            color="green"
            fullWidth
            onClick={() => {
              if (!paymentInfoQuery.data?.upiId?.length) {
                return showNotification({
                  color: "red",
                  title: "Please add UPI ID first",
                  message: "Please Add upi ID in Settings.",
                  id: "upi-id-err",
                });
              }

              history.push("/app/wallet/invest");
            }}
          >
            Add Money
          </Button>
        </Flex>

        <Divider my={"sm"} />

        <Paper>
          <Group noWrap position="apart" mb="sm">
            <Text weight={600} component="span" w="100%">
              Current Statistics
            </Text>

            <TextInput
              w="100%"
              placeholder="Search"
              size="xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              icon={<IonIcon icon={searchOutline} />}
              rightSection={
                searchQuery.length ? (
                  <ActionIcon onClick={() => setSearchQuery("")} size="xs">
                    <IconX size="12" />
                  </ActionIcon>
                ) : null
              }
            />
          </Group>
          <Text size={"sm"} mb={"xs"} color="002" italic>
            swipe left for actions
          </Text>

          <Box
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[2],
              borderRadius: theme.radius.md,
              border: "1px solid",
              borderColor: theme.colors.gray[3],
              overflow: "hidden",
            })}
          >
            <div style={{ padding: "10px 15px" }}>
              <Grid
                w={"100%"}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 550,
                  color: "#495057",
                }}
              >
                <Grid.Col span={4}>Name</Grid.Col>
                <Grid.Col span={4}>Quantity</Grid.Col>
                <Grid.Col span={4}>Value</Grid.Col>
              </Grid>
            </div>

            <IonList style={{ padding: 0, margin: 0 }}>
              {(query.data?.holdings ?? [])
                .filter((holding: any) =>
                  holding.sellerUser.username
                    .toLowerCase()
                    .startsWith(debouncedSearchQuery.toLowerCase())
                )
                .map((item: any) => (
                  <IonItemSliding
                    key={item?.ownership_id}
                    style={{ padding: 0, margin: 0 }}
                  >
                    <IonItem lines="full" style={{ border: "none" }}>
                      <Grid w={"100%"} style={{ fontSize: "0.8rem" }}>
                        <Grid.Col span={4} pr={0}>
                          <Text
                            component="span"
                            fw="500"
                            fz={12}
                            sx={(theme) => ({ color: theme.colors.gray[8] })}
                          >
                            {item.sellerUser.username}
                          </Text>
                        </Grid.Col>

                        <Grid.Col span={4} pr={0}>
                          <Text
                            component="span"
                            fw="500"
                            fz={12}
                            sx={(theme) => ({ color: theme.colors.gray[8] })}
                          >
                            {humanizeNum(getFormattedSmallPrice(item.amount))}
                          </Text>
                        </Grid.Col>

                        <Grid.Col span={4} pr={0}>
                          <Text
                            component="span"
                            fw="500"
                            fz={12}
                            sx={(theme) => ({ color: theme.colors.gray[8] })}
                          >
                            ₹ {humanizeNum(getFormattedSmallPrice(item.value))}
                          </Text>
                        </Grid.Col>
                      </Grid>
                    </IonItem>

                    <IonItemOptions style={{ padding: 0, margin: 0 }}>
                      <IonItemOption
                        style={{ backgroundColor: "#0b78ff", fontWeight: 600 }}
                        onClick={() => {
                          history.push(`/app/user/${item.sellerUser.id}`);
                        }}
                      >
                        Visit
                      </IonItemOption>

                      <IonItemOption
                        color="danger"
                        style={{ backgroundColor: "#fa5252", fontWeight: 600 }}
                        onClick={() => {
                          fetchUserProfile(item.sellerUser.id);
                        }}
                      >
                        Sell
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
            </IonList>
          </Box>
        </Paper>
      </Stack>
    </div>
  );
}
