import cron from "node-cron";
import { deleteUsersJob } from "./deleteUsersJob.js";

cron.schedule("*/30 * * * *", deleteUsersJob);
