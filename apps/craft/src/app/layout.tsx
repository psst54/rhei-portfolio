import "./globals.css";
import GNBWrapper from "./_components/GNBWrapper";

export { metadata } from "./_utils/meta";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="bg-normal text-normal">
        {/* bg gradient */}
        <div className="fixed inset-0 z-[-1] opacity-[0.2] blur-[min(100px,10dvw)]">
          <div className="absolute -top-4 -right-8 h-[50dvh] w-[80dvw] rounded-[100%] bg-orange-200 dark:bg-blue-600">
            <div className="bg-normal h-[30dvh] w-[50dvw] rounded-[100%]" />
          </div>
          <div className="absolute top-[30dvh] h-[80dvh] w-[70dvw] rounded-[100%] bg-orange-100 dark:bg-blue-700">
            <div className="bg-normal absolute right-0 bottom-0 h-[50dvh] w-[50dvw] rounded-[100%]" />
          </div>
        </div>

        <GNBWrapper />
        {children}
      </body>
    </html>
  );
}

export const runtime = "edge";
