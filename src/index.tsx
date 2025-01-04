import { useEffect, useLayoutEffect, useState } from "react";

const proxyStateMap = new WeakMap<
  object,
  {
    target: object;
    listeners: Set<() => void>;
  }
>();

export function proxy<T extends object>(initialObject: T): T {
  // Ensure we're working with a valid object
  if (!initialObject || typeof initialObject !== "object") {
    throw new Error("Proxy requires an object");
  }

  // Don't create duplicate proxies
  if (proxyStateMap.has(initialObject)) {
    return initialObject as T;
  }

  // Create a new Set to store listener callbacks
  // These listeners will be called whenever the proxy state changes
  const listeners = new Set<() => void>();

  const state = new Proxy(initialObject, {
    set(target, prop, value) {
      const result = Reflect.set(target, prop, value);
      listeners.forEach((listener) => listener());
      return result;
    },
    // Add deleteProperty to handle property deletions
    deleteProperty(target, prop) {
      const result = Reflect.deleteProperty(target, prop);
      if (result) listeners.forEach((listener) => listener());
      return result;
    },
  });

  proxyStateMap.set(state, {
    target: initialObject,
    listeners,
  });

  return state;
}

export const useProxy = <T extends object>(proxyObject: T): T => {
  // Validate input
  if (!proxyObject || !proxyStateMap.has(proxyObject)) {
    throw new Error("useProxy requires a proxy object");
  }

  const [snapshot, setSnapshot] = useState<T>(proxyObject);

  let isRendering = true;
  useLayoutEffect(() => {
    isRendering = false;
  });

  useEffect(() => {
    const proxyState = proxyStateMap.get(proxyObject);
    if (!proxyState) return;

    // Create a listener that updates the local snapshot
    // when proxy state changes
    const listener = () => {
      setSnapshot({ ...proxyObject });
    };

    // Register this component's listener
    proxyState.listeners.add(listener);

    // Cleanup function to remove listener when component unmounts
    return () => {
      proxyState.listeners.delete(listener);
    };
  }, [proxyObject]);

  return new Proxy(proxyObject, {
    get(target, prop) {
      // During render phase, read from snapshot to ensure consistency
      // Otherwise, read from live target
      return isRendering ? snapshot[prop as keyof T] : target[prop as keyof T];
    },
  });
};
