import { KeyValuePair } from "ramda";

export const divideZero = new Error("Dividing zero");

export function f(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        if (x != 0) {resolve(1 / x);} 
        else {reject(divideZero);}});}

export function g(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        try {resolve(x * x);} 
        catch (err) {reject(err);}});}

export function h(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
       g(x).then((x) => f(x) ).then((x) => resolve(x) ).catch((err) => reject(err) );});}

export type SlowerResult<T> = KeyValuePair<number, T>;

const WP = <T>(promise: Promise<T>, place: number): Promise<SlowerResult<T>> =>
    new Promise<SlowerResult<T>>((resolve, reject) =>
        promise.then((res) => resolve([place, res])).catch((exeption) => reject(exeption)));

export const slower = <T>(promises : Promise<T>[]): Promise<SlowerResult<T>> => {
    const w1 = WP(promises[0], 0);
    const w2 = WP(promises[1], 1);
    return new Promise<SlowerResult<T>>((resolve, reject) =>Promise.race([w1, w2]).then((fasterValue) => {Promise.all([w1, w2])
        .then((values) => resolve(values.find(element => element[0] != fasterValue[0]))).catch((e) => reject(e))})
        .catch((e) => reject(e)));};