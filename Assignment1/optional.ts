import { any, Pred, reduce, map, compose, T, filter } from "ramda";
/* Question 1 */

interface Some<T> {
    tag: "Some";
    value: T;
}

interface None {
    tag: "None";
}

export type Optional<T> = Some<T> | None;

export const makeSome = <T>(x: T): {tag: "Some",value: T} => ({ tag: "Some", value: x});
export const makeNone = (): {tag: "None"} => ({ tag: "None"});

export const isSome = <T>(x: Optional<T>): x is Some<T> => x.tag === "Some"; 
export const isNone = <T>(x: Optional<T>): x is None => x.tag === "None"; 

/* Question 2 */
export const bind = <T,U> (opt : Optional<T>, check : (x:T) => Optional<U>) : Optional<U> =>
    {
        if(isSome(opt))
            return check(opt.value!);
        return makeNone();
    }