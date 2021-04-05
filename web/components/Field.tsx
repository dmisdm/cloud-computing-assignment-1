import React from "react";
import { x } from "@xstyled/emotion";

export const Field = React.forwardRef(
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
