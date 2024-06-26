import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../../utils/firebase";

export async function uploadFileToFirebase(file: File) {
  const storageRef = ref(storage, file.name);
  const uploadtask = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadtask.ref);
}
