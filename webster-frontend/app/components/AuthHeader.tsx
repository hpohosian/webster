import { File, Settings, Keyboard, Sparkles, User, LogOut, HelpCircle } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

type SessionUser = { id: string; email?: string };


export function AuthHeader() {
  const route = useLocation();
  const navigate = useNavigate();
  const isLoginPage = route.pathname === "/login";

  // Fetch session user
  const [user, setUser] = useState<{ data: SessionUser | null; isLogged: boolean }>({
    data: null,
    isLogged: false,
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.user?.id) {
          setUser({ data: data.user, isLogged: true });
        } else {
          setUser({ data: null, isLogged: false });
        }
      } catch {
        setUser({ data: null, isLogged: false });
      }
    }
    fetchUser();
  }, []);

  return (
    <header className="h-12 bg-[#0f0f14] border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-lg font-semibold text-foreground">Amethist studio</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/logo-maker"
          className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Logo Maker
        </Link>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
              <User className="w-4 h-4 text-foreground" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50 mr-4">
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
              
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {isLoginPage ? (
           <Link to="/register" className="header-link">Register</Link>
          ) : (
            <Link to="/login" className="header-link">Login</Link>
          )}
      </div>
    </header>
  );
}
