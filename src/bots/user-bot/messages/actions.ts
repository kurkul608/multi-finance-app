import TelegramApi from "node-telegram-bot-api";
import { AccountOptions } from "../options/main.options";

export const actionsMessage = (bot: TelegramApi, chatId: number) =>
  bot.sendMessage(
    chatId,
    "Вы можетее выбрать одно из следующих действий:",
    AccountOptions
  );
