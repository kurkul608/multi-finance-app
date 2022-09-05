import TelegramApi from "node-telegram-bot-api";
import {
  getUser,
  isCommand,
  isReplyMessage,
  userCheckerService,
} from "../../services";
import Account from "../../../models/account.model";
import Action from "../../../models/action.model";
import Log from "../../../models/log.model";
import User from "../../../models/user.model";
import { Types } from "mongoose";
import { ForceReplyOptions } from "../options/force-reply.options";
import { AccountOptions } from "../options/main.options";
import { BalanceChangeEnum } from "../../enums/balance-change.enum";
import CustomCategory from "../../../models/custom-category.model";
import { CategoryTypeEnum } from "../../enums/category-type.enum";
import { getCategoryOptions } from "../options/category.options";

const generateKeyBoardArray = (
  type: BalanceChangeEnum,
  accounts: { name: string; _id: Types.ObjectId }[]
) => {
  return {
    reply_markup: {
      inline_keyboard: accounts.map((account) => [
        {
          text: account.name,
          callback_data: `${type}_account_id_${account._id}`,
        },
      ]),
    },
  };
};
const getAccountIdFromCBData = (type: BalanceChangeEnum, data: string) => {
  let id = "";
  const split = data.split(type);
  split.forEach((part) => {
    const includesPart = part.includes("_account_id_");
    if (includesPart) {
      id = part.split("_account_id_")[1] ?? "";
    }
  });
  return id;
};
const mainButtonsListener = (bot: TelegramApi) => {
  bot.on("message", async (msg) => {
    const userId = msg?.from?.id;
    const message = msg.text;
    const chatId = msg.chat.id;
    if (
      userId &&
      (await userCheckerService(userId)) &&
      !isReplyMessage(msg) &&
      message &&
      !isCommand(message)
    ) {
      switch (message) {
        case "Добавить расход 💸": {
          const user = await User.findOne({ user_id: userId });
          if (user) {
            const accounts = await Account.find({ user: user._id });
            if (accounts && accounts.length) {
              return bot.sendMessage(
                chatId,
                "Выберите с каким счетом вы будете производить действия",
                generateKeyBoardArray(
                  BalanceChangeEnum.consumption,
                  accounts.map((account) => ({
                    name: account.name,
                    _id: account._id,
                  }))
                )
              );
            } else {
              return bot.sendMessage(chatId, "У вас нет счетов");
            }
          } else {
            return bot.sendMessage(chatId, "Пользователь не найден в системе");
          }
        }
        case "Добавить доход 💷": {
          const user = await User.findOne({ user_id: userId });
          if (user) {
            const accounts = await Account.find({ user: user._id });
            if (accounts && accounts.length) {
              return bot.sendMessage(
                chatId,
                "Выберите с каким счетом вы будете производить действия",
                generateKeyBoardArray(
                  BalanceChangeEnum.income,
                  accounts.map((account) => ({
                    name: account.name,
                    _id: account._id,
                  }))
                )
              );
            } else {
              return bot.sendMessage(chatId, "У вас нет счетов");
            }
          } else {
            return bot.sendMessage(chatId, "Пользователь не найден в системе");
          }
        }
        case "Посмотреть текущий баланс 💰": {
          const user = await User.findOne({ user_id: userId });
          if (user) {
            return bot.sendMessage(chatId, "Функция находится в разработке");
          } else {
            return bot.sendMessage(chatId, "Пользователь не найден в системе");
          }
        }
        case "Выписка 💹": {
          const user = await User.findOne({ user_id: userId });
          if (user) {
            return bot.sendMessage(chatId, "Функция находится в разработке");
          } else {
            return bot.sendMessage(chatId, "Пользователь не найден в системе");
          }
        }
        default:
          return bot.sendMessage(chatId, "Я не понимаю", AccountOptions);
      }
    }
  });
};

const addPaymentListener = (bot: TelegramApi) => {
  bot.on("callback_query", async (msg) => {
    const chatId = msg?.message?.chat.id;
    if (chatId) {
      const data = msg.data;
      if (data && data.includes(BalanceChangeEnum.income)) {
        const accountId = getAccountIdFromCBData(
          BalanceChangeEnum.income,
          data
        );
        const user = await getUser(chatId);
        const account = await Account.findById(accountId);
        if (user && account) {
          const botMessage = await bot.sendMessage(
            chatId,
            "Введите сумму пополнения",
            ForceReplyOptions
          );
          const action = new Action({
            user: user._id,
            account: account._id,
            type: BalanceChangeEnum.income,
            message: botMessage.message_id,
          });
          await action.save();
          return true;
        } else {
          return bot.sendMessage(chatId, "Something wrong...", AccountOptions);
        }
      } else if (data && data.includes(BalanceChangeEnum.consumption)) {
        const accountId = getAccountIdFromCBData(
          BalanceChangeEnum.consumption,
          data
        );
        const user = await getUser(chatId);
        const account = await Account.findById(accountId);
        if (user && account) {
          const botMessage = await bot.sendMessage(
            chatId,
            "Введите сумму трат",
            ForceReplyOptions
          );
          const action = new Action({
            user: user._id,
            account: account._id,
            type: BalanceChangeEnum.consumption,
            message: botMessage.message_id,
          });
          await action.save();
          return true;
        } else {
          return bot.sendMessage(chatId, "Something wrong...", AccountOptions);
        }
      } else if (data && data.includes("cat_to_pay_msg_id_")) {
        const [, messageIdAndCategoryId] = data.split("cat_to_pay_msg_id_");
        const [messageId, categoryId] = messageIdAndCategoryId.split("_cat_");
        const action = await Action.findOne({ message: messageId });
        if (action) {
          const account = await Account.findById(action.account);
          if (account) {
            await account.update({
              balance:
                action.type === BalanceChangeEnum.income
                  ? account.balance + +action.count
                  : account.balance - +action.count,
            });
            const customCategory = await CustomCategory.findById(categoryId);
            if (customCategory) {
              const log = new Log({
                user: account.user,
                type: action.type,
                account: account._id,
                custom_category: customCategory._id,
                count: action.count,
              });
              await log.save();
              return bot.sendMessage(
                chatId,
                "Данные по счету обновлены",
                AccountOptions
              );
            } else {
              return bot.sendMessage(
                chatId,
                "Something wrong...",
                AccountOptions
              );
            }
          } else {
            return bot.sendMessage(chatId, "Счет не найден", AccountOptions);
          }
        } else {
          return bot.sendMessage(chatId, "Something wrong...", AccountOptions);
        }
      }
      return bot.sendMessage(chatId, "Success", AccountOptions);
    }
  });
};
const replyMessageListener = (bot: TelegramApi) => {
  bot.on("message", async (msg) => {
    const userId = msg?.from?.id;
    const message = msg.text;
    const chatId = msg.chat.id;
    if (userId && (await userCheckerService(userId)) && isReplyMessage(msg)) {
      const replyId = msg.reply_to_message?.message_id;
      if (replyId) {
        if (message && message.match(/^\d+$/)) {
          const action = await Action.findOne({ message: replyId });
          if (action) {
            await action.update({ count: +message });
            switch (action.type) {
              case BalanceChangeEnum.income: {
                const user = await getUser(chatId);
                const customCategories = await CustomCategory.find({
                  user: user!._id,
                  type: CategoryTypeEnum.income,
                });
                if (customCategories && customCategories.length) {
                  const buttons = getCategoryOptions({
                    messageID: replyId,
                    categories: customCategories.map((category) => ({
                      name: category.name,
                      type: CategoryTypeEnum.income,
                      id: category._id,
                    })),
                    count: +message,
                  });
                  return bot.sendMessage(
                    chatId,
                    "Выберите категорию дохода",
                    buttons
                  );
                } else {
                  return bot.sendMessage(chatId, "Категории дохода не найдены");
                }
              }
              case BalanceChangeEnum.consumption: {
                const user = await getUser(chatId);
                const customCategories = await CustomCategory.find({
                  user: user!._id,
                  type: CategoryTypeEnum.consumption,
                });
                if (customCategories && customCategories.length) {
                  const buttons = getCategoryOptions({
                    messageID: replyId,
                    count: +message,
                    categories: customCategories.map((category) => ({
                      name: category.name,
                      type: CategoryTypeEnum.consumption,
                      id: category._id,
                    })),
                  });
                  return bot.sendMessage(
                    chatId,
                    "Выберите категорию трат",
                    buttons
                  );
                } else {
                  return bot.sendMessage(chatId, "Категории трат не найдены");
                }
              }
            }
          }
        } else {
          return bot.sendMessage(chatId, "Вы ввели не число", AccountOptions);
        }
      }
    }
  });
};
export default (bot: TelegramApi) => {
  mainButtonsListener(bot);
  addPaymentListener(bot);
  replyMessageListener(bot);
};
