import app from "./app";

const PORT = process.env.PORT || 3031;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
  console.error(`UnhandledRejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err: Error) => {
  console.error(`UncaughtException: ${err.message}`);
  process.exit(1);
});
