import type { AppProps } from "next/app";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </ErrorBoundary>
  );
}