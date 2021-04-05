import { x } from "@xstyled/emotion";
import React from "react";
import { Page } from "../components/Page";
import { PostCard } from "../components/Post";
import { usePosts } from "../components/usePosts";
import { useUser } from "../components/useUser";

const UserPage = () => {
  const { user } = useUser();
  const { state } = usePosts(true);
  if (!user) return null;
  return (
    <Page heading="Profile">
      <h3>ID</h3>
      {user.id}
      <x.div h="3rem" />
      <h3>Name</h3>
      {user.user_name}
      <x.div h="3rem" />
      <h3>Profile Image</h3>
      <x.img
        src={user.image}
        alt="profile image"
        h="5rem"
        w="5rem"
        objectFit="contain"
      />

      <x.div h="3rem" />
      <h3>Your Posts</h3>
      {state === "loading"
        ? "Loading..."
        : !state.posts.length
        ? "You haven't posted anything yet"
        : state.posts.map((post) => <PostCard post={post} key={post.id} />)}
    </Page>
  );
};

export default UserPage;
