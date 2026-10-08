import type { Metadata } from "next";
import { WorkspaceProvider } from "@/components/workspace-provider";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Nexalis Workspace", template: "%s | Nexalis Workspace" },
  description:
    "Nexalis International Oil & Gas — UAE. Project and task management workspace.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <WorkspaceProvider
          mode={
            process.env.NEXT_PUBLIC_DATA_MODE ??
            (process.env.NODE_ENV === "production" ? "unconfigured" : "demo")
          }
        >
          {children}
        </WorkspaceProvider>
      </body>
    </html>
  );
}
