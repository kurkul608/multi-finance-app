import mongoose from "mongoose";
const Schema = mongoose.Schema;
export interface IUser {
  user_id: number;
  first_name: string;
  user_name?: string;
  status: number;
}
export interface IUserSchema extends IUser {
  created: Date;
}
const User = new Schema<IUserSchema>({
  user_id: {
    type: Number,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
  },
  status: Number,
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", User);
