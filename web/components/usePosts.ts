import React from "react";
import { array, create, string, type } from "superstruct";
import { useUser } from "./useUser";

const Post = type({
  id: string(),
  subject: string(),
  message: string(),
  image: string(),
  user_id: string(),
});

const Posts = type({
  posts: array(Post),
});

export function usePosts() {
  useUser();
  const [posts, setPosts] = React.useState<typeof Posts.TYPE>({ posts: [] });
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(true);
    fetch("/api/posts")
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }
        setPosts(Posts.create(await res.json()));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return loading ? "loading" : posts;
}
