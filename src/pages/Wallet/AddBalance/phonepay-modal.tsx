import { IonModal } from "@ionic/react";
import { ActionIcon, AppShell, Group, Image, Title } from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";

export function InstructionModal({
  isModalOpen,
  url,
  setInstructionModalOpen,
}) {
  return (
    <IonModal
      isOpen={isModalOpen}
      onWillDismiss={() => setInstructionModalOpen(false)}
    >
      <AppShell
        mt={"md"}
        ml={"md"}
        header={
          <Group spacing="sm">
            <ActionIcon
              onClick={() => setInstructionModalOpen(false)}
              variant="light"
            >
              <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
            </ActionIcon>

            <Title order={3} fz={20} weight={600}>
              Transaction ID
            </Title>
          </Group>
        }
      >
        <Image
          w="100%"
          h="100%"
          styles={{ image: { aspectRatio: "1/1" } }}
          sx={{ objectFit: "contain" }}
          withPlaceholder
          src={url}
        />
      </AppShell>
    </IonModal>
  );
}
