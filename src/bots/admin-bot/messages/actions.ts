import TelegramApi from "node-telegram-bot-api";
import { AccountOptions } from "../options/account.options";

export const actionsMessage = (bot: TelegramApi, chatId: number) =>
  bot.sendMessage(
    chatId,
    "Вы можетее выбрать одно из следующих действий:",
    AccountOptions
  );
