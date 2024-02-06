import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        {process.env.APP_ENV == 'production' &&
          (
            <>
              <script async src="https://www.googletagmanager.com/gtag/js?id=G-NE6PCSKN7W"></script>
              <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date())
                gtag('config', 'G-NE6PCSKN7W');
              </script>
            </>
          )
        }
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
