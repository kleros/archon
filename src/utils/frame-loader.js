import iframe from 'iframe'

const fetchDataFromScript = async (scriptString, scriptParameters) => {
  // Only works in the browser atm
  if (!window) return {}
  let resolver
  const returnPromise = new Promise(resolve => {
    resolver = resolve
  })

  window.onmessage = message => {
    if (message.data.target === 'script') {
      resolver(message.data.result)
    }
  }

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
  </script>`

  const _ = iframe({
    body: frameBody,
    sandboxAttributes: ['allow-same-origin', 'allow-scripts']
  })
  _.iframe.style.display = 'none'
  return returnPromise
}

export default fetchDataFromScript
