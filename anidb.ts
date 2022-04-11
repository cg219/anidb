import { gzipDecode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { LoadArgs, SearchArgs } from './interfaces.ts';
import './localstorage.ts';

const encoder = new TextEncoder();
let supabase: any;

async function load ({ db, dbname, secret, url }: LoadArgs) {
    const buffer = await fetch(new URL(db)).then((res) => res.arrayBuffer());
    const data = new Uint8Array(buffer);

    try {
        if (!supabase) supabase = createClient(url, secret, { autoRefreshToken: false, persistSession: false });

        const decompressedData = gzipDecode(data);
        const decoder = new TextDecoder();
        const titlesData = decoder.decode(decompressedData);
        const arr = titlesData.split('\n')
            .slice(3)
            .map((entry, index) => {
                let [ani_id, type, lang, title] = entry.split('|');
                return { ani_id: Number(ani_id), type: Number(type), lang, title, id: index };
            });

        await supabase.from(dbname).delete().gte('id', 0).then();
        await supabase.from(dbname).insert(arr).then();
    } catch(e) {
        return e;
    }
}

async function searchByName({ dbname, url, secret, name }: SearchArgs) {
    try {
        if (!supabase) supabase = createClient(url, secret);

        let { data, error } = await supabase
            .from(dbname)
            .select('title, ani_id, type')
            .textSearch('title', name, {
                config: 'english',
                type: 'websearch'
            })
            .then()

        if (error) return error;

        return data;
    } catch (e) {
        return e;
    }
}

console.log(localStorage, 'test')
export {
    load,
    searchByName
}
