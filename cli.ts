import { load, searchByName } from './anidb.ts';
import { load as dotLoad } from "https://deno.land/std@0.170.0/dotenv/mod.ts";
import { Select } from "https://deno.land/x/cliffy@v0.25.6/prompt/select.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.6/command/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.6/ansi/colors.ts";
import { SearchResults } from './interfaces.ts';

if (import.meta.main) {
    await dotLoad({ export: true });
    await new Command()
        .name('anidb')
        .version('0.1.0')
        .description('Create id file for specified anime')
        .usage('[command] title')
        .command('search')
            .description('Search database for anime titles')
            .usage('title')
            .arguments('<name> [val:string]')
            .action(async (options, name) => {
                const results = await searchByName({ dbname: Deno.env.get('ANIDB_DBNAME')!, name });
                const choice = await Select.prompt({
                    message: 'Which is the correct one?',
                    options: results.map((a: SearchResults) => ({ name: a.title, value: a })),
                    maxRows: 25,
                    validate() {
                        return true;
                    },
                    transform(v) {
                        return v;
                    }
                })
            })
        .command('load')
            .description('Update search database with latest anime data')
            .usage('')
            .action(async () => {
                console.log(colors.bold.rgb24('Updating Database. This may take several minutes.', 0xef0038))
                await load({ dbname: Deno.env.get('ANIDB_DBNAME')!, db: Deno.env.get('ANIDB_DB')! });
            })
        .parse(Deno.args);
}
