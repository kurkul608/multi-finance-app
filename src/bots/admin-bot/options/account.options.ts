import { SendMessageOptions } from "node-telegram-bot-api";

export const AccountOptions: SendMessageOptions = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Добавить новый счет", callback_data: "add_new_account" }],
      [{ text: "Посмотреть текущие счета", callback_data: "show_balance" }],
    ],
  },
};
