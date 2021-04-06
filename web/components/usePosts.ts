import React from "react";
import { Posts } from "./models";
import { objectToFormData } from "./objectToFormData";
import { useUser } from "./useUser";

export function usePosts(scope: "user" | "top10" = "top10") {
  useUser();
  const [posts, setPosts] = React.useState<typeof Posts.TYPE>({ posts: [] });
  const [loading, setLoading] = React.useState(true);
  const fetchPosts = React.useCallback(() => {
    setLoading(true);
    fetch(scope === "user" ? "/api/my_posts" : "/api/posts")
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }
        setPosts(Posts.create(await res.json()));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scope]);
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

  const editPost = React.useCallback(
    async (post: {
      id: string;
      message?: string;
      subject?: string;
      image?: File | string;
    }) => {
      const res = await fetch(`/api/posts`, {
        method: "PUT",
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
  return {
    state: loading ? "loading" : posts,
    createPost,
    editPost,
    fetchPosts,
  } as const;
}
