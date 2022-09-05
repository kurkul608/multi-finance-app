import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;
export interface ICategory {
  user: Types.ObjectId;
  name: string;
  type: string;
}
export interface ICustomCategorySchema extends ICategory {
  created: Date;
}
const CustomCategory = new Schema<ICustomCategorySchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CustomCategory", CustomCategory);
