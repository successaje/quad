const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Quad Contract", function () {
    let Quad, quad, Token, token, owner, user1, user2;

    beforeEach(async function () {
        // Get accounts
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy a mock ERC20 token contract for testing
        Token = await ethers.getContractFactory("MockERC20");
        token = await Token.deploy("Test Token", "TT", 100000000);
        console.log("MockERC20 deployed at:", token.address);
        await token.deployed();

        // Deploy the Quad contract with the token address
        Quad = await ethers.getContractFactory("Quad");
        quad = await Quad.deploy(token.address);
        // await quad.deployed();

        // Mint some tokens for users
        await token.transfer(user1.address, ethers.utils.parseEther("1000"));
        await token.transfer(user2.address, ethers.utils.parseEther("1000"));
    });

    it("Should register a user", async function () {
        await quad.connect(user1).registerUser("User1", "user1@example.com", "123456789", 0, "Bio of user1");
        const user = await quad.users(user1.address);

        expect(user.username).to.equal("User1");
        expect(user.email).to.equal("user1@example.com");
        expect(user.phoneNumber).to.equal("123456789");
        expect(user.bio).to.equal("Bio of user1");
        expect(user.registered).to.be.true;
    });

    it("Should update user profile", async function () {
        await quad.connect(user1).registerUser("User1", "user1@example.com", "123456789", 0, "Bio of user1");
        await quad.connect(user1).updateUserProfile("UpdatedUser1", "updated1@example.com", "987654321", "Updated bio");

        const user = await quad.users(user1.address);
        expect(user.username).to.equal("UpdatedUser1");
        expect(user.email).to.equal("updated1@example.com");
        expect(user.phoneNumber).to.equal("987654321");
        expect(user.bio).to.equal("Updated bio");
    });

    it("Should deposit funds for a registered user", async function () {
        await quad.connect(user1).registerUser("User1", "user1@example.com", "123456789", 0, "Bio of user1");

        const depositAmount = ethers.utils.parseEther("100");
        await token.connect(user1).approve(quad.address, depositAmount);
        await quad.connect(user1).depositFunds(depositAmount);

        const user = await quad.users(user1.address);
        expect(user.balance.toString()).to.equal(depositAmount.toString());
    });

    it("Should transfer funds between users", async function () {
        await quad.connect(user1).registerUser("User1", "user1@example.com", "123456789", 0, "Bio of user1");
        await quad.connect(user2).registerUser("User2", "user2@example.com", "987654321", 0, "Bio of user2");

        const depositAmount = ethers.utils.parseEther("100");
        await token.connect(user1).approve(quad.address, depositAmount);
        await quad.connect(user1).depositFunds(depositAmount);

        // Transfer funds from user1 to user2
        const transferAmount = ethers.utils.parseEther("50");
        await quad.connect(user1).transferFunds(user2.address, transferAmount);

        const user1Profile = await quad.users(user1.address);
        const user2Profile = await quad.users(user2.address);

        expect(user1Profile.balance.toString()).to.equal(ethers.utils.parseEther("50").toString());
        expect(user2Profile.balance.toString()).to.equal(transferAmount.toString());
    });

    it("Should fail to deposit funds if user is not registered", async function () {
        const depositAmount = ethers.utils.parseEther("100");
        await token.connect(user1).approve(quad.address, depositAmount);

        await expect(
            quad.connect(user1).depositFunds(depositAmount)
        ).to.be.revertedWith("User not registered");
    });

    it("Should fail to transfer funds if balance is insufficient", async function () {
        await quad.connect(user1).registerUser("User1", "user1@example.com", "123456789", 0, "Bio of user1");
        await quad.connect(user2).registerUser("User2", "user2@example.com", "987654321", 0, "Bio of user2");

        await expect(
            quad.connect(user1).transferFunds(user2.address, ethers.utils.parseEther("10"))
        ).to.be.revertedWith("Insufficient funds");
    });

    it("Should fail to transfer funds if recipient is not registered", async function () {
        await quad.connect(user1).registerUser("User1", "user1@example.com", "123456789", 0, "Bio of user1");

        const depositAmount = ethers.utils.parseEther("100");
        await token.connect(user1).approve(quad.address, depositAmount);
        await quad.connect(user1).depositFunds(depositAmount);

        await expect(
            quad.connect(user1).transferFunds(user2.address, ethers.utils.parseEther("10"))
        ).to.be.revertedWith("Recipient not registered");
    });
});
