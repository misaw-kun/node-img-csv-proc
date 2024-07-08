module.exports = {
  apps: [
    {
      name: "web-server",
      script: "index.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "image-worker",
      script: "./utils/worker.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
