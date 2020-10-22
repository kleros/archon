export default {
  "abi": [
  	{
  		"constant": true,
  		"inputs": [],
  		"name": "arbitratorExtraData",
  		"outputs": [
  			{
  				"name": "",
  				"type": "bytes"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"constant": false,
  		"inputs": [
  			{
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"name": "_ruling",
  				"type": "uint256"
  			}
  		],
  		"name": "rule",
  		"outputs": [],
  		"payable": false,
  		"stateMutability": "nonpayable",
  		"type": "function"
  	},
  	{
  		"constant": true,
  		"inputs": [],
  		"name": "arbitrator",
  		"outputs": [
  			{
  				"name": "",
  				"type": "address"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"inputs": [
  			{
  				"name": "_arbitrator",
  				"type": "address"
  			},
  			{
  				"name": "_arbitratorExtraData",
  				"type": "bytes"
  			}
  		],
  		"payable": false,
  		"stateMutability": "nonpayable",
  		"type": "constructor"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_metaEvidenceID",
  				"type": "uint256"
  			},
  			{
  				"indexed": false,
  				"name": "_evidence",
  				"type": "string"
  			}
  		],
  		"name": "MetaEvidence",
  		"type": "event"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_arbitrator",
  				"type": "address"
  			},
  			{
  				"indexed": true,
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"indexed": false,
  				"name": "_metaEvidenceID",
  				"type": "uint256"
  			},
  			{
  				"indexed": false,
  				"name": "_evidenceGroupID",
  				"type": "uint256"
  			}
  		],
  		"name": "Dispute",
  		"type": "event"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_arbitrator",
  				"type": "address"
  			},
  			{
  				"indexed": true,
  				"name": "_evidenceGroupID",
  				"type": "uint256"
  			},
  			{
  				"indexed": true,
  				"name": "_party",
  				"type": "address"
  			},
  			{
  				"indexed": false,
  				"name": "_evidence",
  				"type": "string"
  			}
  		],
  		"name": "Evidence",
  		"type": "event"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_arbitrator",
  				"type": "address"
  			},
  			{
  				"indexed": true,
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"indexed": false,
  				"name": "_ruling",
  				"type": "uint256"
  			}
  		],
  		"name": "Ruling",
  		"type": "event"
  	}
  ]
}
