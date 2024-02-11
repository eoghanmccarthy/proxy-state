import { expect, test, beforeEach, afterEach } from "bun:test";

let originalConsoleLog;
let consoleOutput = [];
const mockedLog = output => consoleOutput.push(output);

beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = mockedLog;
    consoleOutput = [];

    const target = {
        v: 'hello',
    };

    const proxyTarget = new Proxy(target, {
        set: (target, property, value) => {
            console.log(`${property} is now ${value}`);
            target[property] = value;
            return true; // Indicates that the property was successfully set
        },
    });

    globalThis.proxyTarget = proxyTarget; // Make proxyTarget globally available for the test
});

afterEach(() => {
    console.log = originalConsoleLog; // Restore the original console.log function
});

test('Proxy target tests', () => {
    proxyTarget.v = 'world!';
    expect(consoleOutput).toContain('v is now world!');
    expect(proxyTarget.v).toBe('world!');
});
