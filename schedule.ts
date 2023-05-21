import { Cron } from "https://deno.land/x/croner@5.3.5/src/croner.js";

if (import.meta.main) {
    console.log('Scheduler Started')
    const _scheduler = new Cron("15 1 * * *", { timezone: 'America/New_York'}, async () => {
        console.log('Loading updated DB');
        await fetch(Deno.env.get('LOAD_URL')!, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('ANIDB_SECRET')}`
            }
        });

        console.log('DB updated');
    });
}
