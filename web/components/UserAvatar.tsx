import { x } from "@xstyled/emotion";
import React from "react";
export function UserAvatar({
  src,
  size = "small",
}: {
  src: string;
  size?: "small" | "medium";
}) {
  const radius = size === "small" ? "3rem" : "6rem";
  return (
    <x.img
      borderRadius="50%"
      src={src}
      objectFit="cover"
      h={radius}
      w={radius}
      alt="user profile image"
      boxShadow="2px 1px 8px #ccc "
    />
  );
}
