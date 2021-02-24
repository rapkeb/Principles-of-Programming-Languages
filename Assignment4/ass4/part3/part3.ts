import { isBoolean } from "../shared/type-predicates";

export function* braid(gen1: () => Generator, gen2: () => Generator): Generator {
    let arr = [gen1(), gen2()];
    while (arr.length > 0) {
        for (let x = 0; x < arr.length; x++) {
            const { value, done } = arr[x].next();
            if (!done) {yield value;}
            else {arr.splice(x, 1);}}}}

export function* biased(gen1: () => Generator, gen2: () => Generator): Generator {
    let Gen1 = gen1();
    let Gen2 = gen2();
    let isGen1,isGen2 = false;
    while (!(isGen1 && isGen2)) {
        for (let x = 0; x < 2; x++) {
            const { value, done } = Gen1.next();
            isBoolean(done) ? isGen1 = done : isGen1 = true;
            if (!isGen1) {yield value;}}
        const { value, done } = Gen2.next();
        isBoolean(done) ? isGen2 = done : isGen2 = true;
        if (!isGen2) {yield value;}}}