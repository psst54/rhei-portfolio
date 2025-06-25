import "./globals.css";
import { cookies } from "next/headers";
import GNBWrapper from "./_components/GNBWrapper";

export { metadata } from "./_utils/meta";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="ko" className={theme === "dark" ? "dark" : ""}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="bg-normal text-normal">
        <GNBWrapper />
        {children}
      </body>
    </html>
  );
}

export const runtime = "edge";
