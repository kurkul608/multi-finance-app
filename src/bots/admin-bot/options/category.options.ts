import { SendMessageOptions } from "node-telegram-bot-api";
import { CategoryTypeEnum } from "../../enums/category-type.enum";

export const getCategoryOptions = (messageID: number): SendMessageOptions => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Расход",
          callback_data: `add_new_category_type_${CategoryTypeEnum.consumption}_message_id_${messageID}`,
        },
      ],
      [
        {
          text: "Доход",
          callback_data: `add_new_category_type_${CategoryTypeEnum.income}_message_id_${messageID}`,
        },
      ],
    ],
  },
});
