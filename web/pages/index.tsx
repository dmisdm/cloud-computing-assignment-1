import { x } from "@xstyled/emotion";
import React from "react";
import { Page } from "../components/Page";
import { PostCard } from "../components/Post";
import { usePosts } from "../components/usePosts";
import { useUser } from "../components/useUser";
import { PostForm } from "../components/PostForm";

const App = () => {
  const { user } = useUser();
  const { state, createPost, fetchPosts } = usePosts();

  return !user ? null : (
    <Page heading="Forum">
      <PostForm createPost={createPost} onSuccess={fetchPosts} />
      <x.div h="2rem" />
      <h3>Recent Posts</h3>
      {state === "loading" ? (
        <h5>Loading...</h5>
      ) : state.posts.length === 0 ? (
        <h5>Nothing has been posted yet!</h5>
      ) : (
        state.posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </Page>
  );
};

export default App;
