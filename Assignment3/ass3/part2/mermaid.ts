import {atomicGraph, compoundGraph, edge, Graph, GraphContent, isatomicGraph, iscompoundGraph, isnodeDecl,isnodeRef, makecompundGraph, makeEdge, makeGraph, makenodeDecl, makeatomicGraph, makenodeRef,node, makeTD, makeedgeLabel} from "./mermaid-ast"
import {AtomicExp, Exp, isAtomicExp, isBinding, isCompoundExp, isDefineExp, isExp, isProgram, isVarDecl, Parsed,parseL4Exp, parseL4Program, Program, VarDecl, parseL4} from "./L4-ast"
import {CompoundSExp, EmptySExp, isCompoundSExp, isEmptySExp, isSymbolSExp, SExpValue, SymbolSExp} from "./L4-value"
import {bind, isOk, makeFailure, makeOk, mapResult, Result, safe2} from "../shared/result";
import {isArray, isBoolean, isNumber, isString} from "../shared/type-predicates"
import {isToken, parse as p} from "../shared/parser";
import {first, isEmpty, rest} from "../shared/list"
import {chain, map, reduce, union} from "ramda";
import {Sexp} from "s-expression";

export const unparseMermaid = (graph: Graph): Result<string> =>
    bind(unparseContent(graph.content), (strFromContent: string): Result<string> =>
            makeOk(`graph ${graph.dir.tag}${strFromContent}`));

export const unparseContent = (graphContent: GraphContent): Result<string> =>
    isatomicGraph(graphContent) ? unparseSpecialNode(graphContent.nodedecl) :
    iscompoundGraph(graphContent) ? unparseCompound(graphContent) :
    makeFailure("Bad unparse content");

export const unparseCompound = (comGraph: compoundGraph): Result<string> =>
    bind((mapResult(unparseRegularEdge, comGraph.vars)), (strFromEdge: string[]): Result<string> => 
            makeOk(reduce(makeLines,"", [strFromEdge[0]].concat(strFromEdge.slice(1, strFromEdge.length)))));

export const unparseRegularEdge = (edge: edge): Result<string> =>
    safe2((from: string, to: string): Result<string> => 
        edge.label !== undefined ? makeOk(`${from} -->|${edge.label}| ${to}`) :
        makeOk(`${from} --> ${to}`))
        (unparseRegularNode(edge.from),(unparseRegularNode(edge.to)));

export const unparseRegularNode = (node: node): Result<string> =>
    isnodeDecl(node) && (node.label === ":" || node.label === "DefineExp" || node.label === "AppExp" || node.label === "ProcExp" ||
    node.label === "LitExp" || node.label === "Program" || node.label === "IfExp" || node.label === "LetExp" ||
    node.label === "LetRecExp" || node.label === "SetExp") ? makeOk(`${node.id}[${node.label}]`) :
    isnodeRef(node) ? makeOk(`${node.id}`) :
    isnodeDecl(node) ? makeOk(`${node.id}["${node.label}"]`) :
    makeFailure("Bad unparse regular node");

export const unparseSpecialNode = (node: node): Result<string> =>
    isnodeDecl(node) && (node.label === ":" || node.label === "DefineExp" || node.label === "AppExp" || node.label === "ProcExp" ||
    node.label === "LitExp" || node.label === "Program" || node.label === "IfExp" || node.label === "LetExp" ||
    node.label === "LetRecExp" || node.label === "SetExp") ? makeOk(`${node.id}[${node.label}]`) :
    isnodeRef(node) ? makeOk(`${node.id}`) :
    isnodeDecl(node) ? makeOk(`${node.id}[${node.label}]`) :
    makeFailure("Bad unparse special node");

export const L4toMermaid = (concrete: string): Result<string> =>
bind(p(concrete), (sexp: Sexp): Result<string> =>
        isEmpty(sexp) || sexp === "" || isToken(sexp) ? makeFailure("big problem") :
        isArray(sexp) ? first(sexp) === "L4" ? L4ProgramToMermaid(sexp) : L4ExpToMermaid(sexp) :
        makeFailure("Wrong Sexp " + sexp));

export const L4ProgramToMermaid = (sexp: Sexp) : Result<string> =>
    bind(parseL4Program(sexp), (program: Program): Result<string> => 
            bind(mapL4toMermaid(program), unparseMermaid));

export const L4ExpToMermaid = (sexp: Sexp): Result<string> =>
    bind(parseL4Exp(sexp), (exp: Exp): Result<string> => 
            bind(mapL4toMermaid(exp), unparseMermaid));
        
export const mapL4toMermaid = (exp: Parsed): Result<Graph> => 
    isProgram(exp) ? mapProgramtoMermaid(exp) : 
    isExp(exp) ? mapExpToMermaid(exp) :
    makeFailure("Bad option");

export const mapProgramtoMermaid = (program: Program): Result<Graph> => {
    const newVars = VarsToStringArray([program.tag, "exps"], []); 
    return bind(mapCompoundExptoGraph(program.exps, newVars[1], newVars), (comGraph: compoundGraph): Result<Graph> =>
            bind(makeOk(makeEdge(makenodeDecl(newVars[0], program.tag), makenodeDecl(newVars[1], ":"), "exps")), 
                (firstEdge: edge): Result<Graph> => 
                    bind(ContentToCompoundGraph([makecompundGraph([firstEdge]), comGraph]), (comGraph1: compoundGraph): Result<Graph> =>
                        makeOk(makeGraph(makeTD(), comGraph1)))))};
    
export const mapExpToMermaid = (exp: Exp): Result<Graph> => {
    const newVars = VarsToStringArray([exp.tag], []);
    return bind(mapExptoGraphContent(exp, newVars[0], newVars), (graphContent: GraphContent): Result<Graph> =>
                iscompoundGraph(graphContent) ? bind(MakeRootNodeDecl(graphContent, exp.tag), (c: compoundGraph): Result<Graph> => 
                    makeOk(makeGraph(makeTD(), c))) :
                isatomicGraph(graphContent) ? makeOk(makeGraph(makeTD(), graphContent)) :
                makeFailure("Bad Expression"))
};

export const mapExptoGraphContent = (exp: Exp | CompoundSExp | VarDecl | SymbolSExp | EmptySExp | number  | boolean | string | Exp[],
     ID: string, Ids: string[]): Result<GraphContent> =>
    isDefineExp(exp) || isCompoundExp(exp) || isCompoundSExp(exp) || isArray(exp) ? mapCompoundExptoGraph(exp, ID, Ids) :
    isAtomicExp(exp) || isVarDecl(exp) || isSymbolSExp(exp) ? mapAtomictoGraph(exp, ID) :
    isEmptySExp(exp) ? mapEmptyToGraph(exp, ID) :
    isNumber(exp) || isString(exp) || isBoolean(exp) ? mapAtomicValuesToGraph(exp, ID) :
    isBinding(exp) ? mapCompoundExptoGraph(exp, ID, Ids) :
    makeFailure(`Bad Expression: ${JSON.stringify(exp)}`);

export const mapAtomictoGraph = (exp: AtomicExp | VarDecl | SymbolSExp, expId: string): Result<atomicGraph> => 
    Object.values(exp).length === 2 ? 
        Object.values(exp)[1] === true ? makeOk(makeatomicGraph(makenodeDecl(expId,`${exp.tag}(#t)`))) :
        Object.values(exp)[1] === false ? makeOk(makeatomicGraph(makenodeDecl(expId,`${exp.tag}(#f)`))) :
        makeOk(makeatomicGraph(makenodeDecl(expId,`${exp.tag}(${Object.values(exp)[1]})`))) :
    makeFailure("3 keys or more");

export const mapAtomicValuesToGraph = (exp: number | string | boolean, expId: string): Result<atomicGraph> =>
    exp === false ? makeOk(makeatomicGraph(makenodeDecl(expId,`${typeof(exp)}(#f)`))) :
    exp === true ? makeOk(makeatomicGraph(makenodeDecl(expId,`${typeof(exp)}(#t)`))) :
    makeOk(makeatomicGraph(makenodeDecl(expId,`${typeof(exp)}(${exp})`)));

export const mapEmptyToGraph = (exp: EmptySExp, expId: string): Result<atomicGraph> =>
    makeOk(makeatomicGraph(makenodeDecl(expId,`${exp.tag}`)));

export const mapCompoundExptoGraph = (exp: Exp | CompoundSExp | Exp[], expId: string, forbbidenIds: string[]): Result<compoundGraph> => 
{
    const keys = !isArray(exp) ? rest(Object.keys(exp)) : [];
    const values = !isArray(exp) ? rest(Object.values(exp)) : exp;
    const valuesTags = map((v):string => "" === extractTag(v) ? keys[values.indexOf(v)] : extractTag(v), values);
    const childrenIds = VarsToStringArray(valuesTags, forbbidenIds); 
    return bind(ValuesToGraphContent(values, expId, childrenIds, union(childrenIds, forbbidenIds)), 
                (childGraphs: GraphContent[]): Result<compoundGraph> => 
                bind(mapResult((graphContent: GraphContent): Result<edge>=>
                        isArray(values[childGraphs.indexOf(graphContent)]) ? makeOk(makeEdge(makenodeRef(expId),
                                    makenodeDecl(childrenIds[childGraphs.indexOf(graphContent)], ":"),
                                    !isArray(exp) ? keys[childGraphs.indexOf(graphContent)] : undefined)) :
                        isatomicGraph(graphContent) ? makeOk(makeEdge(makenodeRef(expId),graphContent.nodedecl,
                                    keys[childGraphs.indexOf(graphContent)])) : 
                        iscompoundGraph(graphContent) ? makeOk(makeEdge(makenodeRef(expId),
                                    makenodeDecl(childrenIds[childGraphs.indexOf(graphContent)], valuesTags[childGraphs.indexOf(graphContent)]),
                                                    keys[childGraphs.indexOf(graphContent)])) :
                        makeFailure("mapCompoundExptoGraph: (Creating Edges) Not an option")
                    , childGraphs),
                    (childrenEdges: edge[]): Result<compoundGraph> => 
                        bind(ContentToCompoundGraph(childGraphs), (comGraph: compoundGraph): Result<compoundGraph> =>
                                ContentToCompoundGraph([makecompundGraph(childrenEdges), comGraph]))))
    };

export const ValuesToGraphContent = (exps: Exp[], ID: string, childrenIds: string[], Ids: string[]): Result<GraphContent[]> =>
    reduce((convertedExps: Result<GraphContent[]>, exp: Exp): Result<GraphContent[]> =>
        !isOk(convertedExps) ? convertedExps :
        bind(makeOk(union(childrenIds, IdsFromContents(convertedExps.value))),(Names: string[]): Result<GraphContent[]> =>
                    bind(mapExptoGraphContent(exp, childrenIds[exps.indexOf(exp)], union(Names, Ids)), 
                        (graphContent: GraphContent): Result<GraphContent[]> => makeOk(union(convertedExps.value, [graphContent])))), makeOk([]), exps);
    
export const ContentToCompoundGraph = (graphs: GraphContent[]) : Result<compoundGraph> => 
    makeOk(makecompundGraph(chain((graphContent: GraphContent) : edge[] => iscompoundGraph(graphContent) ? graphContent.vars : [], graphs)));

export const getGraphRoot = (graph: GraphContent) : Result<node> => 
    iscompoundGraph(graph) ? makeOk(graph.vars[0].from) :
    isatomicGraph(graph) ? makeOk(graph.nodedecl) :
    makeFailure("Bad getGraphRoot");

export const MakeRootNodeDecl = (comGraph: compoundGraph, label: string): Result<compoundGraph> => 
    safe2((root: node, edges: edge[]) => ContentToCompoundGraph(
        [makecompundGraph([makeEdge(makenodeDecl(root.id, label),first(edges).to,first(edges).label)]),makecompundGraph(rest(edges))]))
    (getGraphRoot(comGraph), makeOk(comGraph.vars));
                        
export const VarsToStringArray = (vars: string[], Names: string[]): string[] => {
    const Vars = union([], vars);
    const Gens = map((x: string): (v: string) => string => makeVarGen(), Vars);
    const upperCaseFirstLetter = (s: string) : string => s.charAt(0).toUpperCase() + s.substring(1);
    const renameVar = (s: string): string => {
        const pos = Vars.indexOf(s);
        const varGen = Gens[pos];
        const tempName = ["number", "string", "boolean"].includes(s) ? varGen(s) : upperCaseFirstLetter(varGen(s));
        return Names.indexOf(tempName) !== -1 ? renameVar(s) : tempName;};
    return map(renameVar, vars);};

export const makeVarGen = (): (v: string) => string => {
    let count: number = 0;
    return (v: string) => {
        count++;
        return `${v}_${count}`;};};

export const extractTag = (x: Exp | SExpValue) : string =>
        isExp(x) || isSymbolSExp(x) || isEmptySExp(x) || isCompoundSExp(x) || isVarDecl(x) || isBinding(x) ? x.tag :
        isNumber(x) ? "number" :
        isString(x) ? "string" :
        isBoolean(x) ? "boolean" : "";

export const IdsFromEdges = (edges: edge[]) : string[] =>
    union(map((edge: edge): string => edge.from.id, edges), map((e: edge): string => e.to.id, edges));

export const IdsFromContents = (contents: GraphContent[]) : string[] =>
    chain((x: string[]): string[] => x, map((graphContent: GraphContent): string[] => 
        iscompoundGraph(graphContent) ? IdsFromEdges(graphContent.vars) : [graphContent.nodedecl.id] ,contents));

export const makeLines = (str1: string, str2: string): string =>{
    return str1 + '\n\t' + str2;}