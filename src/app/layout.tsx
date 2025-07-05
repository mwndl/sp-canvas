import './globals.css'

export const metadata = {
  title: 'SpotSaver - Spotify Canvas Screensaver',
  description: 'Exiba o Canvas das suas músicas do Spotify em tela cheia como proteção de tela',
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
