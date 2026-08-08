import app from "./app";
import { seedSuperAdmin } from "./shared/seed";
import { initCronJobs } from "./jobs/otpCleanup";

const PORT = process.env.PORT || 3031;

const startServer = async () => {
  await seedSuperAdmin();
  initCronJobs();
  
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });

  process.on("unhandledRejection", (err: Error) => {
    console.error(`UnhandledRejection: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();

process.on("uncaughtException", (err: Error) => {
  console.error(`UncaughtException: ${err.message}`);
  process.exit(1);
});
