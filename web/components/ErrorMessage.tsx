import { x } from "@xstyled/emotion";
import React from "react";
import { FormState } from "react-hook-form";
import { FormModel } from "../pages/register";

export const ErrorMessage = ({
  formState,
  field,
}: {
  formState: FormState<FormModel>;
  field: keyof FormModel;
}) => {
  const fieldErrors = formState.errors[field];
  return (
    (fieldErrors?.message && formState.touchedFields[field] && (
      <x.span className="taright small error" pb="1rem">
        {fieldErrors.message}
      </x.span>
    )) ||
    null
  );
};
