import { x } from "@xstyled/emotion";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { Field } from "../components/Field";
import { errorResponse } from "../components/models";
import { Padding } from "../components/Padding";
import { Page } from "../components/Page";
import { PostCard } from "../components/Post";
import { PostForm } from "../components/PostForm";
import { usePosts } from "../components/usePosts";
import { useUser } from "../components/useUser";

function ChangePasswordForm() {
  const { register, formState, handleSubmit } = useForm<{
    old_password: string;
    new_password: string;
  }>();
  const { endSession } = useUser();
  const [error, setError] = React.useState<string>();
  return (
    <x.form
      onSubmit={handleSubmit((values) => {
        fetch("/api/change_password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }).then(async (res) => {
          if (!res.ok) {
            setError(errorResponse.create(await res.json()).error.message);
          } else {
            endSession();
          }
        });
      })}
    >
      <div style={{ visibility: "hidden", height: 0, width: 0 }}>
        <Field label="Username" autoComplete="username" />
      </div>

      <Field
        label="Old password"
        disabled={formState.isSubmitting}
        className="input rounded"
        type="password"
        autoComplete="password"
        required
        {...register("old_password")}
      />
      <Field
        label="New password"
        disabled={formState.isSubmitting}
        className="input rounded"
        type="password"
        autoComplete="new-password"
        required
        {...register("new_password")}
      />
      <x.div textAlign="end">
        <x.input
          type="submit"
          value={formState.isSubmitting ? "Loading..." : "Change"}
        />
        <br />
        {error && (
          <x.span w="100%" textAlign="center" className="error">
            {error}
          </x.span>
        )}
      </x.div>
    </x.form>
  );
}

const UserPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { state, editPost, fetchPosts } = usePosts("user");
  const [editingPosts, setEditingPosts] = React.useState<
    Record<string, undefined | boolean>
  >({});
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
      <Padding size={3} />
      <h3>Change Password</h3>
      <ChangePasswordForm />
      <h3>Your Posts</h3>
      {state === "loading"
        ? "Loading..."
        : !state.posts.length
        ? "You haven't posted anything yet"
        : state.posts.map((post) =>
            editingPosts[post.id] ? (
              <PostForm
                key={post.id}
                edit
                initialData={post}
                editPost={editPost}
                onSuccess={() => {
                  setEditingPosts((posts) => ({ ...posts, [post.id]: false }));
                  router.push("/");
                }}
                onCancel={() =>
                  setEditingPosts((posts) => ({ ...posts, [post.id]: false }))
                }
              />
            ) : (
              <PostCard
                onEditClick={() =>
                  setEditingPosts((posts) => ({ ...posts, [post.id]: true }))
                }
                post={post}
                key={post.id}
              />
            )
          )}
    </Page>
  );
};

export default UserPage;
