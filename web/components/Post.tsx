import { x } from "@xstyled/emotion";
import { format, fromUnixTime } from "date-fns";
import React from "react";
import { Post } from "./models";
import { UserAvatar } from "./UserAvatar";

export function PostCard({
  post,
  onEditClick,
}: {
  onEditClick?: () => void;
  post: typeof Post.TYPE;
}) {
  const date = format(fromUnixTime(post.updated_at), "PPPppp");
  return (
    <div className="card bg-grey rounded mv">
      <x.div display="flex" alignItems="center">
        <x.h4 margin={0}>{post.subject}</x.h4>

        <x.span flex={1} />
        <x.div display="flex" alignItems="center">
          <x.span className="nano">{post.user.user_name}</x.span>
          <x.span w="1rem" />
          <UserAvatar src={post.user.image} />
        </x.div>
      </x.div>
      <x.div className="nano">{date}</x.div>

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
      {onEditClick && (
        <x.button w="100%" className="btn small" onClick={onEditClick}>
          Edit
        </x.button>
      )}
    </div>
  );
}
