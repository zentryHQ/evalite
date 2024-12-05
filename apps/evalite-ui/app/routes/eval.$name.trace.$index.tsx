import { getEvalResult } from "@evalite/core/sdk";
import { useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";
import { PlusIcon } from "lucide-react";
import { SidebarRight } from "~/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

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
      <SidebarHeader className="">
        <div>
          <span className="text-sm text-primary block font-semibold">
            Trace
          </span>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>Hello</BreadcrumbItem>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <BreadcrumbItem>Hello</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <PlusIcon />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
