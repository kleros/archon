.. _metaEvidenceScripts:

.. include:: include_announcement.rst

============================
MetaEvidence Dynamic Scripts
============================

.. warning:: Node.js implementation of the script sandbox is incomplete. dynamic scripts can currently only be evaluated in the browser.

dynamicScriptURI as specified in `ERC 1497 <https://github.com/ethereum/EIPs/issues/1497>`_. allow
for metaEvidence to be changed dynamically.

In order to support asynchronous scripts Archon provides global functions ``resolveScript`` and ``rejectScript``. Please use these
when you are returning the updates to the metaEvidence

Available Global Variables
==========================

When you create a script you can assume that you will have global access to these variables:

1) ``resolveScript`` - ``function``: Call this function to return the result of your script.

2) ``rejectScript`` - ``function``: To throw a handled error in your script you can call scriptRejecter.

3) ``scriptParameters`` - ``object``: These are the parameters you pass as `options["scriptParameters"]` in :ref:`getMetaEvidence <archon.arbitrable.getMetaEvidence>`


-------
Example
-------

.. code-block:: javascript

    /* Script that is hosted at "/ipfs/..."
      "
        function MetaEvideceFetcher () {
          const disputeID = scriptParameters.disputeID

          ... async code to lookup data here ...

          if (data) {
            resolveScript({
              newMetaEvidenceParam: "Look at me!"
            })
          } else {
            rejectScript("Unable to fetch data")
          }
        }

        MetaEvideceFetcher()
      "
    */

    archon.arbitrable.getMetaEvidence(
      '0x91697c78d48e9c83b71727ddd41ccdc95bb2f012',
      1,
      {
        scriptParameters: {
          disputeID: 2
        }
      }
    ).then(data => {
      console.log(data)
    })

    > {
        metaEvidenceValid: true,
        fileValid: true,
        interfaceValid: false,
        dynamicScriptURI: "/ipfs/...",
        metaEvidenceJSON: {
          "fileURI": "/ipfs/...",
          "newMetaEvidenceParam": "Look at me!",
          ...
        },
        submittedAt: 1539025000,
        blockNumber: 6503570,
        transactionHash: "0x340fdc6e32ef24eb14f9ccbd2ec614a8d0c7121e8d53f574529008f468481990"
      }
