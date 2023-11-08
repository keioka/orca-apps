import { defer } from "@defer/client";

async function fetchMaterialsEveryHour() {
  // business logic here
  console.log("Fetching materials every hour");
}

export default defer.cron(fetchMaterialsEveryHour, "0 0 * * MON");