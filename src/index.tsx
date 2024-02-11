import React from "react";
import Emitter from "events";
const EventEmitter = new Emitter();

EventEmitter.setMaxListeners(Number.MAX_SAFE_INTEGER);

const proxyHandler = {
  set: function (obj, prop, value) {
    console.log(`I'm setting ${prop} to - `, value);
    // obj[prop] = value;
    // EventEmitter.emit("stateChange", { prop, value });
    // return true;
    const result = Reflect.set(obj, prop, value);
    EventEmitter.emit("stateChange", { prop, value });
    // Additional logic (like emitting an event)
    return true;
  },
  get(target, prop) {
    return Reflect.get(target, prop);
  },
};

export const createStore = (initObj) => {
  console.log("Creating store with initial state - ", initObj);

  const store = new Proxy(initObj, proxyHandler);

  const subscribe = (callback) => {
    EventEmitter.on("stateChange", callback);
    return () => EventEmitter.removeListener("stateChange", callback);
  };

  return { store, subscribe };
};

const { store, subscribe } = createStore({ count: 0 });
export { store, subscribe };

export const useStoreState = (selector) => {
  // Initialize local state with the value from the store using the selector
  const [state, setState] = React.useState(selector(store));

  React.useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = subscribe(({ prop, value }) => {
      // Use the selector to determine if the change is relevant for this hook
      const selectedValue = selector({ [prop]: value });
      // Update local state if the selected part of the store has changed
      if (selectedValue !== state) {
        setState(selectedValue);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [state, selector]);

  return state;
};
