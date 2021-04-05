import createPersistedState from "use-persisted-state";
import { parse, isBefore, fromUnixTime } from "date-fns";
import React from "react";
import { useRouter } from "next/router";
import { type, string, number, optional, unknown } from "superstruct";

const userRecord = type({
  id: string(),
  user_name: string(),
  image: string(),
  authExpireDate: number(),
});

const errorResponse = type({
  error: type({
    detail: optional(unknown()),
    message: string(),
    name: string(),
  }),
});

export type Error = typeof errorResponse.TYPE;

const useUserState = createPersistedState("user");

export type User = typeof userRecord.TYPE;

function isExpired(user: User) {
  return isBefore(fromUnixTime(user.authExpireDate), new Date());
}

export function useUser(redirectIfUnauthenticated = true) {
  const [userState, setUserState] = useUserState<undefined | User>();
  const router = useRouter();

  React.useEffect(() => {
    if ((!userState || isExpired(userState)) && redirectIfUnauthenticated) {
      console.log("Expired? " + (userState ? isExpired(userState) : false));
      router.push("/login");
    }
  }, [userState, redirectIfUnauthenticated]);

  const login = React.useCallback(
    async ({ id, password }: { id: string; password: string }) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });
      if (res.ok) {
        const user = userRecord.create(await res.json());
        setUserState(user);
        return user;
      } else {
        return errorResponse.create(await res.json());
      }
    },
    []
  );
  const redirectToHome = React.useCallback(() => {
    router.push("/");
  }, []);
  return {
    user: userState,
    redirectToHome,
    login,
  };
}
