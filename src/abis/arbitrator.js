export default {
  "abi": [
  	{
  		"constant": true,
  		"inputs": [
  			{
  				"name": "_disputeID",
  				"type": "uint256"
  			}
  		],
  		"name": "disputeStatus",
  		"outputs": [
  			{
  				"name": "status",
  				"type": "uint8"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"constant": true,
  		"inputs": [
  			{
  				"name": "_disputeID",
  				"type": "uint256"
  			}
  		],
  		"name": "currentRuling",
  		"outputs": [
  			{
  				"name": "ruling",
  				"type": "uint256"
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
  				"name": "_extraData",
  				"type": "bytes"
  			}
  		],
  		"name": "appeal",
  		"outputs": [],
  		"payable": true,
  		"stateMutability": "payable",
  		"type": "function"
  	},
  	{
  		"constant": true,
  		"inputs": [
  			{
  				"name": "_disputeID",
  				"type": "uint256"
  			}
  		],
  		"name": "appealPeriod",
  		"outputs": [
  			{
  				"name": "start",
  				"type": "uint256"
  			},
  			{
  				"name": "end",
  				"type": "uint256"
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
  				"name": "_choices",
  				"type": "uint256"
  			},
  			{
  				"name": "_extraData",
  				"type": "bytes"
  			}
  		],
  		"name": "createDispute",
  		"outputs": [
  			{
  				"name": "disputeID",
  				"type": "uint256"
  			}
  		],
  		"payable": true,
  		"stateMutability": "payable",
  		"type": "function"
  	},
  	{
  		"constant": true,
  		"inputs": [
  			{
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"name": "_extraData",
  				"type": "bytes"
  			}
  		],
  		"name": "appealCost",
  		"outputs": [
  			{
  				"name": "fee",
  				"type": "uint256"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"constant": true,
  		"inputs": [
  			{
  				"name": "_extraData",
  				"type": "bytes"
  			}
  		],
  		"name": "arbitrationCost",
  		"outputs": [
  			{
  				"name": "fee",
  				"type": "uint256"
  			}
  		],
  		"payable": false,
  		"stateMutability": "view",
  		"type": "function"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"indexed": true,
  				"name": "_arbitrable",
  				"type": "address"
  			}
  		],
  		"name": "DisputeCreation",
  		"type": "event"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"indexed": true,
  				"name": "_arbitrable",
  				"type": "address"
  			}
  		],
  		"name": "AppealPossible",
  		"type": "event"
  	},
  	{
  		"anonymous": false,
  		"inputs": [
  			{
  				"indexed": true,
  				"name": "_disputeID",
  				"type": "uint256"
  			},
  			{
  				"indexed": true,
  				"name": "_arbitrable",
  				"type": "address"
  			}
  		],
  		"name": "AppealDecision",
  		"type": "event"
  	}
  ]
}
