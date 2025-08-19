// app/layout.js
export const metadata = {
  title: 'caught.wiki',
  description: 'Post and download dossiers on anyone. Unmoderated. No liability.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f4f6f8',
        color: '#111',
        minHeight: '100vh',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
