import React from "react";
import { Posts } from "./models";
import { objectToFormData } from "./objectToFormData";
import { useUser } from "./useUser";

export function usePosts(myPosts = false) {
  useUser();
  const [posts, setPosts] = React.useState<typeof Posts.TYPE>({ posts: [] });
  const [loading, setLoading] = React.useState(true);
  const fetchPosts = React.useCallback(() => {
    setLoading(true);
    fetch(myPosts ? "/api/my_posts" : "/api/posts")
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }
        setPosts(Posts.create(await res.json()));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [myPosts]);
  React.useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = React.useCallback(
    async (post: { subject: string; message: string; image: File }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: objectToFormData(post),
      });
      if (res.ok) {
        return res.json();
      } else {
        return {
          error: await res.json(),
        };
      }
    },
    []
  );

  const editPost = React.useCallback(() => {}, []);
  return {
    state: loading ? "loading" : posts,
    createPost,
    editPost,
    fetchPosts,
  } as const;
}
