import {
  Button,
  Divider,
  Flex,
  Paper,
  Stack,
  TextInput,
  Text,
  ActionIcon,
  Box,
  Grid,
} from "@mantine/core";
import { Statement } from "./Statement";
import { IonIcon } from "@ionic/react";
import { searchOutline } from "ionicons/icons";
import { useAppSelector } from "../../store/hooks";
import { getFormattedSmallPrice, humanizeNum } from "../../utils";
import { SelfSellModal } from "./SelfSell";
import { useState } from "react";
import TermsConditions from "./TermsConditions";
import { useHistory } from "react-router";
import { UseQueryResult } from "@tanstack/react-query";
import { useDebouncedValue } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { WithdrawModal } from "./WithdrawModal";
import { usePaymentInfoQuery } from "../Settings/PaymentDetails";
import { showNotification } from "@mantine/notifications";

export function Tiiys({ query }: { query: UseQueryResult<any, unknown> }) {
  const user = useAppSelector((state) => state.user);
  const [isSelfSellModalOpen, setSelfSellModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200, {
    leading: true,
  });

  const [isWithdrawModalOpened, setIsWithdrawModalOpened] = useState(false);

  const paymentInfoQuery = usePaymentInfoQuery();

  const ttiys = query.data?.tiiys?.reduce((acc, curr) => {
    const investedValue = curr.amount * curr.sellerUser.price;
    return acc + investedValue;
  }, 0) || 0;

  const totalAmount = query.data?.tiiys?.reduce((acc, curr) => {
    return acc + curr.amount;
  }, 0) || 0;

  const history = useHistory();



  console.log('Total Invested In Your Shares (TIIYS):', ttiys);
  console.log('Total Amount of Shares:', totalAmount);

  const yourDibs = totalAmount * 0.10;
  const platformDibs = totalAmount * 0.025;

  return (
    <div>
      <SelfSellModal
        opened={isSelfSellModalOpen}
        onClose={() => setSelfSellModalOpen(false)}
        onSuccess={() => query.refetch()}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpened}
        close={() => setIsWithdrawModalOpened(false)}
      />

      <Stack pt="sm">
        <Text px={"sm"}>Total Investment In Your Dibs.</Text>
        <Statement.Group>
          <Statement label="TIIYD" value={`₹  ${totalAmount.toFixed(4)}`} />
          <Statement
            label={`Your Dibs ${(10).toFixed(2)}%`}
            value={"₹ " + yourDibs.toFixed(4)}
          />
          <Statement
            label={`Platform Dibs ${(2.5).toFixed(2)}%`}
            value={"₹ " + platformDibs.toFixed(4)}
          />
        </Statement.Group>

        <Flex gap="sm" w="100%">
          <Button
            fullWidth
            color="green"
            onClick={() => setSelfSellModalOpen(true)}
          >
            Sell Request
          </Button>

          <Button
            onClick={() => {
              if (!paymentInfoQuery.data?.upiId) {
                return showNotification({
                  color: "red",
                  title: "UPI Id is not set",
                  message: "Please Add upi ID in Settings",
                });
              }

              if (!user.pan) {
                return showNotification({
                  color: "red",
                  title: "KYC not done",
                  message: "Please enter pan number in settings",
                });
              }

              setIsWithdrawModalOpened(true);
            }}
            color="green"
            fullWidth
            loading={paymentInfoQuery.isLoading}
          >
            Withdraw Money
          </Button>
        </Flex>

        <Divider my={"sm"} />

        <TermsConditions />

        <Divider my={"sm"} />

        <Paper>
          <Flex mb="lg" justify={"space-between"}>
            <Text weight={600}>Investors</Text>
            <TextInput
              placeholder="Search"
              size="xs"
              icon={<IonIcon icon={searchOutline} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              rightSection={
                searchQuery.length ? (
                  <ActionIcon onClick={() => setSearchQuery("")} size="xs">
                    <IconX size="12" />
                  </ActionIcon>
                ) : null
              }
            />
          </Flex>

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

            {(query.data?.tiiys ?? [])
              .filter((holding: any) =>
                holding.buyerUser.username
                  .toLowerCase()
                  .startsWith(debouncedSearchQuery.toLowerCase())
              )
              .map((item: any) => (
                <div
                  key={item.ownership_id}
                  style={{ padding: "10px 15px", background: "white" }}
                  onClick={() => {
                    history.push(`/app/user/${item.buyer_id}`);
                  }}
                >
                  <Grid w={"100%"} style={{ fontSize: "0.8rem" }}>
                    <Grid.Col span={4} pr={0}>
                      <Text
                        component="span"
                        fw="500"
                        fz={12}
                        sx={(theme) => ({ color: theme.colors.gray[8] })}
                      >
                        {item.buyerUser.username}
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
                        ₹
                        {humanizeNum(
                          getFormattedSmallPrice(
                            item.amount * item.sellerUser.price
                          )
                        )}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </div>
              ))}
          </Box>
        </Paper>
      </Stack>
    </div>
  );
}
