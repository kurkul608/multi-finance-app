import TelegramApi from "node-telegram-bot-api";
// import User from "models/user.model";
import { AccountOptions } from "./options/account.options";
import User, { IUser } from "../../models/user.model";
import { actionsMessage } from "./messages/actions";
import accountActions from "./actions/account.actions";

export default function startAdminBot() {
  const token = process.env.BOT_ADMIN_TOKEN;
  if (token) {
    const bot = new TelegramApi(token, { polling: true });
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      let user = await User.findOne({ user_id: msg.chat.id });
      if (!user && msg.from) {
        user = new User<IUser>({
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          user_name: msg.from.username,
          status: 1,
        });
        await user.save();
      }

      if (user?.status === 1) {
        await bot.sendMessage(
          chatId,
          "Добро пожаловать в админский expense bot! Ваш профиль был найден или создан"
        );
        return actionsMessage(bot, chatId);
      } else if (user?.status === 21) {
        return bot.sendMessage(chatId, "Извините, но у вас нет доступа к боту");
      }
    });
    accountActions(bot);
  } else {
    return new Error("Bot admin token not found");
  }
}
