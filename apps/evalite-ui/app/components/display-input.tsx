import { useState, useRef, useLayoutEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

const MAX_HEIGHT = 240;

type DisplayStatus =
  | "no-show-more-button-required"
  | "showing-show-more-button"
  | "showing-more";

export const DisplayInput = (props: { input: unknown }) => {
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
  }, [props.input]);

  if (typeof props.input === "string") {
    return (
      <div>
        <div
          ref={contentRef}
          style={{
            maxHeight: status === "showing-more" ? "none" : `${MAX_HEIGHT}px`,
            overflow: "hidden",
          }}
        >
          <ReactMarkdown className="prose prose-sm">
            {props.input}
          </ReactMarkdown>
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
  }

  return JSON.stringify(props.input, null, 2);
};
