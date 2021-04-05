module.exports = {
  rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: "http://localhost:8080/:path*",
        },
      ],
    };
  },
};
