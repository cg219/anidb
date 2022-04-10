export interface LoadArgs {
    db: string;
    dbname: string;
    secret: string;
    url: string;
}

export interface SearchArgs {
    dbname: string;
    secret?: string;
    url?: string;
    name: string
}

export interface Defaults {
    [key: string]: string
}
