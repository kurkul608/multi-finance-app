import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;
export interface ILog {
  user: Types.ObjectId;
  account: Types.ObjectId;
  custom_category: Types.ObjectId;
  type: string;
  count: number;
}
export interface IAccountSchema extends ILog {
  created: Date;
}
const Log = new Schema<IAccountSchema>({
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
  custom_category: {
    type: Schema.Types.ObjectId,
    ref: "CustomCategory",
    required: false,
  },
  count: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Log", Log);
