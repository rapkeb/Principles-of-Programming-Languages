import fs from 'fs';
import { expect } from 'chai';

import { L4toMermaid } from './mermaid';
import { isFailure, isOk } from '../shared/result';

describe('L4 MER', () => {
    it('eval empty', () => {
        expect(L4toMermaid("")).to.satisfy(isFailure);
    });
    it('empty program', () => {
        const res = L4toMermaid(`(L4)`);
        expect(res).to.satisfy(isFailure);
    });
    it('empty program with space', () => {
        const res = L4toMermaid(`(L4 )`);
        expect(res).to.satisfy(isFailure);
    });
    it('ex 1 - program, atomic', () => {
        const res = L4toMermaid(`(L4 1 #t "hello")`);
        const mer = fs.readFileSync('part2/mers/mer4')
            .toString()
            .replace(/\r\n\t/g, "\n");
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 2 - if', () => {
        const res = L4toMermaid(`(define my-list '(1 2))`);
        const mer = fs.readFileSync('part2/mers/mer2')
            .toString()
            .replace(/\r\n\t/g, "\n");
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 3 - proc, app', () => {
        const res = L4toMermaid(`(lambda (x y)
        ((lambda (x) (+ x y))
         (+ x x))
        1)`);
        const mer = fs.readFileSync('part2/mers/mer1')
            .toString()
            .replace(/\r\n\t/g, "\n");
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 4', () => {
        const res = L4toMermaid(`1`);
        const mer = fs.readFileSync('part2/mers/mer3')
            .toString()
            .replace(/\r\n\t/g, "\n");
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
});