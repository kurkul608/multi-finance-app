import { SendMessageOptions } from "node-telegram-bot-api";
import { CategoryTypeEnum } from "../../enums/category-type.enum";

export const AccountOptions: SendMessageOptions = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Добавить новый счет", callback_data: "add_new_account" }],
      [{ text: "Посмотреть текущие счета", callback_data: "show_balance" }],
      [{ text: "Добавить новую категорию", callback_data: "add_new_category" }],
      [
        {
          text: "Посмотреть список кастомных категорий расходов",
          callback_data: `show_category_${CategoryTypeEnum.consumption}`,
        },
      ],
      [
        {
          text: "Посмотреть список кастомных категорий доходов",
          callback_data: `show_category_${CategoryTypeEnum.income}`,
        },
      ],
    ],
  },
};
