import { makeIfExp, makeDefineExp, CExp, Exp ,ForExp, AppExp, Program, makeNumExp, makeProgram,  makeProcExp, makeAppExp, isExp, isProgram, isCExp, isDefineExp, isAtomicExp, isIfExp, isAppExp, isProcExp, isForExp } from "./L21-ast";
import { Result, makeOk} from "../imp/result";
import { range, map } from "ramda";

/*
Purpose: Transform For expression to an app expression.
Signature: for2app(exp)
Type: [ForExp -> AppExp]
Example: (for i 1 3 (* i i)) → ((lambda() ((lambda(i)(* i i)) 1) ((lambda(i)(* i i)) 2) ((lambda(i)(* i i)) 3))) 
Pre-conditions: a legal For epression in L21
Post-condition: App expression that represent exactly the process of the inputted for expression
*/
export const for2app = (exp: ForExp): AppExp =>
    makeAppExp(makeProcExp([],map((num : number) => 
    makeAppExp(makeProcExp([exp.vars],[exp.Body]),[makeNumExp(num)]),range(exp.startValue.val,exp.endValue.val+1))),[])

/*
Purpose: Transform an L21 ast-tree to L2 ast tree.
Signature: L21ToL2(exp)
Type: [Exp | Program -> Result<Exp | Program>]
Example: ('(lambda (x) (* x x))') -> ((x) => (x * x))
Pre-conditions: legal epression or a Program in L21
Post-condition: result of L2 code that do the same process as the input in L21
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp) ? makeOk(makeProgram(map(rewriteAllExpressions, exp.exps))) :
    isExp(exp) ? makeOk(rewriteAllExpressions(exp)) :
    makeOk(exp)

const rewriteAllExpressions = (exp: Exp): Exp =>
    isDefineExp(exp) ? makeDefineExp(exp.var, rewriteAllCExp(exp.val)) :
    isCExp(exp) ? rewriteAllCExp(exp) :
    exp;

const rewriteAllCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(rewriteAllCExp(exp.test),rewriteAllCExp(exp.then),rewriteAllCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteAllCExp(exp.rator),map(rewriteAllCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteAllCExp, exp.body)) :
    isForExp(exp) ? for2app(exp) :
    exp