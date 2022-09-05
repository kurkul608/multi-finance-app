import { SendMessageOptions } from "node-telegram-bot-api";
import { CategoryTypeEnum } from "../../enums/category-type.enum";
import { Types } from "mongoose";

interface IProps {
  categories: {
    name: string;
    type: CategoryTypeEnum;
    id: Types.ObjectId;
  }[];
  messageID: number;
  count: number;
}
export const getCategoryOptions = ({
  categories,
  messageID,
}: IProps): SendMessageOptions => ({
  reply_markup: {
    inline_keyboard: categories.map((category) => [
      {
        text: category.name,
        // callback_data: `add_category_to_payment_type_${category.type}_message_id_${messageID}_count_${count}_category_id_${category.id}`,
        callback_data: `cat_to_pay_msg_id_${messageID}_cat_${category.id}`,
      },
    ]),
  },
});
