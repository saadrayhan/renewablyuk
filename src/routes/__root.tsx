import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { DevRoleProvider } from "@/lib/dev-role";
import { MembershipProvider } from "@/lib/membership";
import { DevSwitcher } from "@/components/app/dev-switcher";
import { MockStoreProvider } from "@/lib/mock/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold tracking-tight text-ink">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="press inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Renewably UK — Net Zero operations platform" },
      {
        name: "description",
        content:
          "Operational and compliance platform for UK Net Zero installation companies. IBG, Jobs, Funding Match — built for installers.",
      },
      { name: "author", content: "Renewably UK" },
      { property: "og:title", content: "Renewably UK — Net Zero operations platform" },
      {
        property: "og:description",
        content:
          "Operational and compliance platform for UK Net Zero installation companies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Renewably UK — Net Zero operations platform" },
      { name: "description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { property: "og:description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { name: "twitter:description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f1cbee4e-ca11-437b-bbca-869d13fc943e/id-preview-ab92c4b0--251b1e68-a9f6-47bc-bcc6-89a0809d31dd.lovable.app-1777664739071.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f1cbee4e-ca11-437b-bbca-869d13fc943e/id-preview-ab92c4b0--251b1e68-a9f6-47bc-bcc6-89a0809d31dd.lovable.app-1777664739071.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <DevRoleProvider>
      <MembershipProvider>
        <MockStoreProvider>
          <AuthProvider>
            <Outlet />
            <Toaster />
            <DevSwitcher />
          </AuthProvider>
        </MockStoreProvider>
      </MembershipProvider>
    </DevRoleProvider>
  );
}
