import { SendMessageOptions } from "node-telegram-bot-api";

export const AccountOptions: SendMessageOptions = {
  reply_markup: {
    keyboard: [
      [{ text: "Добавить расход 💸" }, { text: "Добавить доход 💷" }],
      [{ text: "Посмотреть текущий баланс 💰" }],
      [{ text: "Выписка 💹", request_contact: true, request_location: true }],
    ],
  },
};
