import { expect } from "chai";
import {
  encodeBytes32String,
  getBytes,
  solidityPackedKeccak256
} from "ethers";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Noodl3Loyalty", function () {
  const programName = "Jorge Barber Club";
  const rewardDescription = "Free beard trim";
  const stampsRequired = 3;

  async function deployFixture() {
    const [owner, staff, user, stranger] = await ethers.getSigners();
    const loyalty = (await ethers.deployContract("Noodl3Loyalty")) as any;
    const tx = await loyalty
      .connect(owner)
      .createProgram(programName, rewardDescription, stampsRequired, true);
    await tx.wait();

    return {
      loyalty,
      owner,
      staff,
      user,
      stranger,
      programId: 1n
    };
  }

  async function signDynamicStamp(params: {
    loyalty: any;
    signer: Awaited<ReturnType<typeof ethers.getSigners>>[number];
    programId: bigint;
    nonce: string;
    expiresAt: bigint;
  }) {
    const digest = await params.loyalty.getDynamicStampDigest(
      params.programId,
      params.nonce,
      params.expiresAt
    );
    return params.signer.signMessage(getBytes(digest));
  }

  async function futureExpiry() {
    const block = await ethers.provider.getBlock("latest");
    if (!block) throw new Error("missing latest block");
    return BigInt(block.timestamp + 300);
  }

  it("lets any wallet create a program and indexes it by owner", async function () {
    const { loyalty, owner, user } = await deployFixture();

    const program = await loyalty.getProgram(1n);
    expect(program.id).to.equal(1n);
    expect(program.owner).to.equal(owner.address);
    expect(program.name).to.equal(programName);
    expect(program.rewardDescription).to.equal(rewardDescription);
    expect(program.stampsRequired).to.equal(stampsRequired);
    expect(program.active).to.equal(true);
    expect(await loyalty.getOwnerProgramIds(owner.address)).to.deep.equal([1n]);

    await expect(
      loyalty.connect(user).createProgram("Cafe Pass", "Free coffee", 5, true)
    )
      .to.emit(loyalty, "ProgramCreated")
      .withArgs(2n, user.address, "Cafe Pass", "Free coffee", 5, true);

    expect(await loyalty.getOwnerProgramIds(user.address)).to.deep.equal([2n]);
  });

  it("only lets the owner update program settings and staff", async function () {
    const { loyalty, owner, staff, stranger, programId } = await deployFixture();

    await expect(
      loyalty
        .connect(stranger)
        .updateProgram(programId, "Bad edit", "Bad reward", 2, false)
    ).to.be.revertedWithCustomError(loyalty, "NotProgramOwner");

    await expect(
      loyalty
        .connect(owner)
        .updateProgram(programId, "Updated Club", "Free haircut", 10, false)
    )
      .to.emit(loyalty, "ProgramUpdated")
      .withArgs(programId, "Updated Club", "Free haircut", 10, false);

    await expect(
      loyalty.connect(stranger).setProgramStaff(programId, staff.address, true)
    ).to.be.revertedWithCustomError(loyalty, "NotProgramOwner");

    await expect(loyalty.connect(owner).setProgramStaff(programId, staff.address, true))
      .to.emit(loyalty, "ProgramStaffUpdated")
      .withArgs(programId, staff.address, true);

    expect(await loyalty.isProgramStaff(programId, staff.address)).to.equal(true);
    expect(await loyalty.getStaffProgramIds(staff.address)).to.deep.equal([programId]);

    await loyalty.connect(owner).setProgramStaff(programId, staff.address, false);
    expect(await loyalty.isProgramStaff(programId, staff.address)).to.equal(false);
    expect(await loyalty.getStaffProgramIds(staff.address)).to.deep.equal([]);
  });

  it("validates program limits", async function () {
    const { loyalty, owner } = await deployFixture();

    await expect(
      loyalty.connect(owner).createProgram("", "Reward", 3, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", "", 3, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", "Reward", 0, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", "Reward", 101, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");
  });

  it("supports static visit requests with staff approval and rejection", async function () {
    const { loyalty, owner, staff, user, stranger, programId } = await deployFixture();
    await loyalty.connect(owner).setProgramStaff(programId, staff.address, true);

    await expect(loyalty.connect(user).requestVisit(programId))
      .to.emit(loyalty, "VisitRequested")
      .withArgs(1n, programId, user.address);

    await expect(
      loyalty.connect(user).requestVisit(programId)
    ).to.be.revertedWithCustomError(loyalty, "RequestAlreadyPending");

    await expect(
      loyalty.connect(stranger).approveVisitRequest(1n)
    ).to.be.revertedWithCustomError(loyalty, "NotProgramStaff");

    await expect(loyalty.connect(staff).approveVisitRequest(1n))
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 0, 1);

    const progress = await loyalty.getProgress(user.address, programId);
    expect(progress.stamps).to.equal(1);
    expect(progress.canClaim).to.equal(false);
    expect(await loyalty.getUserProgramIds(user.address)).to.deep.equal([programId]);
    expect(await loyalty.getProgramParticipants(programId)).to.deep.equal([user.address]);

    await loyalty.connect(user).requestVisit(programId);
    await expect(loyalty.connect(owner).rejectVisitRequest(2n))
      .to.emit(loyalty, "VisitRequestResolved")
      .withArgs(2n, programId, owner.address, 2);

    await expect(
      loyalty.connect(owner).approveVisitRequest(2n)
    ).to.be.revertedWithCustomError(loyalty, "RequestResolved");
  });

  it("blocks new visit requests and approvals while inactive", async function () {
    const { loyalty, owner, user, programId } = await deployFixture();

    await loyalty
      .connect(owner)
      .updateProgram(programId, programName, rewardDescription, stampsRequired, false);

    await expect(
      loyalty.connect(user).requestVisit(programId)
    ).to.be.revertedWithCustomError(loyalty, "ProgramInactive");

    await loyalty
      .connect(owner)
      .updateProgram(programId, programName, rewardDescription, stampsRequired, true);
    await loyalty.connect(user).requestVisit(programId);
    await loyalty
      .connect(owner)
      .updateProgram(programId, programName, rewardDescription, stampsRequired, false);

    await expect(
      loyalty.connect(owner).approveVisitRequest(1n)
    ).to.be.revertedWithCustomError(loyalty, "ProgramInactive");
  });

  it("lets owner or staff issue manual stamps", async function () {
    const { loyalty, owner, staff, user, stranger, programId } = await deployFixture();
    await loyalty.connect(owner).setProgramStaff(programId, staff.address, true);

    await expect(
      loyalty.connect(stranger).issueManualStamp(programId, user.address)
    ).to.be.revertedWithCustomError(loyalty, "NotProgramStaff");

    await expect(loyalty.connect(staff).issueManualStamp(programId, user.address))
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 2, 1);

    await expect(loyalty.connect(owner).issueManualStamp(programId, user.address))
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 2, 2);
  });

  it("collects a dynamic QR stamp once with a valid staff signature", async function () {
    const { loyalty, owner, staff, user, programId } = await deployFixture();
    await loyalty.connect(owner).setProgramStaff(programId, staff.address, true);

    const nonce = encodeBytes32String("visit-1");
    const expiresAt = await futureExpiry();
    const signature = await signDynamicStamp({
      loyalty,
      signer: staff,
      programId,
      nonce,
      expiresAt
    });

    await expect(
      loyalty.connect(user).collectDynamicStamp(programId, nonce, expiresAt, signature)
    )
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 1, 1);

    await expect(
      loyalty.connect(user).collectDynamicStamp(programId, nonce, expiresAt, signature)
    ).to.be.revertedWithCustomError(loyalty, "DynamicStampUsed");
  });

  it("rejects expired, wrong-signer, wrong-program, wrong-chain, and wrong-contract dynamic QR signatures", async function () {
    const { loyalty, owner, user, stranger, programId } = await deployFixture();
    const contractAddress = await loyalty.getAddress();
    const connectedNetwork = await ethers.provider.getNetwork();

    const nonce = encodeBytes32String("expired");
    await expect(
      loyalty
        .connect(user)
        .collectDynamicStamp(programId, nonce, 1n, await owner.signMessage(getBytes(nonce)))
    ).to.be.revertedWithCustomError(loyalty, "DynamicStampExpired");

    const validExpiry = await futureExpiry();
    const wrongSignerSig = await signDynamicStamp({
      loyalty,
      signer: stranger,
      programId,
      nonce: encodeBytes32String("wrong-signer"),
      expiresAt: validExpiry
    });
    await expect(
      loyalty
        .connect(user)
        .collectDynamicStamp(
          programId,
          encodeBytes32String("wrong-signer"),
          validExpiry,
          wrongSignerSig
        )
    ).to.be.revertedWithCustomError(loyalty, "InvalidSignature");

    const wrongProgramSig = await signDynamicStamp({
      loyalty,
      signer: owner,
      programId: 999n,
      nonce: encodeBytes32String("wrong-program"),
      expiresAt: validExpiry
    });
    await expect(
      loyalty
        .connect(user)
        .collectDynamicStamp(
          programId,
          encodeBytes32String("wrong-program"),
          validExpiry,
          wrongProgramSig
        )
    ).to.be.revertedWithCustomError(loyalty, "InvalidSignature");

    const wrongChainDigest = solidityPackedKeccak256(
      ["uint256", "address", "uint256", "bytes32", "uint256"],
      [
        BigInt(connectedNetwork.chainId) + 1n,
        contractAddress,
        programId,
        encodeBytes32String("wrong-chain"),
        validExpiry
      ]
    );
    const wrongChainSig = await owner.signMessage(getBytes(wrongChainDigest));
    await expect(
      loyalty
        .connect(user)
        .collectDynamicStamp(
          programId,
          encodeBytes32String("wrong-chain"),
          validExpiry,
          wrongChainSig
        )
    ).to.be.revertedWithCustomError(loyalty, "InvalidSignature");

    const wrongContractDigest = solidityPackedKeccak256(
      ["uint256", "address", "uint256", "bytes32", "uint256"],
      [
        connectedNetwork.chainId,
        user.address,
        programId,
        encodeBytes32String("wrong-contract"),
        validExpiry
      ]
    );
    const wrongContractSig = await owner.signMessage(getBytes(wrongContractDigest));
    await expect(
      loyalty
        .connect(user)
        .collectDynamicStamp(
          programId,
          encodeBytes32String("wrong-contract"),
          validExpiry,
          wrongContractSig
        )
    ).to.be.revertedWithCustomError(loyalty, "InvalidSignature");
  });

  it("burns stamps on claim and lets owner or staff consume once", async function () {
    const { loyalty, owner, staff, user, stranger, programId } = await deployFixture();
    await loyalty.connect(owner).setProgramStaff(programId, staff.address, true);

    for (let i = 0; i < stampsRequired; i += 1) {
      await loyalty.connect(owner).issueManualStamp(programId, user.address);
    }

    await expect(loyalty.connect(user).claimReward(programId))
      .to.emit(loyalty, "RewardClaimed")
      .withArgs(1n, programId, user.address, stampsRequired, rewardDescription);

    const progress = await loyalty.getProgress(user.address, programId);
    expect(progress.stamps).to.equal(0);
    expect(progress.canClaim).to.equal(false);

    const claim = await loyalty.getClaim(1n);
    expect(claim.user).to.equal(user.address);
    expect(claim.rewardDescription).to.equal(rewardDescription);
    expect(claim.consumed).to.equal(false);
    expect(await loyalty.getUserClaimIds(user.address)).to.deep.equal([1n]);
    expect(await loyalty.getProgramClaimIds(programId)).to.deep.equal([1n]);

    await expect(
      loyalty.connect(stranger).consumeReward(1n)
    ).to.be.revertedWithCustomError(loyalty, "NotProgramStaff");

    await expect(loyalty.connect(staff).consumeReward(1n))
      .to.emit(loyalty, "RewardConsumed")
      .withArgs(1n, programId, staff.address, user.address);

    const consumedClaim = await loyalty.getClaim(1n);
    expect(consumedClaim.consumed).to.equal(true);
    expect(consumedClaim.consumedAt).to.not.equal(0);

    await expect(
      loyalty.connect(owner).consumeReward(1n)
    ).to.be.revertedWithCustomError(loyalty, "ClaimAlreadyConsumed");
  });

  it("prevents claiming before the threshold is reached", async function () {
    const { loyalty, owner, user, programId } = await deployFixture();
    await loyalty.connect(owner).issueManualStamp(programId, user.address);

    await expect(
      loyalty.connect(user).claimReward(programId)
    ).to.be.revertedWithCustomError(loyalty, "NotEnoughStamps");
  });

  it("stores and returns onchain user profiles", async function () {
    const { loyalty, user } = await deployFixture();

    await expect(
      loyalty
        .connect(user)
        .setProfile("Ana Clara", "https://cdn.example.com/ana.png")
    )
      .to.emit(loyalty, "ProfileUpdated")
      .withArgs(user.address, "Ana Clara", "https://cdn.example.com/ana.png");

    const profile = await loyalty.getProfile(user.address);
    expect(profile.displayName).to.equal("Ana Clara");
    expect(profile.avatarUrl).to.equal("https://cdn.example.com/ana.png");
    expect(profile.exists).to.equal(true);
    expect(profile.updatedAt).to.not.equal(0);
  });

  it("rejects invalid onchain profile data", async function () {
    const { loyalty, user } = await deployFixture();

    await expect(
      loyalty.connect(user).setProfile("", "")
    ).to.be.revertedWithCustomError(loyalty, "InvalidProfile");

    await expect(
      loyalty.connect(user).setProfile("Ana Clara", "http://cdn.example.com/ana.png")
    ).to.be.revertedWithCustomError(loyalty, "InvalidProfile");
  });
});
