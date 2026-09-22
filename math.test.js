// math.test.js
const test = require('node:test');
const assert = require('node:assert');
const { add, multiply } = require('./math');

test('adds 2 + 3 to equal 5', () => {
    assert.strictEqual(add(2, 3), 5);
});

test('multiplies 3 * 4 to equal 12', () => {
    assert.strictEqual(multiply(3, 4), 12);
});