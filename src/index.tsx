import React, { useEffect, useState } from "react";
import Emitter from "events";
import { v4 as uuidv4 } from "uuid";

const EventEmitter = new Emitter();

EventEmitter.setMaxListeners(Number.MAX_SAFE_INTEGER);

const privateKey = "__PROXY__";

const generateUniqueEventName = () => {
  return `proxyEvent_${uuidv4()}`;
};

type ProxyState = Record<string, any>;

function invariant(key: string | symbol, action: string) {
  if (key === privateKey) {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}

export const proxy = (initialObject: Record<string, any>): ProxyState => {
  const eventName = generateUniqueEventName();

  const state = new Proxy(
    { ...initialObject, [privateKey]: eventName },
    {
      defineProperty(target, prop, descriptor) {
        invariant(prop, "define");
        return Reflect.defineProperty(target, prop, descriptor);
      },
      set(target, prop, value) {
        invariant(prop, "set");
        const result = Reflect.set(target, prop, value);
        EventEmitter.emit(eventName, state);
        return result;
      },
    },
  );

  return state;
};

export const useSnapshot = (proxyObject: ProxyState) => {
  const [snapshot, setSnapshot] = useState(proxyObject);

  useEffect(() => {
    const handler = (newState: ProxyState) => {
      setSnapshot({ ...newState });
    };

    EventEmitter.on(proxyObject[privateKey], handler);

    return () => {
      EventEmitter.off(proxyObject[privateKey], handler);
    };
  }, [proxyObject]); // Re-subscribe only if the state object changes

  return snapshot;
};

export const useProxy = (proxyObject: ProxyState) => {
  const snap = useSnapshot(proxyObject);

  return proxyObject;
};
