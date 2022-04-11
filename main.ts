import { load, searchByName } from './anidb.ts';
import { LoadArgs, SearchArgs } from './interfaces.ts';
import { serve } from 'https://deno.land/std@0.134.0/http/server.ts';
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const notFoundJson = { success: false, error: 'Not Found' };
const errorOccuredJson = { success: false, error: 'Internal Error' };
const notFound = new Response(new Blob([JSON.stringify(notFoundJson)], { type: 'application/json' }), { status: 404 });
const errorOccured = new Response(new Blob([JSON.stringify(errorOccuredJson)], { type: 'application/json' }), { status: 500 });

interface SearchResults {
    title: string;
    ani_id: string;
    type: string;
}

async function loadHandler(req: Request): Promise<Response> {
    if (req.method != 'POST') return notFound;

    const auth = req.headers.get('authorization');

    if (auth?.startsWith('Bearer')) {
        const secret = auth?.replace('Bearer ', '');
        const db = Deno.env.get('ANIDB_DB') || '';
        const dbname = Deno.env.get('ANIDB_DBNAME') || '';
        const url = Deno.env.get('ANIDB_URL') || '';

        await load({ secret, url, db, dbname });

        return new Response('200', { status: 200 })
    }

    return errorOccured;
}

async function searchHandler(req: Request): Promise<Response> {
    if (req.method != 'POST') return notFound;

    const auth = req.headers.get('authorization');

    if (auth?.startsWith('Bearer')) {
        const secret = auth?.replace('Bearer ', '');
        const { name } = await req.json();
        const url = Deno.env.get('ANIDB_URL') || '';
        const dbname = Deno.env.get('ANIDB_DBNAME') || '';
        let data = await searchByName({ secret, url, dbname, name }) || [];

        data = data.map((t: SearchResults) => ({ title: t.title, id: t.ani_id, type: t.type }));

        const response = { success: true, data };

        return new Response(new Blob([JSON.stringify(response)], { type: 'application/json' }), { status: 200 })
    }

    return errorOccured;
}

await serve((req) => {
    switch (new URL(req.url).pathname) {
        case '/load':
            return loadHandler(req);
            break;

        case '/search':
            return searchHandler(req);
            break;

        default:
            return notFound;
    }
})
