import TelegramApi from "node-telegram-bot-api";
import { getUser, userCheckerService } from "../../services";
import { ForceReplyOptions } from "../options/force-reply.options";
import { isCommand, IsReplyMessage } from "../../services";
import User from "../../../models/user.model";
import Account, { IAccount } from "../../../models/account.model";
import { actionsMessage } from "../messages/actions";
import { HtmlOptions } from "../options/html.options";

const addNewAccountFunction = (bot: TelegramApi) => {
  bot.on("callback_query", async (msg) => {
    const chatId = msg?.message?.chat.id;
    if (chatId && (await userCheckerService(chatId))) {
      const data = msg.data;
      if (data === "add_new_account" && chatId) {
        return bot.sendMessage(
          chatId,
          "Введите название счета",
          ForceReplyOptions
        );
      }
    }
  });
  bot.on("message", async (msg) => {
    if (
      msg.text &&
      !isCommand(msg.text) &&
      IsReplyMessage(msg) &&
      msg.reply_to_message?.text === "Введите название счета" &&
      msg.from &&
      (await userCheckerService(msg.from.id))
    ) {
      const chatId = msg.from.id;
      const name = msg.text;
      const user = await User.findOne({ user_id: msg.from.id });
      if (user) {
        const account = new Account<IAccount>({
          name,
          balance: 0,
          user: user._id,
        });
        await account.save();
      }

      await bot.sendMessage(chatId, "Данные сохранены");
      return actionsMessage(bot, chatId);
    }
  });
};
export const lookAllAccountsById = (bot: TelegramApi) => {
  bot.on("callback_query", async (msg) => {
    const chatId = msg?.message?.chat.id;
    if (chatId && (await userCheckerService(chatId))) {
      const data = msg.data;
      if (data === "show_balance" && chatId) {
        const user = await getUser(chatId);
        if (user) {
          const accountsById = await Account.find({ user: user._id }).populate(
            "user"
          );
          let text = "Список ваших счетов:\n";
          if (accountsById) {
            accountsById.forEach((account) => {
              text += `<strong>${account.name}</strong> - баланс: ${account.balance}`;
            });
          }
          await bot.sendMessage(chatId, text, HtmlOptions);
          return actionsMessage(bot, chatId);
        }
      }
    }
  });
};

export default function (bot: TelegramApi) {
  addNewAccountFunction(bot);
  lookAllAccountsById(bot);
}
