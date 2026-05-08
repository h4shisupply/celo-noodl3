export const loyaltyAbi = [
  {
    "inputs": [],
    "name": "ClaimAlreadyConsumed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ClaimNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DynamicStampExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DynamicStampUsed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProfile",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProgramConfig",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRequest",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSignature",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotEnoughStamps",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotProgramOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProgramInactive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ProgramNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint40",
        "name": "nextAvailableAt",
        "type": "uint40"
      }
    ],
    "name": "StaticStampCooldown",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "StaticStampDisabled",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "displayName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "avatarUrl",
        "type": "string"
      }
    ],
    "name": "ProfileUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "iconUrl",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "rewardDescription",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "stampsRequired",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "staticStampEnabled",
        "type": "bool"
      }
    ],
    "name": "ProgramCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "iconUrl",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "rewardDescription",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "stampsRequired",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "staticStampEnabled",
        "type": "bool"
      }
    ],
    "name": "ProgramUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "burnedStamps",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "rewardDescription",
        "type": "string"
      }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "RewardConsumed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "source",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "totalStamps",
        "type": "uint32"
      }
    ],
    "name": "StampIssued",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "STATIC_STAMP_COOLDOWN",
    "outputs": [
      {
        "internalType": "uint40",
        "name": "",
        "type": "uint40"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "claimReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "nonce",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "expiresAt",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "collectDynamicStamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "collectStaticStamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      }
    ],
    "name": "consumeReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "iconUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "rewardDescription",
        "type": "string"
      },
      {
        "internalType": "uint32",
        "name": "stampsRequired",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "staticStampEnabled",
        "type": "bool"
      }
    ],
    "name": "createProgram",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      }
    ],
    "name": "getClaim",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "programId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "burnedStamps",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "rewardDescription",
            "type": "string"
          },
          {
            "internalType": "uint40",
            "name": "claimedAt",
            "type": "uint40"
          },
          {
            "internalType": "uint40",
            "name": "consumedAt",
            "type": "uint40"
          },
          {
            "internalType": "bool",
            "name": "consumed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct Noodl3Loyalty.Claim",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "nonce",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "expiresAt",
        "type": "uint256"
      }
    ],
    "name": "getDynamicStampDigest",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "getLastStaticStampAt",
    "outputs": [
      {
        "internalType": "uint40",
        "name": "",
        "type": "uint40"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "getOwnerProgramIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "displayName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "avatarUrl",
            "type": "string"
          },
          {
            "internalType": "uint40",
            "name": "updatedAt",
            "type": "uint40"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct Noodl3Loyalty.UserProfile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "getProgram",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "iconUrl",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "rewardDescription",
            "type": "string"
          },
          {
            "internalType": "uint32",
            "name": "stampsRequired",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "staticStampEnabled",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct Noodl3Loyalty.Program",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "getProgramClaimIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "getProgramParticipants",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      }
    ],
    "name": "getProgress",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "stamps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "stampsRequired",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "rewardDescription",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "canClaim",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserClaimIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserProgramIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "nonce",
        "type": "bytes32"
      }
    ],
    "name": "isDynamicStampNonceUsed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "customer",
        "type": "address"
      }
    ],
    "name": "issueManualStamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextClaimId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextProgramId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "displayName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "avatarUrl",
        "type": "string"
      }
    ],
    "name": "setProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "programId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "iconUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "rewardDescription",
        "type": "string"
      },
      {
        "internalType": "uint32",
        "name": "stampsRequired",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "staticStampEnabled",
        "type": "bool"
      }
    ],
    "name": "updateProgram",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" }
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
  }
] as const;
