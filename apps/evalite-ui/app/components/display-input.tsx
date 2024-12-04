import ReactMarkdown from "react-markdown";

export const DisplayInput = (props: { input: unknown }) => {
  if (typeof props.input === "string") {
    return (
      <ReactMarkdown className="prose prose-sm">{props.input}</ReactMarkdown>
    );
  }

  return JSON.stringify(props.input, null, 2);
};
