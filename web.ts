import { load, searchByName } from './anidb.ts';
import { SearchResults } from './interfaces.ts';
import { serve } from 'https://deno.land/std@0.187.0/http/server.ts';
import { load as dotLoad } from "https://deno.land/std@0.187.0/dotenv/mod.ts";

const notFoundJson = { success: false, error: 'Not Found' };
const errorOccuredJson = { success: false, error: 'Internal Error' };

function notFound() {
    return new Response(new Blob([JSON.stringify(notFoundJson)], { type: 'application/json' }), { status: 404 });
}

function errorOccured() {
    return new Response(new Blob([JSON.stringify(errorOccuredJson)], { type: 'application/json' }), { status: 500 });
}

async function loadHandler(req: Request): Promise<Response> {
    if (req.method != 'POST') return notFound();

    const auth = req.headers.get('authorization');

    if (auth?.startsWith('Bearer')) {
        const secret = auth?.replace('Bearer ', '');
        const db = Deno.env.get('ANIDB_DB') || '';
        const params = new URLSearchParams(new URL(req.url as string).search);
        const longRunning = params.get('longRunning')?.toLowerCase() == 'true' ? true : false;

        await load({ db, longRunning });

        return new Response('200', { status: 200 })
    }

    return errorOccured();
}

async function searchHandler(req: Request): Promise<Response> {
    if (req.method != 'POST') return notFound();

    const auth = req.headers.get('authorization');

    if (auth?.startsWith('Bearer')) {
        const secret = auth?.replace('Bearer ', '');
        const { name } = await req.json();
        let data = await searchByName({ name }) || [];

        data = data.map((t: SearchResults) => ({ title: t.title, id: t.adbid, type: t.type }));

        const response = { success: true, data };

        return new Response(new Blob([JSON.stringify(response)], { type: 'application/json' }), { status: 200 })
    }

    return errorOccured();
}

if (import.meta.main) {
    await dotLoad({ export: true });
    await serve((req: Request) => {
        switch (new URL(req.url).pathname) {
            case '/load': {
                return loadHandler(req);
            }

            case '/search': {
                return searchHandler(req);
            }

            default: {
                return notFound();
            }
        }
    }, { port: 3200 })
}
