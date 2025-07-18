import './globals.css'

export const metadata = {
  title: 'Glass Slipper - AI-Powered ABM Platform',
  description: 'Transform your LinkedIn connections into strategic business relationships',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}