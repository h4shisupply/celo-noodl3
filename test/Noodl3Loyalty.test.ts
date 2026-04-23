import { expect } from "chai";
import { encodeBytes32String, parseUnits } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Noodl3Loyalty", function () {
  const storeId = encodeBytes32String("choices-bar");
  const secondStoreId = encodeBytes32String("lapa-cafe");
  const purchaseAmount = parseUnits("16", 6);
  const rewardValue = parseUnits("1", 18);
  const minPurchaseAmount = parseUnits("12", 18);

  async function deployFixture() {
    const [owner, manager, payout, user, stranger] = await ethers.getSigners();

    const usdt = (await ethers.deployContract("MockERC20", [
      "Tether USD",
      "USDT",
      6
    ])) as any;
    const usdc = (await ethers.deployContract("MockERC20", [
      "USD Coin",
      "USDC",
      6
    ])) as any;
    const cusd = (await ethers.deployContract("MockERC20", [
      "Celo Dollar",
      "cUSD",
      18
    ])) as any;
    const otherToken = (await ethers.deployContract("MockERC20", [
      "Other Dollar",
      "ODLR",
      18
    ])) as any;
    const loyalty = (await ethers.deployContract("Noodl3Loyalty")) as any;

    await loyalty.configureStore(
      storeId,
      payout.address,
      manager.address,
      await usdt.getAddress(),
      minPurchaseAmount,
      1,
      10,
      1,
      rewardValue,
      true
    );
    await loyalty.configureStoreAcceptedTokens(
      storeId,
      [await usdt.getAddress(), await usdc.getAddress(), await cusd.getAddress()],
      [6, 6, 18]
    );

    await usdt.mint(user.address, parseUnits("500", 6));
    await usdc.mint(user.address, parseUnits("500", 6));
    await cusd.mint(user.address, parseUnits("500", 18));
    await otherToken.mint(user.address, parseUnits("500", 18));

    return {
      loyalty,
      usdt,
      usdc,
      cusd,
      otherToken,
      owner,
      manager,
      payout,
      user,
      stranger
    };
  }

  it("creates and updates store config", async function () {
    const { loyalty, usdt, payout, manager } = await deployFixture();

    let store = await loyalty.getStore(storeId);
    expect(store.payout).to.equal(payout.address);
    expect(store.manager).to.equal(manager.address);
    expect(store.token).to.equal(await usdt.getAddress());
    expect(store.stampsRequired).to.equal(10);
    expect(store.rewardType).to.equal(1);
    expect(store.active).to.equal(true);

    await loyalty.configureStore(
      storeId,
      payout.address,
      manager.address,
      await usdt.getAddress(),
      minPurchaseAmount,
      2,
      12,
      0,
      parseUnits("8", 18),
      false
    );

    store = await loyalty.getStore(storeId);
    expect(store.stampsPerPurchase).to.equal(2);
    expect(store.stampsRequired).to.equal(12);
    expect(store.rewardType).to.equal(0);
    expect(store.active).to.equal(false);
  });

  it("records purchase transfers and stamps progress per store", async function () {
    const { loyalty, usdt, payout, user } = await deployFixture();

    await usdt.connect(user).approve(await loyalty.getAddress(), purchaseAmount);

    await expect(
      loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, "chopp-choices")
    )
      .to.emit(loyalty, "PurchaseRecorded")
      .withArgs(
        storeId,
        user.address,
        await usdt.getAddress(),
        purchaseAmount,
        "chopp-choices",
        1,
        1,
        payout.address
      );

    expect(await usdt.balanceOf(payout.address)).to.equal(purchaseAmount);

    const progress = await loyalty.getProgress(user.address, storeId);
    expect(progress.stamps).to.equal(1);
    expect(progress.stampsRequired).to.equal(10);
    expect(progress.canClaim).to.equal(false);
  });

  it("tracks store participants once per buyer and keeps them isolated by store", async function () {
    const { loyalty, usdt, payout, manager, user, stranger } = await deployFixture();

    await loyalty.configureStore(
      secondStoreId,
      payout.address,
      manager.address,
      await usdt.getAddress(),
      minPurchaseAmount,
      1,
      8,
      0,
      parseUnits("6", 18),
      true
    );
    await loyalty.configureStoreAcceptedTokens(
      secondStoreId,
      [await usdt.getAddress()],
      [6]
    );

    await usdt.connect(user).approve(await loyalty.getAddress(), purchaseAmount * 3n);
    await usdt.mint(stranger.address, parseUnits("50", 6));
    await usdt.connect(stranger).approve(await loyalty.getAddress(), purchaseAmount);

    await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, "first-order");
    await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, "second-order");
    await loyalty.connect(stranger).purchase(storeId, await usdt.getAddress(), purchaseAmount, "guest-order");
    await loyalty.connect(user).purchase(secondStoreId, await usdt.getAddress(), purchaseAmount, "coffee-order");

    const firstStoreParticipants = await loyalty.getStoreParticipants(storeId);
    expect(firstStoreParticipants).to.deep.equal([user.address, stranger.address]);

    const secondaryStoreParticipants = await loyalty.getStoreParticipants(secondStoreId);
    expect(secondaryStoreParticipants).to.deep.equal([user.address]);
  });

  it("fails purchase for inactive store", async function () {
    const { loyalty, usdt, payout, manager, user } = await deployFixture();

    await loyalty.configureStore(
      storeId,
      payout.address,
      manager.address,
      await usdt.getAddress(),
      minPurchaseAmount,
      1,
      10,
      1,
      rewardValue,
      false
    );

    await usdt.connect(user).approve(await loyalty.getAddress(), purchaseAmount);

    await expect(
      loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, "chopp-choices")
    ).to.be.revertedWithCustomError(loyalty, "StoreInactive");
  });

  it("fails purchase when the token is not supported by the store", async function () {
    const { loyalty, otherToken, user } = await deployFixture();

    await otherToken
      .connect(user)
      .approve(await loyalty.getAddress(), purchaseAmount);

    await expect(
      loyalty.connect(user).purchase(storeId, await otherToken.getAddress(), purchaseAmount, "wrong-token")
    ).to.be.revertedWithCustomError(loyalty, "UnsupportedToken");
  });

  it("fails purchase below the store minimum", async function () {
    const { loyalty, usdt, user } = await deployFixture();

    const smallAmount = parseUnits("5", 6);
    await usdt.connect(user).approve(await loyalty.getAddress(), smallAmount);

    await expect(
      loyalty.connect(user).purchase(storeId, await usdt.getAddress(), smallAmount, "tiny-order")
    ).to.be.revertedWithCustomError(loyalty, "AmountBelowMinimum");
  });

  it("accepts multiple supported stablecoins equally", async function () {
    const { loyalty, usdc, cusd, payout, user } = await deployFixture();

    const usdcPurchaseAmount = parseUnits("16", 6);
    const cusdPurchaseAmount = parseUnits("16", 18);

    await usdc.connect(user).approve(await loyalty.getAddress(), usdcPurchaseAmount);
    await cusd.connect(user).approve(await loyalty.getAddress(), cusdPurchaseAmount);

    await loyalty
      .connect(user)
      .purchase(storeId, await usdc.getAddress(), usdcPurchaseAmount, "usdc-order");
    await loyalty
      .connect(user)
      .purchase(storeId, await cusd.getAddress(), cusdPurchaseAmount, "cusd-order");

    expect(await usdc.balanceOf(payout.address)).to.equal(usdcPurchaseAmount);
    expect(await cusd.balanceOf(payout.address)).to.equal(cusdPurchaseAmount);

    const progress = await loyalty.getProgress(user.address, storeId);
    expect(progress.stamps).to.equal(2);
  });

  it("fails to claim before the threshold is reached", async function () {
    const { loyalty, usdt, user } = await deployFixture();

    await usdt.connect(user).approve(await loyalty.getAddress(), purchaseAmount);
    await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, "first-order");

    await expect(
      loyalty.connect(user).claimReward(storeId)
    ).to.be.revertedWithCustomError(loyalty, "NotEnoughStamps");
  });

  it("burns stamps on claim and allows a manager to consume once", async function () {
    const { loyalty, usdt, user, manager } = await deployFixture();

    await usdt
      .connect(user)
      .approve(await loyalty.getAddress(), purchaseAmount * 10n);

    for (let i = 0; i < 10; i += 1) {
      await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, `order-${i}`);
    }

    await expect(loyalty.connect(user).claimReward(storeId))
      .to.emit(loyalty, "RewardClaimed")
      .withArgs(1n, storeId, user.address, 1, rewardValue, 10);

    const progress = await loyalty.getProgress(user.address, storeId);
    expect(progress.stamps).to.equal(0);
    expect(progress.canClaim).to.equal(false);

    const claim = await loyalty.getClaim(1n);
    expect(claim.user).to.equal(user.address);
    expect(claim.consumed).to.equal(false);
    expect(await loyalty.getUserClaimIds(user.address)).to.deep.equal([1n]);
    expect(await loyalty.getStoreClaimIds(storeId)).to.deep.equal([1n]);

    await expect(loyalty.connect(manager).consumeReward(1n))
      .to.emit(loyalty, "RewardConsumed")
      .withArgs(1n, storeId, manager.address, user.address);

    const consumedClaim = await loyalty.getClaim(1n);
    expect(consumedClaim.consumed).to.equal(true);
    expect(consumedClaim.consumedAt).to.not.equal(0);
  });

  it("prevents non-managers from consuming claims", async function () {
    const { loyalty, usdt, user, stranger } = await deployFixture();

    await usdt
      .connect(user)
      .approve(await loyalty.getAddress(), purchaseAmount * 10n);

    for (let i = 0; i < 10; i += 1) {
      await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, `order-${i}`);
    }

    await loyalty.connect(user).claimReward(storeId);

    await expect(
      loyalty.connect(stranger).consumeReward(1n)
    ).to.be.revertedWithCustomError(loyalty, "NotStoreManager");
  });

  it("prevents reusing a consumed claim", async function () {
    const { loyalty, usdt, user, manager } = await deployFixture();

    await usdt
      .connect(user)
      .approve(await loyalty.getAddress(), purchaseAmount * 10n);

    for (let i = 0; i < 10; i += 1) {
      await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, `order-${i}`);
    }

    await loyalty.connect(user).claimReward(storeId);
    await loyalty.connect(manager).consumeReward(1n);

    await expect(
      loyalty.connect(manager).consumeReward(1n)
    ).to.be.revertedWithCustomError(loyalty, "ClaimAlreadyConsumed");
  });

  it("indexes claim ids by user and by store", async function () {
    const { loyalty, usdt, payout, manager, user, stranger } = await deployFixture();

    await loyalty.configureStore(
      secondStoreId,
      payout.address,
      manager.address,
      await usdt.getAddress(),
      minPurchaseAmount,
      1,
      5,
      0,
      parseUnits("4", 18),
      true
    );
    await loyalty.configureStoreAcceptedTokens(
      secondStoreId,
      [await usdt.getAddress()],
      [6]
    );

    await usdt.mint(stranger.address, parseUnits("500", 6));
    await usdt.connect(user).approve(await loyalty.getAddress(), purchaseAmount * 15n);
    await usdt.connect(stranger).approve(await loyalty.getAddress(), purchaseAmount * 5n);

    for (let i = 0; i < 10; i += 1) {
      await loyalty.connect(user).purchase(storeId, await usdt.getAddress(), purchaseAmount, `user-main-${i}`);
    }

    for (let i = 0; i < 5; i += 1) {
      await loyalty.connect(stranger).purchase(secondStoreId, await usdt.getAddress(), purchaseAmount, `guest-${i}`);
    }

    await loyalty.connect(user).claimReward(storeId);
    await loyalty.connect(stranger).claimReward(secondStoreId);

    expect(await loyalty.getUserClaimIds(user.address)).to.deep.equal([1n]);
    expect(await loyalty.getUserClaimIds(stranger.address)).to.deep.equal([2n]);
    expect(await loyalty.getStoreClaimIds(storeId)).to.deep.equal([1n]);
    expect(await loyalty.getStoreClaimIds(secondStoreId)).to.deep.equal([2n]);
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
