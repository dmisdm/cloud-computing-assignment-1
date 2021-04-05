import { type, string, number, optional, unknown, array } from "superstruct";

export const userRecord = type({
  id: string(),
  user_name: string(),
  image: string(),
  authExpireDate: number(),
});

export const errorResponse = type({
  error: type({
    detail: optional(unknown()),
    message: string(),
    name: string(),
  }),
});

export const Post = type({
  id: string(),
  subject: string(),
  message: string(),
  image: string(),
  user_id: string(),
  created_at: number(),
  user_image: string(),
});

export const Posts = type({
  posts: array(Post),
});
