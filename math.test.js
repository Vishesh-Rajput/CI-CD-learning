// math.test.js
import test from 'node:test';
import assert from 'node:assert';
import { add, multiply } from './math.js';   

test('adds 2 + 3 to equal 5', () => {
    assert.strictEqual(add(2, 3), 5);
});

test('multiplies 3 * 4 to equal 12', () => {
    assert.strictEqual(multiply(3, 4), 12);
});