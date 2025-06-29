import "../styles/globals.css";
import ClientLayout from "@/components/ClientLayout";
import Navbar from "../components/Navbar";
import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          <Navbar />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
