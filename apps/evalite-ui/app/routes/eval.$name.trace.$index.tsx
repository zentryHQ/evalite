import { getEvalResult } from "@evalite/core/sdk";
import {
  Link,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";
import { SidebarCloseIcon } from "lucide-react";
import { DisplayInput } from "~/components/display-input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "~/components/ui/sidebar";

const SidebarSection = ({
  title,
  input,
}: {
  title: string;
  input: unknown;
}) => (
  <div className="text-sm">
    <h2 className="font-semibold text-base mb-1">{title}</h2>
    <DisplayInput shouldTruncateText={false} input={input}></DisplayInput>
  </div>
);

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  const result = await getEvalResult({
    name: args.params.name!,
    resultIndex: args.params.index!,
  });

  return {
    result,
  };
};

export default function Page() {
  const { result } = useLoaderData<typeof clientLoader>();

  return (
    <Sidebar
      variant="inset"
      side="right"
      className="sticky hidden top-0 h-svh w-[400px] border-l"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Button size={"icon"} variant="ghost" asChild>
            <Link to={"../../"} preventScrollReset>
              <SidebarCloseIcon className="size-5" />
            </Link>
          </Button>
          <div>
            <span className="text-primary block font-semibold mb-1">Trace</span>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>{result.duration}ms</BreadcrumbItem>
                {/* <Separator orientation="vertical" className="mx-1 h-4" />
              <BreadcrumbItem>Hello</BreadcrumbItem> */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <Separator className="mt-2" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarSection title="Input" input={result.input} />
        <Separator className="my-2" />
        {result.expected ? (
          <>
            <SidebarSection title="Expected" input={result.expected} />
            <Separator className="my-2" />
          </>
        ) : null}
        <SidebarSection title="Output" input={result.result} />
      </SidebarContent>
    </Sidebar>
  );
}
