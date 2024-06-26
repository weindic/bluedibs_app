import { Button, Flex, PasswordInput, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { getAuth, updateEmail, updatePassword } from "firebase/auth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { useAppSelector } from "../../store/hooks";
import { setUser, updateUser } from "../../store/slice/userSlice";
import { loginSchema } from "../Auth/schemas";
import { setUserInformationApi } from "./settings.api";
import { useMutation } from "@tanstack/react-query";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

type Props = {
  isLoading: boolean;
  setLoading: (t: boolean) => void;
  closePage: () => void;
};

function PersonalInformation({ isLoading, setLoading, closePage }: Props) {
  const user = useAppSelector((state) => state.user);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();

  console.log(user);

  interface IPersonalInfoForm extends z.infer<typeof loginSchema> {
    pan: string;
  }

  const setUserInformationMut = useMutation({
    mutationFn: setUserInformationApi,
    onSuccess: () => {
      dispatch(updateUser({ pan: form.values.pan }));
    },
  });

  const form = useForm<IPersonalInfoForm>({
    validate: zodResolver(loginSchema.extend({ pan: z.string().optional() })),
    initialValues: {
      email: user.email,
      password: "",
      pan: user.pan || "",
    },
  });

  async function onSubmit(values: IPersonalInfoForm) {
    const auth = await FirebaseAuthentication.getCurrentUser();

    if (!auth.user) return null;

    setLoading(true);

    try {
      await setUserInformationMut.mutateAsync({ pan: values.pan });

      if (auth.user.email?.toLowerCase() !== values.email.toLowerCase()) {
        await FirebaseAuthentication.updateEmail({ newEmail: values.email });
      }

      if (values.password.length) {
        await FirebaseAuthentication.updatePassword({
          newPassword: values.password,
        });
      }

      dispatch(setUser({}));
      setLoading(false);
      closePage();
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <Flex py="xl" justify={"center"} h="100%" align={"center"}>
      <Flex direction={"column"} align={"center"} gap={"xs"}>
        <form
          onSubmit={form.onSubmit((val) => onSubmit(val))}
          style={{ width: "100%", minWidth: 250 }}
        >
          <Flex direction={"column"} w="100%" gap="xs">
            <TextInput
              label="Email"
              description="Email can not be changed"
              w="100%"
              {...form.getInputProps("email")}
            />

            <TextInput
              label="Pan Number"
              w="100%"
              {...form.getInputProps("pan")}
            />

            <PasswordInput
              label="Password"
              description="Change your password from here"
              w="100%"
              {...form.getInputProps("password")}
            />

            <Button loading={isLoading} type="submit">
              Submit
            </Button>
          </Flex>
        </form>
      </Flex>
    </Flex>
  );
}

export default PersonalInformation;
