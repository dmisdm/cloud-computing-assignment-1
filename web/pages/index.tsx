import { x } from "@xstyled/emotion";
import React from "react";
import { useForm } from "react-hook-form";
import { Page } from "../components/Page";
import { PostCard } from "../components/Post";
import { usePosts } from "../components/usePosts";
const App = () => {
  const { state, createPost, fetchPosts } = usePosts();
  const { register, handleSubmit, reset, formState } = useForm<{
    message: string;
    subject: string;
    image: FileList;
  }>();
  return (
    <Page heading="Forum">
      <form
        onSubmit={handleSubmit(async (values) => {
          const file = values.image.item(0)!!;
          console.log(file);
          await createPost({
            ...values,
            image: file,
          });
          reset();
          fetchPosts();
        })}
      >
        <div className="p">
          <input
            disabled={formState.isSubmitting}
            aria-label="subject"
            className="input pill border b-black"
            placeholder="Subject"
            maxLength={120}
            {...register("subject", {
              required: true,
              maxLength: 120,
              setValueAs: (v) => v.trim(),
            })}
          />
          <br />
          <textarea
            disabled={formState.isSubmitting}
            aria-label="message"
            placeholder="Write a compelling message"
            className="pill input border b-black"
            required={true}
            maxLength={500}
            style={{ resize: "none", width: "100%", minHeight: "10rem" }}
            {...register("message", {
              required: true,
              maxLength: 500,
              setValueAs: (v) => v.trim(),
            })}
          />
          <br />
          <label>
            Image
            <input
              disabled={formState.isSubmitting}
              type="file"
              className="pill p"
              accept=".png,.gif,.jpg,.jpeg"
              multiple={false}
              {...register("image", {
                required: true,
                validate: (files) => {
                  const firstFile = files.item(0);
                  return !!firstFile && firstFile.size > 0;
                },
              })}
            />
          </label>
          <br />
          <x.input
            disabled={formState.isSubmitting}
            w="100%"
            className="btn bg-info pill white"
            type="submit"
            value={formState.isSubmitting ? "Posting..." : "Post"}
          />
        </div>
      </form>
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
