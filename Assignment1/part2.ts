import { any, Pred, reduce, map, compose, T, filter } from "ramda";

/* Question 1 */
export const partition: <T> (pred : (x:T) => boolean, array : T[]) => T[][] =
<T>(pred:(x:T) => boolean, array: T[]) => [array.filter(pred), array.filter(x => pred(x) == false)];

/* Question 2 */
export const mapMat: <T> (func : (x:T) => T, array : T[][]) => T[][] =
<T> (func : (x:T) => T, array : T[][]) => 
array.reduce((acc : T[][], curr: T[]) => acc.concat([map(func,curr)]), []);

/* Question 3 */
export const composeMany = <T> (funcarray : ((x:T) => T)[]) : ((y:T) => T) =>
funcarray.reduce((acc : (x:T) => T, curr: (x:T) => T) => compose(acc, curr) , (x:T) => x);

/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

export const maxSpeed = (PokemonArray : Pokemon[]) : Pokemon[] =>
{
    let pokArr : number[] = PokemonArray.map((curr : Pokemon) => curr.base.Speed),
        MaxSpeed : number = pokArr.sort((a,b) => b-a)[0];
    return PokemonArray.filter((curr1 : Pokemon) => curr1.base.Speed == MaxSpeed);
};

export const grassTypes = (PokemonArray : Pokemon[]) : string[] =>
{
    let pokArr : Pokemon[] = PokemonArray.filter((curr : Pokemon) => curr.type.includes("Grass"));
    return pokArr.map((curr : Pokemon) => curr.name.english).sort((one, two) => (one > two ? 1 : -1));
};

export const uniqueTypes = (PokemonArray : Pokemon[]) : string[] =>
{
    let types : string[] = PokemonArray.reduce((acc : string[], curr: Pokemon) => acc.concat(curr.type) , []);
    return types.reduce((unique : string[], item : string) => unique.includes(item) ? unique : unique.concat(item),[]).sort((one, two) => (one > two ? 1 : -1));
};

