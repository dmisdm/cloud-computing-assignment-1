import { x } from "@xstyled/emotion";
import React from "react";
import { useUser } from "./useUser";
import Link from "next/link";
import { Padding } from "./Padding";
import { UserAvatar } from "./UserAvatar";

export function Nav() {
  const { user, endSession } = useUser(false);

  return user ? (
    <x.nav
      fontSize="1.8rem"
      display="flex"
      h="10rem"
      w="100%"
      alignItems="center"
      px="2rem"
    >
      <x.h4 whiteSpace="nowrap" flexShrink={0} className="large">
        <Link href="/">
          <a>The Turing Network </a>
        </Link>
      </x.h4>
      <x.div flex={1} />
      <x.div display="flex" alignItems="center">
        <x.div textAlign="end">
          <Link href="/user">
            <a className="normal">{user.user_name}</a>
          </Link>
          <br />
          <Link href="/login">
            <a className="small" onClick={endSession}>
              Logout
            </a>
          </Link>
        </x.div>
        <Padding />
        <UserAvatar src={user.image} size="medium" />
      </x.div>
    </x.nav>
  ) : null;
}
