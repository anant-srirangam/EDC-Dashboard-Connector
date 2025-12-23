import './globals.css';
import ClientRoot from '@/components/LayoutClient';
import Head from "next/head";

export const metadata = {
    title: "EDC Data Dashboard",
    icons: {icon: "/favicon.ico"},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="flex flex-col h-screen overflow-hidden">
        <ClientRoot>{children}</ClientRoot>
        </body>
        </html>
    );
}