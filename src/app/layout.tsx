import Navbar from '@/components/Navbar'
import "../styles/globals.css";
import { WorkOrderProvider } from '@/context/WorkOrderContext';


export const metadata = {
  title: 'Heatwave App',
  description: 'Internal Team Utility',
  icons: {
    icon: '/logos/heat-sun.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <WorkOrderProvider>
        <Navbar />
        {<main className="p-4">{children}</main>}
        </WorkOrderProvider>
      </body>
    </html>
  )
}