import { File, Settings, Keyboard, Sparkles, User, LogOut, HelpCircle } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Header() {
  return (
    <header className="h-12 bg-[#0f0f14] border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-foreground">Webster</h1>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors">
            <File className="w-4 h-4" />
            File
          </button>
          <button className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
            Options
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="/logo-maker"
          className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Logo Maker
        </a>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
              <User className="w-4 h-4 text-foreground" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50 mr-4">
              <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Keyboard Shortcuts
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
