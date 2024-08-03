import { Filesystem, Directory } from "@capacitor/filesystem";
import { config } from "../config";
import { notifications } from "@mantine/notifications";

export function imgUrl(path: string | undefined) {
  if (!path) return "";
  return `${config.STATIC_FILE_BASE_URL}${path}?alt=media`;
}

export function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    try {
      let video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = function () {
        resolve(video);
      };

      video.onerror = function () {
        reject("Invalid video. Please select a video file.");
      };

      video.src = window.URL.createObjectURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

function convertBlobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function downloadImage(url: string) {

  fetch(url)
  .then(response => response.blob())
  .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'image.jpg'; // Specify the file name
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
  })
  .catch(() => alert('Failed to download image'));


  // const response = await fetch(url);

  // const blob = await response.blob();

  // const base64Data = (await convertBlobToBase64(blob)) as string;

  // const savedFile = await Filesystem.writeFile({
  //   path: "Download/bluedibs-qr.png",
  //   data: base64Data,
  //   recursive: true,
  //   directory: Directory.ExternalStorage,
  // });

  // notifications.show({
  //   message: "Qr downloaded",
  // });

  // return savedFile;
}
