/// <reference lib="deno.unstable" />

import { gzipDecode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { LoadArgs, Operation, SearchArgs, SearchResults } from './interfaces.ts';
import { chunk } from "https://deno.land/std@0.187.0/collections/chunk.ts";

const kv = await Deno.openKv();

async function load ({ db }: LoadArgs) {
    const buffer = await fetch(new URL(db)).then((res) => res.arrayBuffer());
    const data = new Uint8Array(buffer);

    try {
        const decompressedData = gzipDecode(data);
        const titlesData = new TextDecoder().decode(decompressedData);

        titlesData.split('\n')
            .slice(3)
            .filter((entry) => entry.split('|').at(3) ? true : false) // Filter out entries without titles
            .reduce(async (prev, entry) => {
                await prev;

                const [adbid, type, lang, title] = entry.split('|');
                const fragments = title.split('').reduce((acc: string[], cur: string) => {
                    acc.push(`${acc.at(-1) ?? ''}${cur}`);
                    return acc;
                }, []);
                const titleKey = ['title', title.toLowerCase()];
                const anime = { adbid: Number(adbid), type: Number(type), lang, title };
                const chunks = chunk(fragments, 9);
                const transactions: Promise<Deno.KvCommitResult | Deno.KvCommitError>[] = [];

                chunks.forEach((c: string[]) => {
                    const atomic = kv.atomic();
                    c.forEach((f) => {
                        atomic.set(['titleByFragment', f.toLowerCase(), titleKey[1]], anime);
                    });
                    transactions.push(atomic.commit());
                })

                const atomic = kv.atomic();
                atomic.set(titleKey, anime);
                transactions.push(atomic.commit());

                return Promise.allSettled(transactions);
            }, {});
    } catch(e) {
        console.log(e);
        return e;
    }
}

async function searchByName({ name }: SearchArgs) {
    try {
        const results = await kv.list<SearchResults>({ prefix: ['titleByFragment', name] });
        const rows = [];

        for await (const res of results) {
            rows.push(res.value);
        }

        return rows;
    } catch (e) {
        console.log(e);
        return e;
    }
}

export {
    load,
    searchByName
}
