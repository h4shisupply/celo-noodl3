// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract Noodl3Loyalty {
    enum RewardType {
        FixedAmount,
        FreeItem
    }

    struct Store {
        address payout;
        address manager;
        address token;
        uint256 minPurchaseAmount;
        uint32 stampsPerPurchase;
        uint32 stampsRequired;
        RewardType rewardType;
        uint256 rewardValue;
        bool active;
        bool exists;
    }

    struct Claim {
        uint256 id;
        bytes32 storeId;
        address user;
        uint32 burnedStamps;
        RewardType rewardType;
        uint256 rewardValue;
        uint40 claimedAt;
        uint40 consumedAt;
        bool consumed;
        bool exists;
    }

    struct UserProfile {
        string displayName;
        string avatarUrl;
        uint40 updatedAt;
        bool exists;
    }

    error ClaimAlreadyConsumed();
    error ClaimNotFound();
    error AmountBelowMinimum();
    error InvalidStore();
    error InvalidStoreConfig();
    error InvalidProfile();
    error NotEnoughStamps();
    error NotOwner();
    error NotStoreManager();
    error StoreInactive();
    error StoreNotFound();
    error TransferFailed();
    error UnsupportedToken();

    event StoreConfigured(
        bytes32 indexed storeId,
        address payout,
        address manager,
        address token,
        uint256 minPurchaseAmount,
        uint32 stampsPerPurchase,
        uint32 stampsRequired,
        uint8 rewardType,
        uint256 rewardValue,
        bool active
    );
    event PurchaseRecorded(
        bytes32 indexed storeId,
        address indexed user,
        address indexed token,
        uint256 amount,
        string itemRef,
        uint32 stampsEarned,
        uint32 totalStamps,
        address payout
    );
    event RewardClaimed(
        uint256 indexed claimId,
        bytes32 indexed storeId,
        address indexed user,
        uint8 rewardType,
        uint256 rewardValue,
        uint32 burnedStamps
    );
    event RewardConsumed(
        uint256 indexed claimId,
        bytes32 indexed storeId,
        address indexed manager,
        address user
    );
    event ProfileUpdated(
        address indexed user,
        string displayName,
        string avatarUrl
    );

    address public immutable owner;
    uint256 public nextClaimId = 1;

    mapping(bytes32 => Store) private stores;
    mapping(address => mapping(bytes32 => uint32)) private userStamps;
    mapping(uint256 => Claim) private claims;
    mapping(bytes32 => address[]) private storeParticipants;
    mapping(bytes32 => mapping(address => bool)) private isStoreParticipant;
    mapping(bytes32 => address[]) private storeAcceptedTokens;
    mapping(bytes32 => mapping(address => uint8)) private storeAcceptedTokenDecimals;
    mapping(address => uint256[]) private userClaimIds;
    mapping(bytes32 => uint256[]) private storeClaimIds;
    mapping(address => UserProfile) private userProfiles;

    constructor() {
        owner = msg.sender;
    }

    function configureStore(
        bytes32 storeId,
        address payout,
        address manager,
        address token,
        uint256 minPurchaseAmount,
        uint32 stampsPerPurchase,
        uint32 stampsRequired,
        uint8 rewardType,
        uint256 rewardValue,
        bool active
    ) external {
        if (msg.sender != owner) revert NotOwner();
        if (storeId == bytes32(0)) revert InvalidStore();
        if (
            payout == address(0) ||
            manager == address(0) ||
            token == address(0) ||
            stampsPerPurchase == 0 ||
            stampsRequired == 0 ||
            rewardValue == 0 ||
            rewardType > uint8(RewardType.FreeItem)
        ) {
            revert InvalidStoreConfig();
        }

        stores[storeId] = Store({
            payout: payout,
            manager: manager,
            token: token,
            minPurchaseAmount: minPurchaseAmount,
            stampsPerPurchase: stampsPerPurchase,
            stampsRequired: stampsRequired,
            rewardType: RewardType(rewardType),
            rewardValue: rewardValue,
            active: active,
            exists: true
        });

        emit StoreConfigured(
            storeId,
            payout,
            manager,
            token,
            minPurchaseAmount,
            stampsPerPurchase,
            stampsRequired,
            rewardType,
            rewardValue,
            active
        );
    }

    function configureStoreAcceptedTokens(
        bytes32 storeId,
        address[] calldata tokens,
        uint8[] calldata decimals
    ) external {
        if (msg.sender != owner) revert NotOwner();
        if (tokens.length == 0 || tokens.length != decimals.length) {
            revert InvalidStoreConfig();
        }

        _getStoreOrRevert(storeId);

        address[] storage currentTokens = storeAcceptedTokens[storeId];
        for (uint256 i = 0; i < currentTokens.length; i += 1) {
            delete storeAcceptedTokenDecimals[storeId][currentTokens[i]];
        }
        delete storeAcceptedTokens[storeId];

        for (uint256 i = 0; i < tokens.length; i += 1) {
            if (tokens[i] == address(0) || decimals[i] == 0 || decimals[i] > 18) {
                revert InvalidStoreConfig();
            }

            storeAcceptedTokens[storeId].push(tokens[i]);
            storeAcceptedTokenDecimals[storeId][tokens[i]] = decimals[i];
        }
    }

    function purchase(
        bytes32 storeId,
        address paymentToken,
        uint256 amount,
        string calldata itemRef
    ) external {
        Store memory store = _getStoreOrRevert(storeId);
        if (!store.active) revert StoreInactive();
        uint8 tokenDecimals = storeAcceptedTokenDecimals[storeId][paymentToken];
        if (tokenDecimals == 0) revert UnsupportedToken();
        if (_normalizeAmount(amount, tokenDecimals) < store.minPurchaseAmount) {
            revert AmountBelowMinimum();
        }

        _safeTransferFrom(paymentToken, msg.sender, store.payout, amount);

        if (!isStoreParticipant[storeId][msg.sender]) {
            isStoreParticipant[storeId][msg.sender] = true;
            storeParticipants[storeId].push(msg.sender);
        }

        uint32 updatedStamps = userStamps[msg.sender][storeId] +
            store.stampsPerPurchase;
        userStamps[msg.sender][storeId] = updatedStamps;

        emit PurchaseRecorded(
            storeId,
            msg.sender,
            paymentToken,
            amount,
            itemRef,
            store.stampsPerPurchase,
            updatedStamps,
            store.payout
        );
    }

    function claimReward(bytes32 storeId) external returns (uint256 claimId) {
        Store memory store = _getStoreOrRevert(storeId);
        if (!store.active) revert StoreInactive();

        uint32 currentStamps = userStamps[msg.sender][storeId];
        if (currentStamps < store.stampsRequired) revert NotEnoughStamps();

        userStamps[msg.sender][storeId] = currentStamps - store.stampsRequired;
        claimId = nextClaimId;
        nextClaimId += 1;

        claims[claimId] = Claim({
            id: claimId,
            storeId: storeId,
            user: msg.sender,
            burnedStamps: store.stampsRequired,
            rewardType: store.rewardType,
            rewardValue: store.rewardValue,
            claimedAt: uint40(block.timestamp),
            consumedAt: 0,
            consumed: false,
            exists: true
        });
        userClaimIds[msg.sender].push(claimId);
        storeClaimIds[storeId].push(claimId);

        emit RewardClaimed(
            claimId,
            storeId,
            msg.sender,
            uint8(store.rewardType),
            store.rewardValue,
            store.stampsRequired
        );
    }

    function consumeReward(uint256 claimId) external {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.consumed) revert ClaimAlreadyConsumed();

        Store memory store = _getStoreOrRevert(claim.storeId);
        if (msg.sender != store.manager) revert NotStoreManager();

        claim.consumed = true;
        claim.consumedAt = uint40(block.timestamp);

        emit RewardConsumed(claimId, claim.storeId, msg.sender, claim.user);
    }

    function setProfile(
        string calldata displayName,
        string calldata avatarUrl
    ) external {
        bytes memory displayNameBytes = bytes(displayName);
        bytes memory avatarUrlBytes = bytes(avatarUrl);

        if (
            displayNameBytes.length == 0 ||
            displayNameBytes.length > 40 ||
            avatarUrlBytes.length > 280
        ) {
            revert InvalidProfile();
        }

        if (
            avatarUrlBytes.length > 0 &&
            !_startsWithHttps(avatarUrlBytes)
        ) {
            revert InvalidProfile();
        }

        userProfiles[msg.sender] = UserProfile({
            displayName: displayName,
            avatarUrl: avatarUrl,
            updatedAt: uint40(block.timestamp),
            exists: true
        });

        emit ProfileUpdated(msg.sender, displayName, avatarUrl);
    }

    function getStore(bytes32 storeId) external view returns (Store memory) {
        return _getStoreOrRevert(storeId);
    }

    function getProfile(
        address user
    ) external view returns (UserProfile memory) {
        return userProfiles[user];
    }

    function getProgress(
        address user,
        bytes32 storeId
    )
        external
        view
        returns (
            uint32 stamps,
            uint32 stampsRequired,
            uint32 stampsPerPurchase,
            uint8 rewardType,
            uint256 rewardValue,
            bool canClaim
        )
    {
        Store memory store = _getStoreOrRevert(storeId);
        stamps = userStamps[user][storeId];
        stampsRequired = store.stampsRequired;
        stampsPerPurchase = store.stampsPerPurchase;
        rewardType = uint8(store.rewardType);
        rewardValue = store.rewardValue;
        canClaim = stamps >= store.stampsRequired;
    }

    function getStoreParticipants(
        bytes32 storeId
    ) external view returns (address[] memory) {
        _getStoreOrRevert(storeId);
        return storeParticipants[storeId];
    }

    function getStoreAcceptedTokens(
        bytes32 storeId
    ) external view returns (address[] memory) {
        _getStoreOrRevert(storeId);
        return storeAcceptedTokens[storeId];
    }

    function getUserClaimIds(
        address user
    ) external view returns (uint256[] memory) {
        return userClaimIds[user];
    }

    function getStoreClaimIds(
        bytes32 storeId
    ) external view returns (uint256[] memory) {
        _getStoreOrRevert(storeId);
        return storeClaimIds[storeId];
    }

    function getClaim(uint256 claimId) external view returns (Claim memory) {
        Claim memory claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        return claim;
    }

    function _getStoreOrRevert(
        bytes32 storeId
    ) private view returns (Store memory store) {
        store = stores[storeId];
        if (!store.exists) revert StoreNotFound();
    }

    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) private {
        (bool success, bytes memory data) = token.call(
            abi.encodeCall(IERC20Minimal.transferFrom, (from, to, amount))
        );

        if (!success) revert TransferFailed();
        if (data.length > 0 && !abi.decode(data, (bool))) revert TransferFailed();
    }

    function _normalizeAmount(
        uint256 amount,
        uint8 decimals
    ) private pure returns (uint256) {
        if (decimals == 18) {
            return amount;
        }

        return amount * (10 ** uint256(18 - decimals));
    }

    function _startsWithHttps(
        bytes memory value
    ) private pure returns (bool) {
        bytes memory prefix = bytes("https://");

        if (value.length < prefix.length) {
            return false;
        }

        for (uint256 i = 0; i < prefix.length; i += 1) {
            if (value[i] != prefix[i]) {
                return false;
            }
        }

        return true;
    }
}
