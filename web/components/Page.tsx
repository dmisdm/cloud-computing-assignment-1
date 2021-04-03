import React from "react";

export const Page = ({
  showHeader = true,
  ...props
}: {
  showHeader?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="container">
      <div className="content">
        {showHeader && (
          <header>
            <h1>Header</h1>
            <nav className="nav">
              <a href="#">Home</a>
              <a href="#">Docs</a>
              <a href="#">About</a>
            </nav>
          </header>
        )}
        {props.children}
      </div>
    </div>
  );
};
