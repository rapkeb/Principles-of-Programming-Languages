
// <graph> ::= <header> <graphContent> // Graph(dir: Dir, content: GraphContent)
// <header> ::= graph (TD|LR)<newline> // Direction can be TD or LR
// <graphContent> ::= <atomicGraph> | <compoundGraph>
// <atomicGraph> ::= <nodeDecl>
// <compoundGraph> ::= <edge>+
// <edge> ::= <node> --><edgeLabel>? <node><newline> // <edgeLabel> is optional
// // Edge(from: Node, to: Node, label?: string)
// <node> ::= <nodeDecl> | <nodeRef>
// <nodeDecl> ::= <identifier>["<string>"] // NodeDecl(id: string, label: string)
// <nodeRef> ::= <identifier> // NodeRef(id: string)
// <edgeLabel> ::= |<identifier>| // string


export type Dir = TD|LR;
export type GraphContent = atomicGraph|compoundGraph;
export type node = nodeDecl|nodeRef;

export interface Graph {tag: "Graph"; dir: Dir; content: GraphContent};
export interface LR {tag: "LR";}
export interface TD {tag: "TD";}
export interface atomicGraph {tag: "atomicGraph", nodedecl: nodeDecl};
export interface compoundGraph {tag: "compoundGraph", vars: edge[]};
export interface edge { tag: "Edge"; from: node; to: node; label?: string; }
export interface nodeDecl {tag: "nodeDecl", id: string, label: string};
export interface nodeRef {tag: "nodeRef", id: string};
export interface edgeLabel {tag: "edgeLabel", id: string};

export const makeGraph = (direction: Dir, content: GraphContent): Graph => ({tag: "Graph", dir: direction, content: content});
export const makeTD = (): TD => ({tag: "TD"});
export const makeLR = (): LR => ({tag: "LR"});
export const makeatomicGraph = (nodedecl: nodeDecl): atomicGraph => ({tag: "atomicGraph", nodedecl: nodedecl});
export const makecompundGraph = (vars: edge[]): compoundGraph => ({tag: "compoundGraph", vars: vars});
export const makeEdge = (from: node, to: node, label?: string) : edge =>({tag: "Edge", from: from, to: to, label: label});
export const makenodeDecl = (id: string, label: string): nodeDecl => ({tag: "nodeDecl", id: id, label: label});
export const makenodeRef = (id: string): nodeRef => ({tag: "nodeRef", id: id});
export const makeedgeLabel = (id: string): edgeLabel => ({tag: "edgeLabel", id: id});

export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isLR = (x: any): x is LR => x.tag === "LeftRight";
export const isTD = (x: any): x is TD => x.tag === "TopDown";
export const isatomicGraph = (x: any): x is atomicGraph => x.tag === "atomicGraph";
export const iscompoundGraph = (x: any): x is compoundGraph => x.tag === "compoundGraph";
export const isEdge = (x: any): x is edge => x.tag === "edge";
export const isnodeDecl = (x: any): x is nodeDecl => x.tag === "nodeDecl";
export const isnodeRef = (x: any): x is nodeRef => x.tag === "nodeRef";
export const isedgeLabel = (x: any): x is edgeLabel => x.tag === "edgeLabel";



    
