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
  const iconUrl = "https://cdn.example.com/barber.png";
  const rewardDescription = "Free beard trim";
  const stampsRequired = 3;
  const staticCooldown = 20 * 60 * 60;

  async function deployFixture() {
    const [owner, user, stranger] = await ethers.getSigners();
    const loyalty = (await ethers.deployContract("Noodl3Loyalty")) as any;
    const tx = await loyalty
      .connect(owner)
      .createProgram(
        programName,
        iconUrl,
        rewardDescription,
        stampsRequired,
        true,
        true
      );
    await tx.wait();

    return {
      loyalty,
      owner,
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

  async function increaseTime(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  it("lets any wallet create a program with an icon URL and indexes it by owner", async function () {
    const { loyalty, owner, user } = await deployFixture();

    const program = await loyalty.getProgram(1n);
    expect(program.id).to.equal(1n);
    expect(program.owner).to.equal(owner.address);
    expect(program.name).to.equal(programName);
    expect(program.iconUrl).to.equal(iconUrl);
    expect(program.rewardDescription).to.equal(rewardDescription);
    expect(program.stampsRequired).to.equal(stampsRequired);
    expect(program.active).to.equal(true);
    expect(program.staticStampEnabled).to.equal(true);
    expect(await loyalty.getOwnerProgramIds(owner.address)).to.deep.equal([1n]);

    await expect(
      loyalty
        .connect(user)
        .createProgram(
          "Cafe Pass",
          "https://cdn.example.com/cafe.png",
          "Free coffee",
          5,
          true,
          true
        )
    )
      .to.emit(loyalty, "ProgramCreated")
      .withArgs(
        2n,
        user.address,
        "Cafe Pass",
        "https://cdn.example.com/cafe.png",
        "Free coffee",
        5,
        true,
        true
      );

    expect(await loyalty.getOwnerProgramIds(user.address)).to.deep.equal([2n]);
  });

  it("only lets the owner update program settings", async function () {
    const { loyalty, owner, stranger, programId } = await deployFixture();

    await expect(
      loyalty
        .connect(stranger)
        .updateProgram(
          programId,
          "Bad edit",
          iconUrl,
          "Bad reward",
          2,
          false,
          true
        )
    ).to.be.revertedWithCustomError(loyalty, "NotProgramOwner");

    await expect(
      loyalty
        .connect(owner)
        .updateProgram(
          programId,
          "Updated Club",
          "https://cdn.example.com/updated.png",
          "Free haircut",
          10,
          false,
          false
        )
    )
      .to.emit(loyalty, "ProgramUpdated")
      .withArgs(
        programId,
        "Updated Club",
        "https://cdn.example.com/updated.png",
        "Free haircut",
        10,
        false,
        false
      );

    const program = await loyalty.getProgram(programId);
    expect(program.iconUrl).to.equal("https://cdn.example.com/updated.png");
    expect(program.staticStampEnabled).to.equal(false);
  });

  it("validates program limits and HTTPS icon URLs", async function () {
    const { loyalty, owner } = await deployFixture();

    await expect(
      loyalty.connect(owner).createProgram("", iconUrl, "Reward", 3, true, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", "", "Reward", 3, true, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty
        .connect(owner)
        .createProgram("Name", "http://cdn.example.com/icon.png", "Reward", 3, true, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", iconUrl, "", 3, true, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", iconUrl, "Reward", 0, true, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");

    await expect(
      loyalty.connect(owner).createProgram("Name", iconUrl, "Reward", 101, true, true)
    ).to.be.revertedWithCustomError(loyalty, "InvalidProgramConfig");
  });

  it("lets customers collect one static QR stamp per cooldown window", async function () {
    const { loyalty, user, programId } = await deployFixture();

    await expect(loyalty.connect(user).collectStaticStamp(programId))
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 0, 1);

    const lastStaticStampAt = await loyalty.getLastStaticStampAt(user.address, programId);
    expect(lastStaticStampAt).to.not.equal(0);

    await expect(
      loyalty.connect(user).collectStaticStamp(programId)
    ).to.be.revertedWithCustomError(loyalty, "StaticStampCooldown");

    await increaseTime(staticCooldown);

    await expect(loyalty.connect(user).collectStaticStamp(programId))
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 0, 2);

    const progress = await loyalty.getProgress(user.address, programId);
    expect(progress.stamps).to.equal(2);
    expect(await loyalty.getUserProgramIds(user.address)).to.deep.equal([programId]);
    expect(await loyalty.getProgramParticipants(programId)).to.deep.equal([user.address]);
  });

  it("blocks static QR stamps when inactive or disabled", async function () {
    const { loyalty, owner, user, programId } = await deployFixture();

    await loyalty
      .connect(owner)
      .updateProgram(programId, programName, iconUrl, rewardDescription, stampsRequired, false, true);

    await expect(
      loyalty.connect(user).collectStaticStamp(programId)
    ).to.be.revertedWithCustomError(loyalty, "ProgramInactive");

    await loyalty
      .connect(owner)
      .updateProgram(programId, programName, iconUrl, rewardDescription, stampsRequired, true, false);

    await expect(
      loyalty.connect(user).collectStaticStamp(programId)
    ).to.be.revertedWithCustomError(loyalty, "StaticStampDisabled");
  });

  it("lets only the owner issue manual stamps", async function () {
    const { loyalty, owner, user, stranger, programId } = await deployFixture();

    await expect(
      loyalty.connect(stranger).issueManualStamp(programId, user.address)
    ).to.be.revertedWithCustomError(loyalty, "NotProgramOwner");

    await expect(loyalty.connect(owner).issueManualStamp(programId, user.address))
      .to.emit(loyalty, "StampIssued")
      .withArgs(programId, user.address, 2, 1);
  });

  it("collects a dynamic QR stamp once with a valid owner signature", async function () {
    const { loyalty, owner, user, programId } = await deployFixture();

    const nonce = encodeBytes32String("visit-1");
    const expiresAt = await futureExpiry();
    const signature = await signDynamicStamp({
      loyalty,
      signer: owner,
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

  it("burns stamps on claim and lets only the owner consume once", async function () {
    const { loyalty, owner, user, stranger, programId } = await deployFixture();

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
    ).to.be.revertedWithCustomError(loyalty, "NotProgramOwner");

    await expect(loyalty.connect(owner).consumeReward(1n))
      .to.emit(loyalty, "RewardConsumed")
      .withArgs(1n, programId, owner.address, user.address);

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
