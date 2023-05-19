export interface LoadArgs {
    db: string;
    longRunning: boolean;
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

export interface Anime {
    title: string;
    adbid: number;
    type: number;
    lang: string;
}

export interface Operation {
    fragments: string[][];
    title: string[];
    data: Anime
}
