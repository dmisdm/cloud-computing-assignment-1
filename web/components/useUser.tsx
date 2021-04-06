import createPersistedState from "use-persisted-state";
import { parse, isBefore, fromUnixTime } from "date-fns";
import React from "react";
import { useRouter } from "next/router";
import { errorResponse, userRecord } from "./models";

export type Error = typeof errorResponse.TYPE;

const useUserState = createPersistedState("user");

export type User = typeof userRecord.TYPE;

function isExpired(user: User) {
  return isBefore(fromUnixTime(user.authExpireDate), new Date());
}

export function useUser(redirectIfUnauthenticated = true) {
  const [userState, setUserState] = useUserState<null | User>(null);
  const router = useRouter();

  React.useEffect(() => {
    if ((!userState || isExpired(userState)) && redirectIfUnauthenticated) {
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

  const endSession = React.useCallback(() => {
    setUserState(null);
  }, []);
  return {
    user: userState,
    redirectToHome,
    login,
    endSession,
  };
}
