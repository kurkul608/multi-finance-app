import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;
export interface IAccount {
  user: Types.ObjectId;
  name: string;
  balance: number;
}
export interface IAccountSchema extends IAccount {
  created: Date;
}
const Account = new Schema<IAccountSchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    min: [0, "Баланс не может быть отрицательным"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Account", Account);
