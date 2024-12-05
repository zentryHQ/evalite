import { useState, useRef, useLayoutEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { JSONTree } from "react-json-tree";

const MAX_HEIGHT = 240;

type DisplayStatus =
  | "no-show-more-button-required"
  | "showing-show-more-button"
  | "showing-more";

const DisplayText = ({ input }: { input: string }) => {
  const [status, setStatus] = useState<DisplayStatus>(
    "no-show-more-button-required"
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > MAX_HEIGHT) {
        setStatus("showing-show-more-button");
      }
    }
  }, [input]);

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: status === "showing-more" ? "none" : `${MAX_HEIGHT}px`,
          overflow: "hidden",
        }}
      >
        <ReactMarkdown className="prose prose-sm">{input}</ReactMarkdown>
      </div>
      {status === "showing-show-more-button" && (
        <Button
          onClick={() => setStatus("showing-more")}
          variant="secondary"
          size="sm"
          className="mt-3"
        >
          <ChevronDown />
          Show more
        </Button>
      )}
    </div>
  );
};

const DisplayJSON = ({ input }: { input: object }) => {
  return (
    <JSONTree
      data={input}
      invertTheme
      hideRoot
      theme={{
        scheme: "grayscale",
        base00: "#101010",
        base01: "#252525",
        base02: "#464646",
        base03: "#525252",
        base04: "#ababab",
        base05: "#b9b9b9",
        base06: "#e3e3e3",
        base07: "#f7f7f7",
        base08: "#7c7c7c",
        base09: "#999999",
        base0A: "#a0a0a0",
        base0B: "#8e8e8e",
        base0C: "#868686",
        base0D: "#686868",
        base0E: "#747474",
        base0F: "#5e5e5e",
      }}
    />
  );
};

export const DisplayInput = (props: { input: unknown }) => {
  if (typeof props.input === "string") {
    return <DisplayText input={props.input} />;
  }

  if (typeof props.input === "object" && props.input !== null) {
    return <DisplayJSON input={props.input} />;
  }

  return JSON.stringify(props.input, null, 2);
};
