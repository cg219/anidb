import { Cron } from "https://deno.land/x/croner@5.3.5/src/croner.js";
import { load } from "./anidb.ts";

if (import.meta.main) {
    console.log('Scheduler Started')
    const _scheduler = new Cron("15 1 * * *", { timezone: 'America/New_York'}, async () => {
        console.log('Loading updated DB');
        await load({ db: Deno.env.get('ANIDB_DB')!, dbname: Deno.env.get('ANIDB_DBNAME')! });
        console.log('DB updated');
    });
}
