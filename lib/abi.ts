export const loyaltyAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }]
  },
  {
    type: "function",
    name: "nextClaimId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
  },
  {
    type: "function",
    name: "configureStore",
    stateMutability: "nonpayable",
    inputs: [
      { name: "storeId", type: "bytes32", internalType: "bytes32" },
      { name: "payout", type: "address", internalType: "address" },
      { name: "manager", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "minPurchaseAmount", type: "uint256", internalType: "uint256" },
      { name: "stampsPerPurchase", type: "uint32", internalType: "uint32" },
      { name: "stampsRequired", type: "uint32", internalType: "uint32" },
      { name: "rewardType", type: "uint8", internalType: "uint8" },
      { name: "rewardValue", type: "uint256", internalType: "uint256" },
      { name: "active", type: "bool", internalType: "bool" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "configureStoreAcceptedTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "storeId", type: "bytes32", internalType: "bytes32" },
      { name: "tokens", type: "address[]", internalType: "address[]" },
      { name: "decimals", type: "uint8[]", internalType: "uint8[]" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "purchase",
    stateMutability: "nonpayable",
    inputs: [
      { name: "storeId", type: "bytes32", internalType: "bytes32" },
      { name: "paymentToken", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "itemRef", type: "string", internalType: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "claimReward",
    stateMutability: "nonpayable",
    inputs: [{ name: "storeId", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "claimId", type: "uint256", internalType: "uint256" }]
  },
  {
    type: "function",
    name: "consumeReward",
    stateMutability: "nonpayable",
    inputs: [{ name: "claimId", type: "uint256", internalType: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "setProfile",
    stateMutability: "nonpayable",
    inputs: [
      { name: "displayName", type: "string", internalType: "string" },
      { name: "avatarUrl", type: "string", internalType: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getStore",
    stateMutability: "view",
    inputs: [{ name: "storeId", type: "bytes32", internalType: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Noodl3Loyalty.Store",
        components: [
          { name: "payout", type: "address", internalType: "address" },
          { name: "manager", type: "address", internalType: "address" },
          { name: "token", type: "address", internalType: "address" },
          {
            name: "minPurchaseAmount",
            type: "uint256",
            internalType: "uint256"
          },
          {
            name: "stampsPerPurchase",
            type: "uint32",
            internalType: "uint32"
          },
          {
            name: "stampsRequired",
            type: "uint32",
            internalType: "uint32"
          },
          { name: "rewardType", type: "uint8", internalType: "uint8" },
          { name: "rewardValue", type: "uint256", internalType: "uint256" },
          { name: "active", type: "bool", internalType: "bool" },
          { name: "exists", type: "bool", internalType: "bool" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getProgress",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "storeId", type: "bytes32", internalType: "bytes32" }
    ],
    outputs: [
      { name: "stamps", type: "uint32", internalType: "uint32" },
      { name: "stampsRequired", type: "uint32", internalType: "uint32" },
      { name: "stampsPerPurchase", type: "uint32", internalType: "uint32" },
      { name: "rewardType", type: "uint8", internalType: "uint8" },
      { name: "rewardValue", type: "uint256", internalType: "uint256" },
      { name: "canClaim", type: "bool", internalType: "bool" }
    ]
  },
  {
    type: "function",
    name: "getStoreParticipants",
    stateMutability: "view",
    inputs: [{ name: "storeId", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }]
  },
  {
    type: "function",
    name: "getStoreAcceptedTokens",
    stateMutability: "view",
    inputs: [{ name: "storeId", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }]
  },
  {
    type: "function",
    name: "getUserClaimIds",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }]
  },
  {
    type: "function",
    name: "getStoreClaimIds",
    stateMutability: "view",
    inputs: [{ name: "storeId", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }]
  },
  {
    type: "function",
    name: "getClaim",
    stateMutability: "view",
    inputs: [{ name: "claimId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Noodl3Loyalty.Claim",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "storeId", type: "bytes32", internalType: "bytes32" },
          { name: "user", type: "address", internalType: "address" },
          { name: "burnedStamps", type: "uint32", internalType: "uint32" },
          { name: "rewardType", type: "uint8", internalType: "uint8" },
          { name: "rewardValue", type: "uint256", internalType: "uint256" },
          { name: "claimedAt", type: "uint40", internalType: "uint40" },
          { name: "consumedAt", type: "uint40", internalType: "uint40" },
          { name: "consumed", type: "bool", internalType: "bool" },
          { name: "exists", type: "bool", internalType: "bool" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getProfile",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Noodl3Loyalty.UserProfile",
        components: [
          { name: "displayName", type: "string", internalType: "string" },
          { name: "avatarUrl", type: "string", internalType: "string" },
          { name: "updatedAt", type: "uint40", internalType: "uint40" },
          { name: "exists", type: "bool", internalType: "bool" }
        ]
      }
    ]
  },
  {
    type: "event",
    name: "RewardClaimed",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "claimId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        indexed: true,
        name: "storeId",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        indexed: true,
        name: "user",
        type: "address",
        internalType: "address"
      },
      {
        indexed: false,
        name: "rewardType",
        type: "uint8",
        internalType: "uint8"
      },
      {
        indexed: false,
        name: "rewardValue",
        type: "uint256",
        internalType: "uint256"
      },
      {
        indexed: false,
        name: "burnedStamps",
        type: "uint32",
        internalType: "uint32"
      }
    ]
  },
  {
    type: "event",
    name: "ProfileUpdated",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "user",
        type: "address",
        internalType: "address"
      },
      {
        indexed: false,
        name: "displayName",
        type: "string",
        internalType: "string"
      },
      {
        indexed: false,
        name: "avatarUrl",
        type: "string",
        internalType: "string"
      }
    ]
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
