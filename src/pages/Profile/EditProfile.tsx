import { IonModal } from "@ionic/react";
import SetupProfile from "../Auth/Signup/SetupProfile";

export function EditProfileModal({
  open,
  setModalOpen,
}: {
  open: boolean;
  setModalOpen: (flag: boolean) => void;
}) {
  return (
    <IonModal isOpen={open} trigger="open-modal" onWillDismiss={(ev) => ""}>
      <SetupProfile mode="update" close={() => setModalOpen(false)} />
    </IonModal>
  );
}
