/// <reference lib="dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/dom";
import { expect, describe, it } from "bun:test";

import { useStoreState, store } from "../src";

const ComponentA = () => {
  const count = useStoreState((store) => store.count);

  return (
    <div>
      <span data-testid="countValue">{count}</span>
      <button onClick={() => (store.count += 1)}>Add</button>
    </div>
  );
};

describe("StoreProvider and useStores", () => {
  it("renders with initial state and responds to state changes", () => {
    render(
      <div>
        <ComponentA />
      </div>,
    );

    //Check that the initial state is rendered
    expect(screen.getByTestId("countValue").textContent).toEqual("0");

    // Simulate a button click to increment the count
    fireEvent.click(screen.getByText("Add"));

    // Check that the state has been updated
    expect(screen.getByTestId("countValue").textContent).toEqual("1");
  });
});
