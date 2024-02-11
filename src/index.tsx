import React, { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext();

// Proxy handler to manage state interactions
const proxyHandler = {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    target.listeners.forEach((listener) => listener(target));
    return true; // Indicates success
  },
};

// Function to create a new store
function createStore(initialState) {
  const store = {
    state: initialState,
    listeners: new Set(),
    setState(newState) {
      for (const key in newState) {
        if (newState.hasOwnProperty(key)) {
          store.state[key] = newState[key];
        }
      }
    },
    subscribe(listener) {
      store.listeners.add(listener);
      return () => store.listeners.delete(listener);
    },
  };

  return new Proxy(store, proxyHandler);
}

// Provider component that sets up the store and provides it to the rest of the app
export const StoreProvider = ({ children, initialState }) => {
  const store = createStore(initialState);
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

// Custom hook to use the store in components
function useStore(selector) {
  const store = useContext(StoreContext);
  const [selectedState, setSelectedState] = useState(() =>
    selector(store.state),
  );

  useEffect(() => {
    const listener = (newState) => {
      const newSelectedState = selector(newState);
      setSelectedState(newSelectedState);
    };
    store.subscribe(listener);
    return () => store.unsubscribe(listener);
  }, [store, selector]);

  return [selectedState, store.setState];
}
