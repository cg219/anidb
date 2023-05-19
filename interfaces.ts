export interface LoadArgs {
    db: string;
}

export interface SearchArgs {
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
