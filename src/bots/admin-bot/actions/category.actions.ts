import TelegramApi from "node-telegram-bot-api";
import {
  getUser,
  isCommand,
  isReplyMessage,
  userCheckerService,
} from "../../services";
import { ForceReplyOptions } from "../options/force-reply.options";
import Action from "../../../models/action.model";
import { CategoryTypeEnum } from "../../enums/category-type.enum";
import CustomCategory from "../../../models/custom-category.model";
import { AccountOptions } from "../options/account.options";
import { getCategoryOptions } from "../options/category.options";
import { HtmlOptions } from "../options/html.options";
import { actionsMessage } from "../messages/actions";

const addNewCategoryFunction = (bot: TelegramApi) => {
  bot.on("callback_query", async (msg) => {
    const chatId = msg?.message?.chat.id;
    if (chatId && (await userCheckerService(chatId))) {
      const data = msg.data;
      if (data === "add_new_category" && chatId) {
        const botMessage = await bot.sendMessage(
          chatId,
          "Введите название категории",
          ForceReplyOptions
        );
        const user = await getUser(chatId);
        const action = new Action({
          user: user!._id,
          type: CategoryTypeEnum.inProgress,
          message: botMessage.message_id,
        });
        await action.save();
        return true;
      } else if (data && data.includes("add_new_category_type_")) {
        const splitMessage = data.split("add_new_category_type_")[1];
        const [type, messageId] = splitMessage.split("_message_id_");
        const user = await getUser(chatId);
        const action = await Action.findOne({ message: messageId });
        if (action && user) {
          const category = new CustomCategory({
            user: user._id,
            type,
            name: action.text,
          });
          await category.save();
          return bot.sendMessage(
            chatId,
            "Данные успешно сохранены",
            AccountOptions
          );
        } else {
          return bot.sendMessage(chatId, "Something  wrong...");
        }
      } else if (data && data.includes("show_category_")) {
        const [, type] = data.split("show_category_");
        const user = await getUser(chatId);
        if (user) {
          const categories = await CustomCategory.find({
            user: user._id,
            type,
          });
          if (categories && categories.length) {
            await bot.sendMessage(chatId, "Список категорий:");
            let text = "";
            categories.forEach((category, index) => {
              text += index + 1 + ". " + category.name + "\n";
            });
            await bot.sendMessage(chatId, text, HtmlOptions);
            return actionsMessage(bot, chatId);
          } else {
            return bot.sendMessage(chatId, "Категории не найдены");
          }
        }
      }
    }
  });
  bot.on("message", async (msg) => {
    if (
      msg.text &&
      !isCommand(msg.text) &&
      isReplyMessage(msg) &&
      msg.reply_to_message &&
      msg.reply_to_message.text === "Введите название категории" &&
      msg.from &&
      (await userCheckerService(msg.from.id))
    ) {
      const chatId = msg.from.id;
      const text = msg.text;
      const messageId = msg.reply_to_message.message_id;
      const action = await Action.findOne({ message: messageId });
      if (action) {
        await action.update({ text });
        return bot.sendMessage(
          chatId,
          "Выберите тип категории",
          getCategoryOptions(messageId)
        );
      } else {
        return bot.sendMessage(chatId, "Something wrong...");
      }
    }
  });
};

export default function (bot: TelegramApi) {
  addNewCategoryFunction(bot);
}
