/// <reference lib="dom" />
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { expect, describe, it, beforeEach } from "bun:test";
import { proxy, useProxy } from "../src";

// Test store with multiple values
const store = proxy({
  count: 0,
});

// Components for testing
const Counter = ({ testId }: { testId: string }) => {
  const state = useProxy(store);
  return (
    <button data-testid={testId} onClick={() => ++state.count}>
      Count: {state.count}
    </button>
  );
};

describe("Proxy State Management", () => {
  beforeEach(() => {
    // Reset store before each test
    store.count = 0;
  });

  describe("Basic State Updates", () => {
    it("updates count across multiple components", () => {
      render(
        <div>
          <Counter testId="counter1" />
          <Counter testId="counter2" />
        </div>,
      );

      const button1 = screen.getByTestId("counter1");
      const button2 = screen.getByTestId("counter2");

      expect(button1.textContent).toBe("Count: 0");
      expect(button2.textContent).toBe("Count: 0");

      fireEvent.click(button1);
      expect(button1.textContent).toBe("Count: 1");
      expect(button2.textContent).toBe("Count: 1");
    });
  });
});
