import AppShell from "../components/AppShell";

export const metadata = {
  title: "PLOZEN Ops Console",
  description: "PLOZEN Ops Console 시스템 관리자 Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="data:," />
        <link rel="stylesheet" href="/assets/app.css" />
        <link rel="stylesheet" href="/assets/services.css" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
