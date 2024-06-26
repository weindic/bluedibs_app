import { ActionIcon, Group, Image, Title } from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { useHistory } from "react-router";

type TWithBackBtnConditional =
  | {
      withBackButton: false;
      back?: undefined;
    }
  | {
      withBackButton?: true;
      back?: () => void;
    };

interface BaseProps {
  title?: string;
  withLogo?: boolean;
  rightSection?: JSX.Element;
}

type Props = BaseProps & TWithBackBtnConditional;

export function HeaderComponent({
  title,
  withLogo,
  back,
  withBackButton = true,
  rightSection,
}: Props) {
  const history = useHistory();

  return (
    <Group position="apart" spacing={"xs"}>
      <Group spacing={"xs"}>
        {withBackButton && (
          <ActionIcon
            onClick={() => {
              if (back) back();
              else history.goBack();
            }}
            variant="light"
          >
            <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
          </ActionIcon>
        )}

        {title && (
          <Title order={3} fz={20} weight={600}>
            {title} 
          </Title>
        )}

        {withLogo && (
          <img src="/logo.png" style={{ height: 50, width: "100%" }} />
        )}
      </Group>

      {rightSection}
    </Group>
  );
}
