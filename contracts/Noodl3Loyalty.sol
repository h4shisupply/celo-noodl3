// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Noodl3Loyalty {
    enum StampSource {
        StaticQr,
        DynamicQr,
        Manual
    }

    struct Program {
        uint256 id;
        address owner;
        string name;
        string iconUrl;
        string rewardDescription;
        uint32 stampsRequired;
        bool active;
        bool staticStampEnabled;
        bool exists;
    }

    struct Claim {
        uint256 id;
        uint256 programId;
        address user;
        uint32 burnedStamps;
        string rewardDescription;
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
    error DynamicStampExpired();
    error DynamicStampUsed();
    error InvalidProgramConfig();
    error InvalidProfile();
    error InvalidRequest();
    error InvalidSignature();
    error NotEnoughStamps();
    error NotProgramOwner();
    error ProgramInactive();
    error ProgramNotFound();
    error StaticStampCooldown(uint40 nextAvailableAt);
    error StaticStampDisabled();

    event ProgramCreated(
        uint256 indexed programId,
        address indexed owner,
        string name,
        string iconUrl,
        string rewardDescription,
        uint32 stampsRequired,
        bool active,
        bool staticStampEnabled
    );
    event ProgramUpdated(
        uint256 indexed programId,
        string name,
        string iconUrl,
        string rewardDescription,
        uint32 stampsRequired,
        bool active,
        bool staticStampEnabled
    );
    event StampIssued(
        uint256 indexed programId,
        address indexed customer,
        uint8 source,
        uint32 totalStamps
    );
    event RewardClaimed(
        uint256 indexed claimId,
        uint256 indexed programId,
        address indexed user,
        uint32 burnedStamps,
        string rewardDescription
    );
    event RewardConsumed(
        uint256 indexed claimId,
        uint256 indexed programId,
        address indexed operator,
        address user
    );
    event ProfileUpdated(
        address indexed user,
        string displayName,
        string avatarUrl
    );

    uint256 public nextProgramId = 1;
    uint256 public nextClaimId = 1;
    uint40 public constant STATIC_STAMP_COOLDOWN = 20 hours;

    mapping(uint256 => Program) private programs;
    mapping(address => uint256[]) private ownerProgramIds;

    mapping(address => mapping(uint256 => uint32)) private userStamps;
    mapping(address => mapping(uint256 => uint40)) private lastStaticStampAt;
    mapping(uint256 => address[]) private programParticipants;
    mapping(uint256 => mapping(address => bool)) private isProgramParticipant;
    mapping(address => uint256[]) private userProgramIds;
    mapping(address => mapping(uint256 => bool)) private userProgramIndexed;

    mapping(uint256 => Claim) private claims;
    mapping(address => uint256[]) private userClaimIds;
    mapping(uint256 => uint256[]) private programClaimIds;

    mapping(uint256 => mapping(bytes32 => bool)) private usedDynamicStampNonces;
    mapping(address => UserProfile) private userProfiles;

    function createProgram(
        string calldata name,
        string calldata iconUrl,
        string calldata rewardDescription,
        uint32 stampsRequired,
        bool active,
        bool staticStampEnabled
    ) external returns (uint256 programId) {
        _validateProgramConfig(name, iconUrl, rewardDescription, stampsRequired);

        programId = nextProgramId;
        nextProgramId += 1;

        programs[programId] = Program({
            id: programId,
            owner: msg.sender,
            name: name,
            iconUrl: iconUrl,
            rewardDescription: rewardDescription,
            stampsRequired: stampsRequired,
            active: active,
            staticStampEnabled: staticStampEnabled,
            exists: true
        });
        ownerProgramIds[msg.sender].push(programId);

        emit ProgramCreated(
            programId,
            msg.sender,
            name,
            iconUrl,
            rewardDescription,
            stampsRequired,
            active,
            staticStampEnabled
        );
    }

    function updateProgram(
        uint256 programId,
        string calldata name,
        string calldata iconUrl,
        string calldata rewardDescription,
        uint32 stampsRequired,
        bool active,
        bool staticStampEnabled
    ) external {
        _requireProgramOwner(programId);
        _validateProgramConfig(name, iconUrl, rewardDescription, stampsRequired);

        Program storage program = programs[programId];
        program.name = name;
        program.iconUrl = iconUrl;
        program.rewardDescription = rewardDescription;
        program.stampsRequired = stampsRequired;
        program.active = active;
        program.staticStampEnabled = staticStampEnabled;

        emit ProgramUpdated(
            programId,
            name,
            iconUrl,
            rewardDescription,
            stampsRequired,
            active,
            staticStampEnabled
        );
    }

    function collectStaticStamp(uint256 programId) external {
        Program memory program = _getProgramOrRevert(programId);
        if (!program.active) revert ProgramInactive();
        if (!program.staticStampEnabled) revert StaticStampDisabled();

        uint40 lastCollectedAt = lastStaticStampAt[msg.sender][programId];
        uint40 nextAvailableAt = lastCollectedAt + STATIC_STAMP_COOLDOWN;
        if (lastCollectedAt != 0 && block.timestamp < nextAvailableAt) {
            revert StaticStampCooldown(nextAvailableAt);
        }

        lastStaticStampAt[msg.sender][programId] = uint40(block.timestamp);
        _issueStamp(program.id, msg.sender, StampSource.StaticQr);
    }

    function issueManualStamp(uint256 programId, address customer) external {
        Program memory program = _getProgramOrRevert(programId);
        if (!program.active) revert ProgramInactive();
        if (customer == address(0)) revert InvalidRequest();
        _requireProgramOwner(programId);

        _issueStamp(program.id, customer, StampSource.Manual);
    }

    function collectDynamicStamp(
        uint256 programId,
        bytes32 nonce,
        uint256 expiresAt,
        bytes calldata signature
    ) external {
        Program memory program = _getProgramOrRevert(programId);
        if (!program.active) revert ProgramInactive();
        if (expiresAt < block.timestamp) revert DynamicStampExpired();
        if (usedDynamicStampNonces[programId][nonce]) revert DynamicStampUsed();

        bytes32 digest = getDynamicStampDigest(programId, nonce, expiresAt);
        address signer = _recoverSigner(digest, signature);
        if (signer != program.owner) revert InvalidSignature();

        usedDynamicStampNonces[programId][nonce] = true;
        _issueStamp(program.id, msg.sender, StampSource.DynamicQr);
    }

    function claimReward(uint256 programId) external returns (uint256 claimId) {
        Program memory program = _getProgramOrRevert(programId);
        uint32 currentStamps = userStamps[msg.sender][programId];
        if (currentStamps < program.stampsRequired) revert NotEnoughStamps();

        userStamps[msg.sender][programId] = currentStamps - program.stampsRequired;
        claimId = nextClaimId;
        nextClaimId += 1;

        claims[claimId] = Claim({
            id: claimId,
            programId: programId,
            user: msg.sender,
            burnedStamps: program.stampsRequired,
            rewardDescription: program.rewardDescription,
            claimedAt: uint40(block.timestamp),
            consumedAt: 0,
            consumed: false,
            exists: true
        });
        userClaimIds[msg.sender].push(claimId);
        programClaimIds[programId].push(claimId);

        emit RewardClaimed(
            claimId,
            programId,
            msg.sender,
            program.stampsRequired,
            program.rewardDescription
        );
    }

    function consumeReward(uint256 claimId) external {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.consumed) revert ClaimAlreadyConsumed();
        _requireProgramOwner(claim.programId);

        claim.consumed = true;
        claim.consumedAt = uint40(block.timestamp);

        emit RewardConsumed(claimId, claim.programId, msg.sender, claim.user);
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

    function getDynamicStampDigest(
        uint256 programId,
        bytes32 nonce,
        uint256 expiresAt
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, address(this), programId, nonce, expiresAt));
    }

    function getProgram(uint256 programId) external view returns (Program memory) {
        return _getProgramOrRevert(programId);
    }

    function getClaim(uint256 claimId) external view returns (Claim memory) {
        Claim memory claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        return claim;
    }

    function getProfile(
        address user
    ) external view returns (UserProfile memory) {
        return userProfiles[user];
    }

    function getProgress(
        address user,
        uint256 programId
    )
        external
        view
        returns (
            uint32 stamps,
            uint32 stampsRequired,
            string memory rewardDescription,
            bool canClaim
        )
    {
        Program memory program = _getProgramOrRevert(programId);
        stamps = userStamps[user][programId];
        stampsRequired = program.stampsRequired;
        rewardDescription = program.rewardDescription;
        canClaim = stamps >= program.stampsRequired;
    }

    function getOwnerProgramIds(
        address owner
    ) external view returns (uint256[] memory) {
        return ownerProgramIds[owner];
    }

    function getUserProgramIds(
        address user
    ) external view returns (uint256[] memory) {
        return userProgramIds[user];
    }

    function getProgramParticipants(
        uint256 programId
    ) external view returns (address[] memory) {
        _getProgramOrRevert(programId);
        return programParticipants[programId];
    }

    function getUserClaimIds(
        address user
    ) external view returns (uint256[] memory) {
        return userClaimIds[user];
    }

    function getProgramClaimIds(
        uint256 programId
    ) external view returns (uint256[] memory) {
        _getProgramOrRevert(programId);
        return programClaimIds[programId];
    }

    function isDynamicStampNonceUsed(
        uint256 programId,
        bytes32 nonce
    ) external view returns (bool) {
        _getProgramOrRevert(programId);
        return usedDynamicStampNonces[programId][nonce];
    }

    function getLastStaticStampAt(
        address user,
        uint256 programId
    ) external view returns (uint40) {
        _getProgramOrRevert(programId);
        return lastStaticStampAt[user][programId];
    }

    function _issueStamp(
        uint256 programId,
        address customer,
        StampSource source
    ) private {
        if (!isProgramParticipant[programId][customer]) {
            isProgramParticipant[programId][customer] = true;
            programParticipants[programId].push(customer);
        }

        if (!userProgramIndexed[customer][programId]) {
            userProgramIndexed[customer][programId] = true;
            userProgramIds[customer].push(programId);
        }

        uint32 updatedStamps = userStamps[customer][programId] + 1;
        userStamps[customer][programId] = updatedStamps;

        emit StampIssued(programId, customer, uint8(source), updatedStamps);
    }

    function _requireProgramOwner(uint256 programId) private view {
        Program memory program = _getProgramOrRevert(programId);
        if (msg.sender != program.owner) revert NotProgramOwner();
    }

    function _getProgramOrRevert(
        uint256 programId
    ) private view returns (Program memory program) {
        program = programs[programId];
        if (!program.exists) revert ProgramNotFound();
    }

    function _validateProgramConfig(
        string calldata name,
        string calldata iconUrl,
        string calldata rewardDescription,
        uint32 stampsRequired
    ) private pure {
        bytes memory nameBytes = bytes(name);
        bytes memory iconUrlBytes = bytes(iconUrl);
        bytes memory rewardBytes = bytes(rewardDescription);
        if (
            nameBytes.length == 0 ||
            nameBytes.length > 60 ||
            iconUrlBytes.length == 0 ||
            iconUrlBytes.length > 280 ||
            !_startsWithHttps(iconUrlBytes) ||
            rewardBytes.length == 0 ||
            rewardBytes.length > 120 ||
            stampsRequired == 0 ||
            stampsRequired > 100
        ) {
            revert InvalidProgramConfig();
        }
    }

    function _recoverSigner(
        bytes32 digest,
        bytes calldata signature
    ) private pure returns (address) {
        if (signature.length != 65) revert InvalidSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) revert InvalidSignature();

        address signer = ecrecover(_toEthSignedMessageHash(digest), v, r, s);
        if (signer == address(0)) revert InvalidSignature();
        return signer;
    }

    function _toEthSignedMessageHash(bytes32 digest) private pure returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", digest)
        );
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
