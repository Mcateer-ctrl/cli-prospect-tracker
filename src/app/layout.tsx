
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/sidebar';
import { Toaster } from "@/components/ui/toaster"
import { ProspectsProvider } from '@/lib/hooks/use-prospects';

export const metadata: Metadata = {
  title: 'Prospect Pipeline',
  description: 'A tool to track and manage client prospects.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Prospect Pipeline</title>
        <meta name="description" content="A tool to track and manage client prospects." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ProspectsProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <SidebarInset className="flex-1">
                {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ProspectsProvider>
        <Toaster />
      </body>
    </html>
  );
}
