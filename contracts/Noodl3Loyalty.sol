// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Noodl3Loyalty {
    enum RequestStatus {
        Pending,
        Approved,
        Rejected
    }

    enum StampSource {
        StaticRequest,
        DynamicQr,
        Manual
    }

    struct Program {
        uint256 id;
        address owner;
        string name;
        string rewardDescription;
        uint32 stampsRequired;
        bool active;
        bool exists;
    }

    struct VisitRequest {
        uint256 id;
        uint256 programId;
        address customer;
        uint40 requestedAt;
        uint40 resolvedAt;
        address resolvedBy;
        RequestStatus status;
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
    error InvalidProgram();
    error InvalidProgramConfig();
    error InvalidProfile();
    error InvalidRequest();
    error InvalidSignature();
    error InvalidStaff();
    error NotEnoughStamps();
    error NotProgramStaff();
    error NotProgramOwner();
    error ProgramInactive();
    error ProgramNotFound();
    error RequestAlreadyPending();
    error RequestNotFound();
    error RequestResolved();

    event ProgramCreated(
        uint256 indexed programId,
        address indexed owner,
        string name,
        string rewardDescription,
        uint32 stampsRequired,
        bool active
    );
    event ProgramUpdated(
        uint256 indexed programId,
        string name,
        string rewardDescription,
        uint32 stampsRequired,
        bool active
    );
    event ProgramStaffUpdated(
        uint256 indexed programId,
        address indexed staff,
        bool enabled
    );
    event VisitRequested(
        uint256 indexed requestId,
        uint256 indexed programId,
        address indexed customer
    );
    event VisitRequestResolved(
        uint256 indexed requestId,
        uint256 indexed programId,
        address indexed resolvedBy,
        uint8 status
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
        address indexed staff,
        address user
    );
    event ProfileUpdated(
        address indexed user,
        string displayName,
        string avatarUrl
    );

    uint256 public nextProgramId = 1;
    uint256 public nextVisitRequestId = 1;
    uint256 public nextClaimId = 1;

    mapping(uint256 => Program) private programs;
    mapping(uint256 => mapping(address => bool)) private programStaff;
    mapping(address => uint256[]) private ownerProgramIds;
    mapping(address => uint256[]) private staffProgramIds;
    mapping(address => mapping(uint256 => bool)) private staffProgramIndexed;

    mapping(address => mapping(uint256 => uint32)) private userStamps;
    mapping(uint256 => address[]) private programParticipants;
    mapping(uint256 => mapping(address => bool)) private isProgramParticipant;
    mapping(address => uint256[]) private userProgramIds;
    mapping(address => mapping(uint256 => bool)) private userProgramIndexed;

    mapping(uint256 => VisitRequest) private visitRequests;
    mapping(uint256 => uint256[]) private programVisitRequestIds;
    mapping(uint256 => mapping(address => uint256)) private pendingRequestByCustomer;

    mapping(uint256 => Claim) private claims;
    mapping(address => uint256[]) private userClaimIds;
    mapping(uint256 => uint256[]) private programClaimIds;

    mapping(uint256 => mapping(bytes32 => bool)) private usedDynamicStampNonces;
    mapping(address => UserProfile) private userProfiles;

    function createProgram(
        string calldata name,
        string calldata rewardDescription,
        uint32 stampsRequired,
        bool active
    ) external returns (uint256 programId) {
        _validateProgramConfig(name, rewardDescription, stampsRequired);

        programId = nextProgramId;
        nextProgramId += 1;

        programs[programId] = Program({
            id: programId,
            owner: msg.sender,
            name: name,
            rewardDescription: rewardDescription,
            stampsRequired: stampsRequired,
            active: active,
            exists: true
        });
        ownerProgramIds[msg.sender].push(programId);

        emit ProgramCreated(
            programId,
            msg.sender,
            name,
            rewardDescription,
            stampsRequired,
            active
        );
    }

    function updateProgram(
        uint256 programId,
        string calldata name,
        string calldata rewardDescription,
        uint32 stampsRequired,
        bool active
    ) external {
        _requireProgramOwner(programId);
        _validateProgramConfig(name, rewardDescription, stampsRequired);

        Program storage program = programs[programId];
        program.name = name;
        program.rewardDescription = rewardDescription;
        program.stampsRequired = stampsRequired;
        program.active = active;

        emit ProgramUpdated(
            programId,
            name,
            rewardDescription,
            stampsRequired,
            active
        );
    }

    function setProgramStaff(
        uint256 programId,
        address staff,
        bool enabled
    ) external {
        _requireProgramOwner(programId);
        if (staff == address(0)) revert InvalidStaff();

        programStaff[programId][staff] = enabled;
        if (enabled && !staffProgramIndexed[staff][programId]) {
            staffProgramIndexed[staff][programId] = true;
            staffProgramIds[staff].push(programId);
        }

        emit ProgramStaffUpdated(programId, staff, enabled);
    }

    function requestVisit(uint256 programId) external returns (uint256 requestId) {
        Program memory program = _getProgramOrRevert(programId);
        if (!program.active) revert ProgramInactive();
        if (pendingRequestByCustomer[programId][msg.sender] != 0) {
            revert RequestAlreadyPending();
        }

        requestId = nextVisitRequestId;
        nextVisitRequestId += 1;

        visitRequests[requestId] = VisitRequest({
            id: requestId,
            programId: programId,
            customer: msg.sender,
            requestedAt: uint40(block.timestamp),
            resolvedAt: 0,
            resolvedBy: address(0),
            status: RequestStatus.Pending,
            exists: true
        });
        programVisitRequestIds[programId].push(requestId);
        pendingRequestByCustomer[programId][msg.sender] = requestId;

        emit VisitRequested(requestId, programId, msg.sender);
    }

    function approveVisitRequest(uint256 requestId) external {
        VisitRequest storage visitRequest = _getVisitRequestOrRevert(requestId);
        if (visitRequest.status != RequestStatus.Pending) revert RequestResolved();
        Program memory program = _getProgramOrRevert(visitRequest.programId);
        if (!program.active) revert ProgramInactive();
        _requireProgramStaff(program.id);

        visitRequest.status = RequestStatus.Approved;
        visitRequest.resolvedAt = uint40(block.timestamp);
        visitRequest.resolvedBy = msg.sender;
        pendingRequestByCustomer[program.id][visitRequest.customer] = 0;

        _issueStamp(program.id, visitRequest.customer, StampSource.StaticRequest);

        emit VisitRequestResolved(
            requestId,
            program.id,
            msg.sender,
            uint8(RequestStatus.Approved)
        );
    }

    function rejectVisitRequest(uint256 requestId) external {
        VisitRequest storage visitRequest = _getVisitRequestOrRevert(requestId);
        if (visitRequest.status != RequestStatus.Pending) revert RequestResolved();
        _requireProgramStaff(visitRequest.programId);

        visitRequest.status = RequestStatus.Rejected;
        visitRequest.resolvedAt = uint40(block.timestamp);
        visitRequest.resolvedBy = msg.sender;
        pendingRequestByCustomer[visitRequest.programId][visitRequest.customer] = 0;

        emit VisitRequestResolved(
            requestId,
            visitRequest.programId,
            msg.sender,
            uint8(RequestStatus.Rejected)
        );
    }

    function issueManualStamp(uint256 programId, address customer) external {
        Program memory program = _getProgramOrRevert(programId);
        if (!program.active) revert ProgramInactive();
        if (customer == address(0)) revert InvalidRequest();
        _requireProgramStaff(programId);

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
        if (!_isProgramStaff(programId, signer)) revert InvalidSignature();

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
        _requireProgramStaff(claim.programId);

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

    function getVisitRequest(
        uint256 requestId
    ) external view returns (VisitRequest memory) {
        return _getVisitRequestOrRevert(requestId);
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

    function isProgramStaff(
        uint256 programId,
        address account
    ) external view returns (bool) {
        _getProgramOrRevert(programId);
        return _isProgramStaff(programId, account);
    }

    function getOwnerProgramIds(
        address owner
    ) external view returns (uint256[] memory) {
        return ownerProgramIds[owner];
    }

    function getStaffProgramIds(
        address staff
    ) external view returns (uint256[] memory) {
        uint256[] storage indexedIds = staffProgramIds[staff];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < indexedIds.length; i += 1) {
            if (programStaff[indexedIds[i]][staff]) {
                activeCount += 1;
            }
        }

        uint256[] memory filteredIds = new uint256[](activeCount);
        uint256 cursor = 0;
        for (uint256 i = 0; i < indexedIds.length; i += 1) {
            if (programStaff[indexedIds[i]][staff]) {
                filteredIds[cursor] = indexedIds[i];
                cursor += 1;
            }
        }

        return filteredIds;
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

    function getProgramVisitRequestIds(
        uint256 programId
    ) external view returns (uint256[] memory) {
        _getProgramOrRevert(programId);
        return programVisitRequestIds[programId];
    }

    function getPendingVisitRequestId(
        uint256 programId,
        address customer
    ) external view returns (uint256) {
        _getProgramOrRevert(programId);
        return pendingRequestByCustomer[programId][customer];
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

    function _requireProgramStaff(uint256 programId) private view {
        if (!_isProgramStaff(programId, msg.sender)) revert NotProgramStaff();
    }

    function _isProgramStaff(
        uint256 programId,
        address account
    ) private view returns (bool) {
        Program memory program = _getProgramOrRevert(programId);
        return account == program.owner || programStaff[programId][account];
    }

    function _getProgramOrRevert(
        uint256 programId
    ) private view returns (Program memory program) {
        program = programs[programId];
        if (!program.exists) revert ProgramNotFound();
    }

    function _getVisitRequestOrRevert(
        uint256 requestId
    ) private view returns (VisitRequest storage visitRequest) {
        visitRequest = visitRequests[requestId];
        if (!visitRequest.exists) revert RequestNotFound();
    }

    function _validateProgramConfig(
        string calldata name,
        string calldata rewardDescription,
        uint32 stampsRequired
    ) private pure {
        bytes memory nameBytes = bytes(name);
        bytes memory rewardBytes = bytes(rewardDescription);
        if (
            nameBytes.length == 0 ||
            nameBytes.length > 60 ||
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
