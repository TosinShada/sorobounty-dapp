import TeamSwitcher from "./team-switcher";
import { Search } from "lucide-react";
import { UserNav } from "./user-nav";
import { NavigationBar } from "./navigation-bar";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="border-b">
      <div className="mx-auto max-w-7xl flex h-16 items-center px-4">
        <NavigationBar />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
}
