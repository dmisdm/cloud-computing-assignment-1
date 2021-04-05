import React from "react";
import { Page } from "../components/Page";
import { usePosts } from "../components/usePosts";
const App = () => {
  const posts = usePosts();
  return (
    <Page heading="Forum">
      <label>
        Write a post
        <textarea
          rows={10}
          cols={50}
          className="bg-info card rounded p m white"
        />
      </label>
      <h3>Posts</h3>
      {posts === "loading" ? (
        <h5>Loading...</h5>
      ) : posts.posts.length === 0 ? (
        <h5>Nothing has been posted yet!</h5>
      ) : (
        posts.posts.map((post) => (
          <div className="card bg-white rounded p">
            <h5>{post.subject}</h5>
          </div>
        ))
      )}
    </Page>
  );
};

export default App;
