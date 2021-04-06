import Link from "next/link";
import React from "react";
import { Nav } from "./Nav";

export const Page = ({
  showNav = true,
  showHeading = true,
  heading,
  ...props
}: {
  heading?: React.ReactNode;
  showNav?: boolean;
  showHeading?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <>
      {showNav ? <Nav /> : null}
      <div className="container">
        <div className="content">
          {showHeading && (
            <header>
              <h1>{heading}</h1>
            </header>
          )}
          {props.children}
        </div>
      </div>
    </>
  );
};
