import "react-native-get-random-values";
import { Buffer } from "buffer";
import "text-encoding-polyfill";
import "react-native-url-polyfill/auto";

type NodeEnv = "development" | "production" | "test";

declare const global: typeof globalThis & {
  Buffer: any;
  process: any;
  ReadableStream: any;
};

interface ProcessEnv {
  NODE_ENV: NodeEnv;
  [key: string]: string | undefined;
}

interface Process {
  env: ProcessEnv;
}

type GlobalType = {
  Buffer: typeof Buffer;
  process: Process;
  ReadableStream: typeof globalThis.ReadableStream;
};

const globalWithPolyfills = global as unknown as GlobalType;

if (typeof globalWithPolyfills.Buffer === "undefined") {
  globalWithPolyfills.Buffer = Buffer;
}

if (typeof globalWithPolyfills.process === "undefined") {
  const nodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";
  globalWithPolyfills.process = {
    env: {
      NODE_ENV: nodeEnv,
      ...Object.fromEntries(
        Object.entries(process.env).filter(([key]) => key !== "NODE_ENV"),
      ),
    },
  } as Process;
}

if (typeof globalWithPolyfills.ReadableStream === "undefined") {
  try {
    const { ReadableStream } = require("web-streams-polyfill/ponyfill/es2018");
    globalWithPolyfills.ReadableStream = ReadableStream;
  } catch (error) {
    console.warn(
      "web-streams-polyfill not available, some features might not work",
    );
  }
}

export {};
