import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../pages/main.api";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slice/userSlice";
import { axiosInstance } from "../utils/axios";

export default function usePinnedUserQuery() {
  const getUserQuery = useQuery({
    queryKey: ["pinned-user"],
    queryFn: () =>
      axiosInstance.get("/user/suggestions/pinned").then((res) => res.data),
    refetchOnWindowFocus: false,
    placeholderData: [],
  });

  return getUserQuery;
}
