import { load, searchByName } from './anidb.ts';
import { LoadArgs, SearchArgs, SearchResults } from './interfaces.ts';
import { serve } from 'https://deno.land/std@0.134.0/http/server.ts';
import { parse } from 'https://deno.land/std@0.139.0/flags/mod.ts';
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const mergedArgs = {
    db: Deno.env.get('ANIDB_DB') || '',
    dbname: Deno.env.get('ANIDB_DBNAME') || '',
    secret: Deno.env.get('ANIDB_SECRET') || '',
    url: Deno.env.get('ANIDB_URL') || '',
    name: '',
    ...parse(Deno.args)
}

async function main() {
    switch(mergedArgs._[0]) {
        case 'search':
            let res = await searchByName(mergedArgs);
            console.log(res);
            break;

        case 'load':
            await load(mergedArgs);
            break;
    }
}

main();
