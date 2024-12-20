import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Leap Elements Stylesheet */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/@leapwallet/elements@latest/dist/umd/style.css"
        />
        {/* Leap Elements Script */}
        <script
          defer
          src="https://unpkg.com/@leapwallet/elements@latest/dist/umd/main.js"
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}