/// <reference lib="dom" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, describe, it } from "bun:test";

import { proxy, useProxy, useSnapshot } from "../src";

const countProxy = proxy({ count: 0 });

const CounterButton = ({ testId }: { testId: string }) => {
  const count = useProxy(countProxy);

  return (
    <button data-testid={testId} onClick={() => ++count.count}>
      {count.count}
    </button>
  );
};

describe("CounterButton useProxy interaction", () => {
  it("increments count on click", () => {
    render(
      <div>
        <CounterButton testId="btn1" />
        <CounterButton testId="btn2" />
      </div>,
    );

    const button1 = screen.getByTestId("btn1");
    const button2 = screen.getByTestId("btn2");

    // Initial state check
    expect(button1.textContent).toEqual("0");
    expect(button2.textContent).toEqual("0");

    // Simulate click and check updated state
    fireEvent.click(button1);
    expect(button1.textContent).toEqual("1");
    expect(button2.textContent).toEqual("1");

    // Simulate click and check updated state
    fireEvent.click(button2);
    expect(button1.textContent).toEqual("2");
    expect(button2.textContent).toEqual("2");
  });
});
