import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

export const InnerPageLayout = ({
  children,
  title,
  filepath,
  vscodeUrl,
}: {
  title: string;
  vscodeUrl: string;
  filepath: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col bg-background relative flex-1 min-h-svh max-w-7xl">
      <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background z-10">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <BreadcrumbItem>
                <BreadcrumbLink className="line-clamp-1" asChild>
                  <a href={vscodeUrl}>{filepath}</a>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </div>
  );
};
