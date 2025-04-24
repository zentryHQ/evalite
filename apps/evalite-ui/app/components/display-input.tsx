import React, { useState, useRef, useLayoutEffect, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { ChevronDown, DownloadIcon } from "lucide-react";
import { JSONTree } from "react-json-tree";
import remarkGfm from "remark-gfm";
import { downloadFile, serveFile } from "evalite/sdk";
import type { Evalite } from "evalite/types";
import { isEvaliteFile } from "evalite/utils";

const MAX_HEIGHT = 240;

type DisplayStatus =
  | "no-show-more-button-required"
  | "showing-show-more-button"
  | "showing-more";

const DisplayText = ({
  input,
  shouldTruncateText,
  Wrapper,
  className,
}: {
  input: string;
  className?: string;
  Wrapper: React.ElementType<{ children: React.ReactNode }>;
  shouldTruncateText: boolean;
}) => {
  const [status, setStatus] = useState<DisplayStatus>(
    "no-show-more-button-required"
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current && shouldTruncateText) {
      if (contentRef.current.scrollHeight > MAX_HEIGHT) {
        setStatus("showing-show-more-button");
      }
    }
  }, [input, shouldTruncateText]);

  return (
    <div className={className}>
      <Wrapper>
        <div
          ref={contentRef}
          style={{
            maxHeight:
              status === "showing-show-more-button" && shouldTruncateText
                ? `${MAX_HEIGHT}px`
                : "none",
            overflow: "hidden",
          }}
        >
          <ReactMarkdown className="prose prose-sm" remarkPlugins={[remarkGfm]}>
            {input}
          </ReactMarkdown>
        </div>
      </Wrapper>
      {status === "showing-show-more-button" && shouldTruncateText && (
        <Button
          onClick={() => {
            setStatus("showing-more");
          }}
          variant="secondary"
          size="sm"
          className="mt-3 mb-5"
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
      shouldExpandNodeInitially={(_, __, level) => level < 4}
      theme={{
        scheme: "grayscale",
        base00: "transparent",
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

export const DisplayEvaliteFile = ({ file }: { file: Evalite.File }) => {
  const extension = file.path.split(".").pop()!;

  // Images
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(extension)) {
    return (
      <img src={serveFile(file.path)} alt="Evalite file" className="max-h-32" />
    );
  }

  // Videos
  if (["mp4", "webm", "ogg"].includes(extension)) {
    return (
      <video controls>
        <source src={serveFile(file.path)} type={`video/${extension}`} />
      </video>
    );
  }

  // Audio
  if (["mp3", "wav", "ogg"].includes(extension)) {
    return (
      <audio controls>
        <source src={serveFile(file.path)} type={`audio/${extension}`} />
      </audio>
    );
  }

  return (
    <Button asChild className="uppercase" variant={"secondary"} size={"sm"}>
      <a href={downloadFile(file.path)}>
        <DownloadIcon className="size-4" />
        <span>.{extension}</span>
      </a>
    </Button>
  );
};

export const DisplayInput = (props: {
  input: unknown;
  shouldTruncateText: boolean;
  className?: string;
  Wrapper?: React.FC<{ children: React.ReactNode; className?: string }>;
}) => {
  const Wrapper = props.Wrapper || Fragment;
  if (typeof props.input === "string" || typeof props.input === "number") {
    return (
      <DisplayText
        Wrapper={Wrapper}
        input={props.input.toString()}
        className={props.className}
        shouldTruncateText={props.shouldTruncateText}
      />
    );
  }

  if (isEvaliteFile(props.input)) {
    return (
      <Wrapper className={props.className}>
        <DisplayEvaliteFile file={props.input} />
      </Wrapper>
    );
  }

  if (typeof props.input === "object" && props.input !== null) {
    return (
      <Wrapper className={props.className}>
        <DisplayJSON input={props.input} />
      </Wrapper>
    );
  }

  return (
    <Wrapper className={props.className}>
      <pre>{JSON.stringify(props.input, null, 2)}</pre>
    </Wrapper>
  );
};
