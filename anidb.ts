import { gzipDecode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { LoadArgs, SearchArgs } from './interfaces.ts';
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

async function load ({ db, dbname }: LoadArgs) {
    const buffer = await fetch(new URL(db)).then((res) => res.arrayBuffer());
    const data = new Uint8Array(buffer);
    const client = new Client({
        tls: {
            caCertificates: [ await Deno.readTextFile(Deno.env.get('PGSSLCERT')!)],
            enabled: true
        }
    })

    try {
        const dropTable = `DROP TABLE IF EXISTS ${dbname};`;
        const createTable = `CREATE TABLE ${dbname}
                (id SERIAL PRIMARY KEY,
                adbid INT NOT NULL,
                type SMALLINT,
                lang VARCHAR(50),
                title TEXT NOT NULL);`;
        const alterTable = `ALTER TABLE ${dbname} ADD COLUMN ts tsvector GENERATED ALWAYS AS (to_tsvector('english', title)) STORED;`;
        const createIndex = `CREATE INDEX ts_idx ON ${dbname} USING GIN (ts);`;
        const insertData = `INSERT INTO ${dbname}(adbid, type, lang, title) VALUES($ADBID, $TYPE, $LANG, $TITLE)`;
        const decompressedData = gzipDecode(data);
        const titlesData = new TextDecoder().decode(decompressedData);
        const inserts = [];
        const arr = titlesData.split('\n')
            .slice(3)
            .map((entry) => {
                const [adbid, type, lang, title] = entry.split('|');
                return { adbid: Number(adbid), type: Number(type), lang, title };
            });

        await client.connect();
        await client.queryArray(dropTable);
        await client.queryArray(createTable);
        await client.queryArray(alterTable);
        await client.queryArray(createIndex);

        for (const { adbid, title, lang, type } of arr) {
            inserts.push(client.queryArray(insertData, { adbid, title, lang, type }));
        }

        await Promise.allSettled(inserts);
        await client.end();
    } catch(e) {
        console.log(e);
        return e;
    }
}

async function searchByName({ name, dbname }: SearchArgs) {
    const query = `SELECT title, adbid, type FROM ${dbname} WHERE ts @@ to_tsquery('english', '${name.split(' ').join(' & ')}');`;
    const client = new Client({
        tls: {
            caCertificates: [ await Deno.readTextFile(Deno.env.get('PGSSLCERT')!)],
            enabled: true
        }
    })

    try {
        await client.connect();
        const data = await client.queryObject(query);
        await client.end();
        return data.rows;
    } catch (e) {
        console.log(e);
        return e;
    }
}

export {
    load,
    searchByName
}
