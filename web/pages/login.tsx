import React from "react";
import { Page } from "../components/Page";
import { x } from "@xstyled/emotion";

const Field = ({
  label,
  ...props
}: { label: string } & JSX.IntrinsicElements["input"]) => (
  <div>
    <x.label display="flex" alignItems="center">
      <x.span flex={1}>{label}</x.span>
      <input className="mh input border" {...props} />
    </x.label>
  </div>
);
const Login = () => {
  return (
    <Page showHeader={false}>
      <x.div
        display="flex"
        h="100vh"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <h3>Login</h3>
        <x.div className="card rounded">
          <form>
            <Field label="ID" name="id" placeholder="enter your id" />
            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="enter your password"
            />
            <x.input
              paddingTop="1rem"
              float="right"
              type="submit"
              className="primary"
              name="login"
            />
          </form>
        </x.div>
      </x.div>
    </Page>
  );
};

export default Login;
