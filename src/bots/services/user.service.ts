import User from "../../models/user.model";

export const userCheckerService = async (chatId: number) => {
  const user = await getUser(chatId);
  return user && user.status === 1;
};

export const getUser = async (chatId: number) =>
  await User.findOne({ user_id: chatId });
