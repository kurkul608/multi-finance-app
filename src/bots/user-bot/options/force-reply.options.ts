import { SendMessageOptions } from "node-telegram-bot-api";

export const ForceReplyOptions: SendMessageOptions = {
  reply_markup: { force_reply: true, remove_keyboard: false },
};
