import { x } from "@xstyled/emotion";
import { useRouter } from "next/router";
import React from "react";
import { useForm, useFormContext } from "react-hook-form";
import { Field } from "../components/Field";
import { errorResponse } from "../components/models";
import { objectToFormData } from "../components/objectToFormData";
import { Page } from "../components/Page";
import { ErrorMessage } from "../components/ErrorMessage";
export type FormModel = {
  id: string;
  user_name: string;
  password: string;
  confirm_password: string;
  image: FileList;
};
const RegisterPage = () => {
  const { register, handleSubmit, formState, getValues } = useForm<FormModel>();
  const [formError, setFormError] = React.useState<string>();
  const router = useRouter();
  return (
    <Page showNav={false}>
      <x.div
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <h3>Register</h3>
        <form
          onSubmit={handleSubmit(async (values) => {
            const formData = objectToFormData({
              ...values,
              image: values.image.item(0)!!,
            });
            const res = await fetch("/api/register", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) {
              const errorBody = errorResponse.create(await res.json());
              setFormError(errorBody.error.message);
            } else {
              router.push("/login");
            }
          })}
        >
          <x.div
            display="flex"
            flexDirection="column"
            className="card rounded bg-grey"
          >
            <Field
              label="ID"
              autoComplete="new-username"
              required
              {...register("id", { required: true })}
            />
            <ErrorMessage formState={formState} field="id" />
            <Field
              label="Name"
              required
              autoComplete="name"
              {...register("user_name", { required: true })}
            />
            <ErrorMessage formState={formState} field="user_name" />
            <Field
              type="password"
              label="Password"
              autoComplete="new-password"
              required
              {...register("password", { required: true })}
            />
            <ErrorMessage formState={formState} field="password" />
            <Field
              type="password"
              label="Confirm Password"
              autoComplete="new-password"
              required
              {...register("confirm_password", {
                required: true,
                validate: (value) =>
                  value !== getValues().password
                    ? "Passwords must match"
                    : true,
              })}
            />
            <ErrorMessage formState={formState} field="confirm_password" />
            <Field
              label="Profile Image"
              type="file"
              accept=".jpg,.gif,.png,.jpeg"
              required
              {...register("image", {
                required: true,
                validate: (value) => {
                  const first = value.item(0);
                  return !!first && first.size > 0;
                },
              })}
            />

            <ErrorMessage formState={formState} field="image" />
            <x.input
              type="submit"
              value={formState.isSubmitting ? "Loading..." : "Register"}
              w="100%"
              className="btn primary rounded white"
            />
            {formError && (
              <x.span py="1rem" className="error tacenter">
                {formError}
              </x.span>
            )}
          </x.div>
        </form>
      </x.div>
    </Page>
  );
};

export default RegisterPage;
