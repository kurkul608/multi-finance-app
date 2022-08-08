import { Message } from "node-telegram-bot-api";
export const IsReplyMessage = (msg: Message) => !!msg.reply_to_message;
