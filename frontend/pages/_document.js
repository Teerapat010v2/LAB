import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="th">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3498db" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
