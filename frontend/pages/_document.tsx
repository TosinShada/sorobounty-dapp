import Document, { Html, Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document {
  // public static async getInitialProps(
  //   ctx: DocumentContext
  // ): Promise<DocumentInitialProps> {
  //   const initialProps = await Document.getInitialProps(ctx);

  //   return {
  //     ...initialProps,
  //   };
  // }

  public render(): JSX.Element {
    return (
      <Html>
        <Head>
          <meta
            name="description"
            content="An example of loading information from a soroban smart contract"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>{" "}
        <body className="h-full">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
