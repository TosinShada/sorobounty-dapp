import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class CustomDocument extends Document {
  public render(): JSX.Element {
    return (
      <Html>
        <Head>
          <meta
            name="description"
            content="An example Soroban Naming Service dApp built with Next.js and Shadcn."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>{' '}
        <body className="h-full">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
