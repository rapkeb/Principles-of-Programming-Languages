/* Question 3 */

import { useWith } from "ramda";

interface Ok<T> {
    tag: "Ok";
    value: T;
}

interface Failure {
    tag: "Failure";
    message: string;
}

export type Result<T> = Ok<T> | Failure;

export const makeOk = <T>(x: T): {tag: "Ok",value: T} => ({ tag: "Ok", value: x});
export const makeFailure = (x: string): {tag: "Failure",message: string} => ({ tag: "Failure",message: x});

export const isOk = <T>(x: Result<T>): x is Ok<T> => x.tag === "Ok";
export const isFailure = <T>(x: Result<T>): x is Failure => x.tag === "Failure";

/* Question 4 */
export const bind = <T> (res : Result<T>, check : (x:T) => Result<T>) : Result<T> =>
{
    if(isOk(res))
        return check(res.value!);
    return makeFailure(res.message!);
    
}

/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
    user.name === "Bananas" ? makeFailure("Bananas is not a name") :
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
    makeOk(user);

export const naiveValidateUser = (user: User) : Result<User> =>
    isFailure(validateName(user)) ? validateName(user) :
    isFailure(validateEmail(user)) ? validateEmail(user):
    isFailure(validateHandle(user)) ? validateHandle(user):
    makeOk(user);

export const monadicValidateUser = (user: User) : Result<User> =>
    bind(bind(validateName(user), validateEmail),validateHandle);