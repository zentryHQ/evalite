import { Moon, Sun } from "lucide-react";
import type * as React from "react";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/hooks/use-theme";
import { cn } from "~/lib/utils";

interface ThemeSwitchProps {
  className?: string;
}

export function ThemeSwitch({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & ThemeSwitchProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleTheme();
      }}
      size="icon"
      variant="ghost"
      {...props}
    >
      {theme === "light" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
