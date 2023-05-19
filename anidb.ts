/// <reference lib="deno.unstable" />

import { gzipDecode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { LoadArgs, SearchArgs, SearchResults } from './interfaces.ts';
import { chunk } from "https://deno.land/std@0.187.0/collections/chunk.ts";

const kv = await Deno.openKv();

async function load ({ db, longRunning = false }: LoadArgs) {
    const buffer = await fetch(new URL(db)).then((res) => res.arrayBuffer());
    const data = new Uint8Array(buffer);

    try {
        const decompressedData = gzipDecode(data);
        const titlesData = new TextDecoder().decode(decompressedData);
        const inserts = [];
        const arr = titlesData.split('\n')
            .slice(3)
            .filter((entry) => {
                const [adbid, type, lang, title] = entry.split('|');

                if (title) return true;
            })
            .map((entry) => {
                const [adbid, type, lang, title] = entry.split('|');
                const fragments = title.split('').reduce((acc: string[], cur: string) => {
                    acc.push(`${acc.at(-1) ?? ''}${cur}`);
                    return acc;
                }, []);
                const titleKey = ['title', title.toLowerCase()];

                return { adbid: Number(adbid), type: Number(type), lang, title, titleKey, fragments };
            });

        if (longRunning) {
            for (const { titleKey, fragments, ...anime } of arr) {
                const chunks = chunk(fragments, 9);

                chunks.forEach((c: string[]) => {
                    const atomic = kv.atomic();
                    c.forEach((f) => {
                        atomic.set(['titleByFragment', f.toLowerCase(), titleKey[1]], anime);
                    });
                    atomic.commit();
                    inserts.push(atomic);
                })

                const atomic = kv.atomic();
                atomic.set(titleKey, anime);
                atomic.commit();

                inserts.push(atomic);
            }

            await Promise.allSettled(inserts);
        }
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
