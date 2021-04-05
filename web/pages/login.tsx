import React from "react";
import { Page } from "../components/Page";
import { x } from "@xstyled/emotion";
import { useUser } from "../components/useUser";
import { useForm } from "react-hook-form";
import { Field } from "../components/Field";
import { ErrorMessage } from "../components/ErrorMessage";
const Login = () => {
  const { user, login, redirectToHome } = useUser(false);
  const { register, handleSubmit, formState } = useForm<{
    id: string;
    password: string;
  }>();
  const [formError, setFormError] = React.useState<string | null>(null);
  return (
    <Page heading="" showHeader={false}>
      <x.div
        display="flex"
        h="100vh"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <h3>Login</h3>
        <x.div className="card rounded">
          <form
            onSubmit={handleSubmit(async (formValues) => {
              setFormError(null);
              const result = await login(formValues);
              if ("error" in result) {
                setFormError(result.error.message);
              } else {
                redirectToHome();
              }
            })}
          >
            <Field
              label="ID"
              placeholder="enter your id"
              autoComplete="username"
              {...register("id", { required: true })}
            />
            <Field
              label="Password"
              type="password"
              placeholder="enter your password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
            <x.input
              w="96%"
              paddingTop="1rem"
              type="submit"
              className="primary rounded"
              name="login"
              value="Login"
            />
            {formError ? (
              <x.p className="tacenter small error">{formError}</x.p>
            ) : null}
          </form>
        </x.div>
      </x.div>
    </Page>
  );
};

export default Login;
