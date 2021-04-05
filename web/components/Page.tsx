import Link from "next/link";
import React from "react";

export const Page = ({
  showHeader = true,
  heading,
  ...props
}: {
  heading: React.ReactNode;
  showHeader?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="container bg-grey">
      <div className="content">
        {showHeader && (
          <header>
            <h1>{heading}</h1>
          </header>
        )}
        {props.children}
      </div>
    </div>
  );
};
