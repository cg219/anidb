import * as path from "https://deno.land/std@0.83.0/path/mod.ts";


const Try = (fn : any) => {try{return fn()}catch(e){return undefined}}

const HOME = (Deno.env.get('HOME') as string)
const NAMESPACE = Deno.env.get('LOCAL_STORAGE_NAMESPACE') || 'default'
const PATH = Deno.env.get('LOCAL_STORAGE_PATH') || path.join(HOME, '.cache', 'deno', NAMESPACE)



type LocalStorageCustom = {
    getItem(key : string) : any;
    setItem(key : string, value : any) : void;
    removeItem(key : string) : void;
    clear() : void;
    key(index : number) : string;
    length : number;
    toObject() : any;
    [key : string] : any
}






/**lib */
declare global {
    // interface Window { localStorage: LocalStorageCustom; }
    interface globalThis { localStorage : LocalStorageCustom}
}


let iface = {
    getItem(key : string){
        let data = Try(()=>JSON.parse(Deno.readTextFileSync(PATH))) || {}
        return data?.[key]
    },

    setItem(key : string, value : string){
        let data = Try(()=>JSON.parse(Deno.readTextFileSync(PATH))) || {}
        data[key] = value
        Deno.writeTextFileSync(PATH, JSON.stringify(data))
    },

    removeItem(key : string){
        let data = Try(()=>JSON.parse(Deno.readTextFileSync(PATH))) || {}
        delete data[key]
        Deno.writeTextFileSync(PATH, JSON.stringify(data))
    },

    clear(){
        Deno.writeTextFileSync(PATH, JSON.stringify({}))
    },

    key(index : number){
        let data = Try(()=>JSON.parse(Deno.readTextFileSync(PATH))) || {}
        data = Object.keys(data)
        return data?.[index] || null
    },

    get length(){
        let data = Try(()=>JSON.parse(Deno.readTextFileSync(PATH))) || {}
        data = Object.keys(data)
        return data.length
    },
    toObject(){
        let data = Try(()=>JSON.parse(Deno.readTextFileSync(PATH))) || {}
        return data
    }
};


(async ()=>{

    if (!localStorage) {
        let localStorageObj = new Proxy({}, {
            get(o : any, k : string){
                if(['length', 'key', 'clear', 'removeItem', 'setItem', 'getItem', 'toObject'].includes(k))return (iface as any)[k]
                else return iface.getItem(k)
            },

            set(o, k : string, v : any){
                iface.setItem(k, v)
                return true
            }
        });





        window.localStorage = localStorageObj
    }
})()
