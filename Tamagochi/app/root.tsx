import "./app.css";
import type { LinksFunction } from "react-router";
import { Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "~/components/ui/tooltip";
import { Toaster } from "~/components/ui/sonner";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Press+Start+2P&display=swap",
  },
];

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              fontFamily: '"Press Start 2P", cursive',
              fontSize: "10px",
              padding: "12px",
              border: "3px solid hsl(var(--border))",
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.25)",
            },
          }}
        />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  );
}