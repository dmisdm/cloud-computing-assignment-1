import { x } from "@xstyled/emotion";
import { format, fromUnixTime } from "date-fns";
import React from "react";
import { Post } from "./models";

export function PostCard({ post }: { post: typeof Post.TYPE }) {
  const createdAt = format(fromUnixTime(post.created_at), "PPPppp");
  return (
    <div className="card bg-grey rounded mv">
      <x.div display="flex" alignItems="center">
        <x.h4 margin={0}>{post.subject}</x.h4>
        <x.span flex={1} />
        <x.div display="flex" alignItems="center">
          <x.img
            borderRadius="50%"
            src={post.user_image}
            objectFit="cover"
            h="3rem"
            w="3rem"
            alt="user profile image"
            boxShadow="2px 1px 8px #ccc "
          />
          <x.span w="1rem" />
          <x.span className="nano">{post.user_id}</x.span>
        </x.div>
      </x.div>
      <x.div className="nano">{createdAt}</x.div>

      <div style={{ width: "100%", textAlign: "center", padding: "1rem" }}>
        <img
          src={post.image}
          alt={post.subject}
          style={{
            minHeight: "12rem",
            objectFit: "contain",
            maxHeight: "20rem",
            textAlign: "center",
          }}
        />
      </div>
      <blockquote
        className="small"
        style={{
          whiteSpace: "pre-line",
          maxHeight: "30rem",
          overflow: "auto",
        }}
      >
        {post.message}
      </blockquote>
      <hr />
    </div>
  );
}
