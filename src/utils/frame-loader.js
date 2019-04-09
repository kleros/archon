import iframe from 'iframe'

const fetchDataFromScript = async (scriptString, scriptParameters) => {
  // Only works in the browser atm
  if (!window) return {}
  let resolver
  let rejecter
  const returnPromise = new Promise((resolve, reject) => {
    resolver = resolve
    rejecter = reject
  })

  window.onmessage = (message) => {
    if (message.data.target === 'script') {
      resolver(message.data.result)
    }
  }

  // scriptString = 'setTimeout(() => {resolver({"test": "ok"})}, 1000)'
  const frameBody = `<script type='text/javascript'>
    const scriptParameters = ${JSON.stringify(scriptParameters)}
    let resolveScript
    let rejectScript
    const returnPromise = new Promise((resolve, reject) => {
      resolveScript = resolve
      rejectScript = reject
    })

    const evaluator = () => {
      ${scriptString}
    }
    evaluator()

    returnPromise.then(result => {window.parent.postMessage(
      {
        target: 'script',
        result
      },
      '*'
    )})
  </script>`

  const frame = iframe({body: frameBody, sandboxAttributes: ['allow-same-origin', 'allow-scripts']})
  return returnPromise
}

export default fetchDataFromScript
