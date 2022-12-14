import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;
export interface IAction {
  user: Types.ObjectId;
  account: Types.ObjectId;
  type: string;
  message: number;
}
export interface IAccountSchema extends IAction {
  created: Date;
}
const Action = new Schema<IAccountSchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  type: {
    type: String,
    required: true,
  },
  message: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Action", Action);
