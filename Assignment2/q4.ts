import { Exp, Program, IfExp, isBoolExp, AppExp, isExp, isProgram, isDefineExp, isIfExp, isAppExp, isProcExp, isNumExp, isVarRef, isPrimOp, ProcExp } from '../imp/L2-ast';
import { Result, makeOk, mapResult, bind, safe3, safe2, makeFailure } from '../imp/result';
import { map } from 'ramda';

/*
Purpose:  transform a given L2 program to a JavaScript program
Signature: l2ToJS(exp)
Type: [Exp | Program -> Result<string>]
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
isProgram(exp) ? l2ToJSProgram(exp): 
isExp(exp) ? l2ToJSExpression(exp) :
makeFailure(`expression not found: ${exp}`);

export const l2ToJSProgram = (exp: Program) : Result<string> =>
exp.exps.length === 1 ? bind(mapResult(l2ToJS, exp.exps), (exps: string[]) => makeOk(exps.join(";\n")+");")) :
bind(mapResult(l2ToJS, exp.exps), (exps: string[]) : Result<string> => {
    exps[exps.length-1] = "console.log(" + exps[exps.length-1];
    return makeOk(exps.join(";\n")+");") 
})

export const l2ToJSExpression = (exp: Exp) : Result<string> =>
isIfExp(exp) ? l2ToJSIf(exp):
isAppExp(exp) ? l2ToJSApp(exp) :
isProcExp(exp) ? l2ToJSProc(exp):
isVarRef(exp) ? makeOk(exp.var) :
isNumExp(exp) ? makeOk(exp.val.toString()) :
isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") :
isPrimOp(exp) ? exp.op === "=" ? makeOk("===") : exp.op === "not" ? makeOk("!") : makeOk(exp.op) :
isDefineExp(exp) ? bind(l2ToJS(exp.val), (value: string) => makeOk('const' + ' ' + exp.var.var + ' ' + '=' + ' ' + value)) :
makeFailure(`expression not found: ${exp}`);

export const l2ToJSProc = (exp: ProcExp) : Result<string> =>
exp.body.length === 1 ? bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}${")"} ${"=>"} ${body.join(" ")})`)) :
bind(mapResult(l2ToJS, exp.body), 
(body: string[]) : Result<string> => {
    let tmp = body.join(";^");
    let ret = tmp.split("^", 3);
    ret.splice(body.length-1, 0 ,"return");
    return makeOk(`((${map(v => v.var, exp.args).join(",")}${")"} ${"=>"} ${"{"}${ret.join(" ")}${";"}${"}"})`);
})

export const l2ToJSApp = (exp: AppExp) : Result<string> =>
isPrimOp(exp.rator) && exp.rator.op === "not" ? safe2((rator: string, rands: string[]) => makeOk(`${"("}${rator}${rands.join(",")})`))
    (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
isPrimOp(exp.rator) && exp.rator.op !== "not" ? safe2((rator: string, rands: string[]) => makeOk(`(${rands.join(" "+ rator + " ")})`))
    (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
safe2((rator: string, rands: string[]) => makeOk(`${rator}${"("}${rands.join(",")})`))
    (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands))

export const l2ToJSIf = (exp: IfExp) : Result<string> =>
safe3((test: string, then: string, alt: string) => makeOk(`(${test} ${"?"} ${then} ${":"} ${alt})`))
    (l2ToJS(exp.test), l2ToJS(exp.then), l2ToJS(exp.alt))