import axios from "axios";

const botClient = axios.create({
  baseURL: `https://api.telegram.org/bot6394258975:AAF21j0p6nJqWSCkoh_1R9-fMFkf_6QeCcc`,
  headers: {
    accept: "application/json",
    "User-Agent":
      "Telegram Bot SDK - (https://github.com/irazasyed/telegram-bot-sdk)",
    "content-type": "application/json",
  },
});

function sendMessage(message: string) {
  return botClient.post("/sendMessage", {
    text: message,
    chat_id: "8297373496",
  });
}

export const assistant = { sendMessage };
