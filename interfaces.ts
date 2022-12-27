export interface LoadArgs {
    db: string;
    dbname: string;
}

export interface SearchArgs {
    dbname: string;
    name: string;
    secret?: string;
}

export interface Defaults {
    [key: string]: string
}

export interface SearchResults {
    title: string;
    adbid: string;
    type: string;
}
