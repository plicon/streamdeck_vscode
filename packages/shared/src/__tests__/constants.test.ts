import { describe, it, expect } from "vitest";
import { DEFAULT_HOST, DEFAULT_PORT, SESSION_HEADER } from "../constants";

describe("constants", () => {
  it("has correct default host", () => {
    expect(DEFAULT_HOST).toBe("127.0.0.1");
  });

  it("has correct default port", () => {
    expect(DEFAULT_PORT).toBe(48969);
  });

  it("has correct session header name", () => {
    expect(SESSION_HEADER).toBe("X-VSSessionID");
  });
});
