import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MessageList } from "./MessageList";

vi.mock("./MarkdownMessage", () => ({ MarkdownMessage: ({ content }) => <p>{content}</p> }));

const accent = { solid: "", softBg: "", softText: "" };
const t = (key) => key;
const messages = [
  { id: "a", role: "user", content: "hi", status: "sent" },
  { id: "b", role: "bot", content: "hello", status: "sent" },
];

let resize;
let intersect;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    constructor(callback) {
      resize = callback;
    }
    observe() {}
    disconnect() {}
  };
  globalThis.IntersectionObserver = class {
    constructor(callback) {
      intersect = callback;
    }
    observe() {}
    disconnect() {}
  };
});

afterEach(() => {
  delete globalThis.ResizeObserver;
  delete globalThis.IntersectionObserver;
});

describe("MessageList", () => {
  it("jumps to the end of a restored chat without animating", () => {
    render(<MessageList messages={messages} accent={accent} t={t} />);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "end" });
  });

  it("stays pinned to the end when content grows while the reader is there", () => {
    render(<MessageList messages={messages} accent={accent} t={t} />);
    vi.mocked(Element.prototype.scrollIntoView).mockClear();

    intersect([{ isIntersecting: true }]);
    resize();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledOnce();
  });

  it("leaves the scroll alone once the reader has scrolled up", () => {
    render(<MessageList messages={messages} accent={accent} t={t} />);
    vi.mocked(Element.prototype.scrollIntoView).mockClear();

    intersect([{ isIntersecting: false }]);
    resize();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
