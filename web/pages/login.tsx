import React from "react";
import { Page } from "../components/Page";
import { x } from "@xstyled/emotion";
import { useUser } from "../components/useUser";
import { useForm } from "react-hook-form";
const Field = React.forwardRef(
  (
    { label, ...props }: { label: string } & JSX.IntrinsicElements["input"],
    ref: React.ForwardedRef<HTMLInputElement>
  ) => (
    <div>
      <x.label display="flex" alignItems="center">
        <x.span flex={1}>{label}</x.span>
        <input className="mh input border" {...props} ref={ref} />
      </x.label>
    </div>
  )
);
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
              w="100%"
              paddingTop="1rem"
              type="submit"
              className="primary"
              name="login"
              value="Login"
            />
            {formError && (
              <div className="bg-error white p rounded small m">
                <span className="large">Login Error</span>
                <br />
                {formError}
              </div>
            )}
          </form>
        </x.div>
      </x.div>
    </Page>
  );
};

export default Login;
