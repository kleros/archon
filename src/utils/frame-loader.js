import iframe from "iframe";

export default function fetchDataFromScript(scriptString, scriptParameters) {
  return typeof window !== "undefined"
    ? fetchDataFromScriptIframe(scriptString, scriptParameters)
    : fetchDataFromScriptSandbox(scriptString, scriptParameters);
}

const fetchDataFromScriptSandbox =
  process.env.NODE_ENV !== "production"
    ? async (scriptString, scriptParameters) => {
        const { default: Sandbox } = await import("v8-sandbox");
        const sandbox = new Sandbox();

        const code = `
          ${scriptString}

          let resolveScript
          let rejectScript
          let scriptParameters = JSON.parse(stringifiedScriptParameters)

          const returnPromise = new Promise((resolve, reject) => {
            resolveScript = resolve
            rejectScript = reject
          })

          getMetaEvidence()

          returnPromise.then((metaEvidence) => {
            setResult({ value: metaEvidence })
          }).catch((err) => {
            setResult({ error: err })
          })`;

        const { error, value } = await sandbox.execute({
          code,
          globals: {
            stringifiedScriptParameters: JSON.stringify(scriptParameters || {}),
          },
          timeout: 5000,
        });

        await sandbox.shutdown();

        if (error) {
          throw error;
        }

        return value;
      }
    : async () => ({});

const fetchDataFromScriptIframe = async (scriptString, scriptParameters) => {
  let resolver;
  const returnPromise = new Promise((resolve) => {
    resolver = resolve;
  });

  window.onmessage = (message) => {
    if (message.data.target === "script") {
      resolver(message.data.result);
    }
  };

  const frameBody = `<script type='text/javascript'>
    const scriptParameters = ${JSON.stringify(scriptParameters)}
    let resolveScript
    let rejectScript
    const returnPromise = new Promise((resolve, reject) => {
      resolveScript = resolve
      rejectScript = reject
    })

    returnPromise.then(result => {window.parent.postMessage(
      {
        target: 'script',
        result
      },
      '*'
    )})

    ${scriptString}
    getMetaEvidence()
  </script>`;

  const _ = iframe({
    body: frameBody,
    sandboxAttributes: ["allow-same-origin", "allow-scripts"],
  });
  _.iframe.style.display = "none";
  return returnPromise;
};
