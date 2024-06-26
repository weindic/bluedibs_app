import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../pages/main.api";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slice/userSlice";

export default function useUserQuery() {
  const dispatch = useAppDispatch();

  const getUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: getUserDetails,
    refetchOnWindowFocus: false,
    enabled: false,
    onSuccess(user) {
      localStorage.setItem("bluedibs:user", JSON.stringify(user));
      if (!Object.keys(user)) return;
      dispatch(setUser(user));
    },

    initialData() {
      const user = JSON.parse(localStorage.getItem("bluedibs:user") || "null");
      return user;
    },
  });

  return getUserQuery;
}
