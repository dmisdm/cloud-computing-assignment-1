import { x } from "@xstyled/emotion";
import React from "react";
import { useForm, useFormContext } from "react-hook-form";

export function PostForm({
  onSuccess,
  initialData,
  onCancel,
  ...props
}: {
  initialData?: {
    id?: string;
    subject: string;
    message: string;
    image: string;
  };
  onCancel?: () => void;
  onSuccess?: () => void;
} & (
  | {
      edit?: false;
      createPost: (post: {
        subject: string;
        message: string;
        image: File;
      }) => Promise<any>;
    }
  | {
      edit: true;
      editPost: (post: {
        id: string;
        subject?: string;
        message?: string;
        image?: File;
      }) => Promise<unknown>;
    }
)) {
  const {
    register,
    handleSubmit,
    reset,
    formState,
    setValue,
    getValues,
  } = useForm<{
    id: string;
    message: string;
    subject: string;
    image: File;
  }>({ defaultValues: initialData });
  const values = getValues();

  const [localImage, setLocalImage] = React.useState<File>();
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (props.edit) {
          await props.editPost(values);
        } else {
          await props.createPost(values);
        }

        reset();
        setLocalImage(undefined);
        onSuccess && onSuccess();
      })}
    >
      <div className="p">
        <input
          disabled={formState.isSubmitting}
          aria-label="subject"
          className="input pill border b-black"
          placeholder="Subject"
          required
          maxLength={120}
          {...register("subject", {
            required: true,
            maxLength: 120,
            setValueAs: (v) => v.trim(),
          })}
        />
        <br />
        <textarea
          disabled={formState.isSubmitting}
          aria-label="message"
          placeholder="Write a compelling message"
          className="pill input border b-black"
          required
          maxLength={500}
          style={{ resize: "none", width: "100%", minHeight: "10rem" }}
          {...register("message", {
            required: true,
            maxLength: 500,
            setValueAs: (v) => v.trim(),
          })}
        />
        <br />
        {(values.image || localImage) && (
          <x.img
            maxHeight="20rem"
            w="100%"
            objectFit="contain"
            src={
              typeof values.image === "string"
                ? values.image
                : URL.createObjectURL(localImage)
            }
          />
        )}
        <br />
        <label>
          Image
          <input
            disabled={formState.isSubmitting}
            type="file"
            className="pill p"
            accept=".png,.gif,.jpg,.jpeg"
            multiple={false}
            onChange={(e) => {
              const first = e.currentTarget.files?.item(0);
              if (first) {
                setValue("image", first);
                setLocalImage(first);
              }
            }}
            required={!props.edit}
          />
        </label>

        <x.div h="1rem" />
        <x.div display="flex">
          {onCancel && (
            <x.button
              disabled={formState.isSubmitting}
              flex={1}
              className="btn pill "
              onClick={onCancel}
            >
              Cancel
            </x.button>
          )}
          <x.input
            disabled={formState.isSubmitting}
            flex={1}
            className="btn primary pill white"
            type="submit"
            value={
              formState.isSubmitting
                ? "Posting..."
                : props.edit
                ? "Update"
                : "Post"
            }
          />
        </x.div>
      </div>
    </form>
  );
}
