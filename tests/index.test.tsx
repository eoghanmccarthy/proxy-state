import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/dom";
import { expect, describe, it } from "bun:test";

import { StoreProvider, useStore } from "../src";

// A test component that uses the useStore hook
function TestComponent() {
  const [state, setState] = useStore((state) => state);

  return (
    <div>
      <span data-testid="countValue">{state.count}</span>
      <button onClick={() => setState({ count: state.count + 1 })}>
        Increment
      </button>
    </div>
  );
}

describe("StoreProvider and useStore", () => {
  it("renders with initial state and responds to state changes", () => {
    const initialState = { count: 0 };

    render(
      <StoreProvider initialState={initialState}>
        <TestComponent />
      </StoreProvider>,
    );

    // Check that the initial state is rendered
    const countValue = screen.getByTestId("countValue");
    expect(countValue).toHaveTextContent("0");

    // Simulate a button click to increment the count
    fireEvent.click(screen.getByText("Increment"));

    // Check that the state has been updated
    expect(countValue).toHaveTextContent("1");
  });
});
