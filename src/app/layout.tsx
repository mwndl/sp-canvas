import './globals.css'

export const metadata = {
  title: 'SpCanvas - Spotify Visual Experience',
  description: 'A comprehensive visual companion for Spotify with Canvas videos, synchronized lyrics, and beautiful screensavers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
