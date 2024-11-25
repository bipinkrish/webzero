import React, { useEffect, useRef } from "react";

export default function CodePreview({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
              </head>
              <body>
                <div id="root"></div>
                <script type="text/babel">
                  ${code}
                </script>
              </body>
            </html>
          `);
        doc.close();
      }
    }
  }, [code]);

  return <iframe ref={previewRef} className="w-full h-full" />;
}
