import { axiosInstance } from "../../../utils/axios";

export async function addBalance(body: { transactionId: string }) {
  return axiosInstance
    .post("/user/add-fund", {
      txnId: body.transactionId,
      amount: body.amount,
    })
    .then((d) => d.data);
}
