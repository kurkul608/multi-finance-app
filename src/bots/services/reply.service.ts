import { Message } from "node-telegram-bot-api";
export const isReplyMessage = (msg: Message) => !!msg.reply_to_message;
