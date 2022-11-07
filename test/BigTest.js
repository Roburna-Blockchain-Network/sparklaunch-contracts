const { ethers } = require("hardhat");
const { expect } = require("chai");
const ethUtil = require("ethereumjs-util")
const {BigNumber} = require("ethers");

describe("SparklaunchSale", function() {

  let Admin;
  let SparklaunchSale;
  let SaleToken;
  let SalesFactory;
  let deployer, alice, bob, cedric;
  let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  let ONE_ADDRESS = "0x0000000000000000000000000000000000000001";

  const DECIMALS = 18; // Working with non-18 decimals
  const MULTIPLIER = (10 ** DECIMALS).toString();
  const REV = (10 ** (18-DECIMALS)).toString();


  
  
  
  const DOUBLE_HARD_CAP = ethers.utils.parseEther('2000');
  const FIRST_ROUND = 1;
  const MIDDLE_ROUND = 2;
  const LAST_ROUND = 3;
  const PARTICIPATION_AMOUNT = ethers.utils.parseEther('1');
  const PARTICIPATION_ROUND = 1;
  const PARTICIPATION_VALUE = ethers.utils.parseEther('1');

  const router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
  const serviceFee = 100; 
  const minP = ethers.utils.parseEther('0.05');
  const maxP = ethers.utils.parseEther('5');
  const lpPerc = 5100;
  const pcsListingRate = ethers.utils.parseEther('200');
  const lpLockDelta = 100;
  const TOKEN_PRICE_IN_BNB = ethers.utils.parseEther('0.002');
  const SALE_END_DELTA = 10000;
  const PUBLIC_ROUND_DELTA = 10;
  const SOFT_CAP = ethers.utils.parseEther('500');
  const HARD_CAP = ethers.utils.parseEther('1000');
  const ROUNDS_START_DELTAS = [50, 70, 90, 100, 110];




  function firstOrDefault(first, key, def) {
    if (first && first[key] !== undefined) {
      return first[key];
    }
    return def;
  }


  function participate(params) {
    const registrant = firstOrDefault(params, 'sender', deployer);
    const participationRound = firstOrDefault(params, "participationRound", PARTICIPATION_ROUND);
    const value = firstOrDefault(params, "participationValue", PARTICIPATION_VALUE);
    return SparklaunchSale.connect(registrant).participate(participationRound, {value: value});
  }

  async function getCurrentBlockTimestamp() {
    return (await ethers.provider.getBlock('latest')).timestamp;
  }


  beforeEach(async function() {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
    cedric = accounts[3];

    const SaleTokenFactory = await ethers.getContractFactory("SaleToken");
    SaleToken = await SaleTokenFactory.deploy();

    const AdminFactory = await ethers.getContractFactory("Admin");
    Admin = await AdminFactory.deploy([deployer.address, alice.address, bob.address]);

    const SalesFactoryFactory = await ethers.getContractFactory("SalesFactory");
    SalesFactory = await SalesFactoryFactory.deploy(Admin.address);

    const blockTimestamp = await getCurrentBlockTimestamp();
    
    const ROUNDS_START_DELTAS = [50, 70, 90, 100, 110];

    const startTimes =  ROUNDS_START_DELTAS.map((s) => blockTimestamp+s);

    const saleEnds = blockTimestamp + 10000;
    console.log(blockTimestamp, 'blockTimestamp');
    console.log(saleEnds, 'saleEnds');
    console.log(startTimes, 'startTimes');
    const saleStarts = blockTimestamp + 10;
    const saleContract = await ethers.getContractFactory("SparklaunchSale");

    await SaleToken.approve(SalesFactory.address, ethers.utils.parseEther("900000000"));
    await SalesFactory.setFeeAddr(cedric.address);
    await SalesFactory.setServiceFee(100);
    await SalesFactory.deployNormalSale(
      [router, Admin.address, cedric.address, SaleToken.address, deployer.address], 
      [serviceFee, minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKEN_PRICE_IN_BNB, 
       saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
      [deployer.address, alice.address, bob.address],
      [1, 2, 3],
      startTimes,
      1);
    const SparklaunchSaleFactory = await ethers.getContractFactory("SparklaunchSale");
    SparklaunchSale = SparklaunchSaleFactory.attach(await SalesFactory.allSales(0));
  });

  context.only("Setup", async function() {
    it("Should setup the token correctly", async function() {
      // Given
      let admin = await SparklaunchSale.admin();

      const sale = await SparklaunchSale.sale();
      console.log(sale);
      
      // Then
      expect(admin).to.equal(Admin.address);
    });

    describe("Edge Cases & Miscellaneous", async function () {
      

      it("Remove stuck tokens", async () => {
        // Given
        const TokenFactory = await ethers.getContractFactory("SaleToken");
        const testToken = await TokenFactory.deploy();

        // When
        const val = 1000;
        await testToken.transfer(SparklaunchSale.address, val);

        // Then
        await SparklaunchSale.removeStuckTokens(testToken.address, alice.address);

        expect(await testToken.balanceOf(alice.address)).to.equal(val);
      });

      it("Should not remove SaleToken using removeStuckTokens", async () => {

        await expect(SparklaunchSale.removeStuckTokens(SaleToken.address, alice.address))
          .to.be.revertedWith("Can't withdraw sale token.");
      });
    });

   
  });


  context("Participation", async function() {
    describe("Participate", async function() {
      it("Should allow user to participate", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");


        // When
        await participate();

        // Then
        const sale = await SparklaunchSale.sale();
        const isParticipated = await SparklaunchSale.isParticipated(deployer.address);
        const participation = await SparklaunchSale.userToParticipation(deployer.address);


        expect(sale.totalTokensSold).to.equal(Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB * MULTIPLIER));
        expect(sale.totalBNBRaised).to.equal(PARTICIPATION_VALUE);
        expect(isParticipated).to.be.true;
        expect(participation.amountBought).to.equal(Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB * MULTIPLIER));
        expect(participation.tierId).to.equal(PARTICIPATION_ROUND);
        expect(await SparklaunchSale.getNumberOfRegisteredUsers()).to.equal(1);
      });

      it("Should allow multiple users to participate", async function() {
        const blockTimestamp = await getCurrentBlockTimestamp();

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2] + blockTimestamp]);
        await ethers.provider.send("evm_mine");

        // When
        await participate();
        await participate({sender: alice});

        // Then
        const sale = await SparklaunchSale.sale();
        const isParticipatedDeployer = await SparklaunchSale.isParticipated(deployer.address);
        const isParticipatedAlice = await SparklaunchSale.isParticipated(alice.address);
        const participationDeployer = await SparklaunchSale.userToParticipation(deployer.address);
        const participationAlice = await SparklaunchSale.userToParticipation(alice.address);

        expect(sale.totalTokensSold).to.equal(Math.floor(2 * PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB * MULTIPLIER));
        expect(sale.totalBNBRaised).to.equal(BigNumber.from(PARTICIPATION_VALUE).mul(2));
        expect(isParticipatedDeployer).to.be.true;
        expect(isParticipatedAlice).to.be.true;
        expect(participationDeployer.amountBought).to.equal(Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB * MULTIPLIER));
        expect(participationDeployer.tierId).to.equal(PARTICIPATION_ROUND);
        // expect(participationDeployer.isWithdrawn).to.be.false;
        expect(participationAlice.amountBought).to.equal(Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB * MULTIPLIER));
        expect(participationAlice.tierId).to.equal(PARTICIPATION_ROUND);
        // expect(participationAlice.isWithdrawn).to.be.false;
      });


      it("Should not participate twice", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate();

        // Then
        await expect(participate())
          .to.be.revertedWith("Already participated.");
      });



      it("Should not participate in a round that has not started", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[5] + 10]);
        await ethers.provider.send("evm_mine");

        SparklaunchSale.connect(cedric).participate(0, {value: 150});

      });


      it("Should emit TokensSold event", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        // Then
        await expect(participate()).to.emit(SparklaunchSale, "TokensSold").withArgs(deployer.address, Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB * MULTIPLIER));
      });


      it("Should fail if buying 0 tokens", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        // Then
        await expect(participate({participationValue: 0})).to.be.reverted;
      });
    });

    describe("Withdraw tokens", async function() {
      it("Should withdraw user's tokens", async function() {
        const withdrawAmount = (PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB)  * MULTIPLIER;
        console.log(withdrawAmount)
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate();

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");

        await SparklaunchSale.finishSale();

        // console.log(await SparklaunchSale.getParticipation(deployer.address));

        await SaleToken.transfer(SparklaunchSale.address, "10000000000000000000");
        const previousBalance = ethers.BigNumber.from(await SaleToken.balanceOf(deployer.address));

        // When
        await SparklaunchSale.withdraw();

        // Then
        const currentBalance = ethers.BigNumber.from(await SaleToken.balanceOf(deployer.address));
        // console.log(parseInt(currentBalance))
        
        // console.log(withdrawAmount)
        expect(currentBalance).to.equal(previousBalance.add(Math.floor(withdrawAmount)));
      });


      it("Should not withdraw twice", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate();

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");

        await SparklaunchSale.finishSale()

        await SaleToken.transfer(SparklaunchSale.address, "10000000000000000000");
        await SparklaunchSale.withdraw();

        
        await expect(SparklaunchSale.withdraw()).to.be.revertedWith("Already withdrawn");
      });

      it("Should not withdraw before sale end", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate();


        // Then
        await expect(SparklaunchSale.withdraw()).to.be.revertedWith("Sale is running");
      });

      it("Should emit TokensWithdrawn event", async function() {
      
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate();
        await SaleToken.transfer(SparklaunchSale.address, "10000000000000000000");

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");

        await SparklaunchSale.finishSale();

        // Then
        await expect(SparklaunchSale.withdraw()).to.emit(SparklaunchSale, "TokensWithdrawn").withArgs(deployer.address, Math.floor(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB  * MULTIPLIER));
      });

    });

    describe("Withdraw earnings and leftover", async function() {
      it("Should withdraw sale owner's earnings and leftovers", async function() {
       


        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate();

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        const previousBalance = await ethers.provider.getBalance(deployer.address);
        const previousTokenBalance = await SaleToken.balanceOf(deployer.address);

        const sale = await SparklaunchSale.sale();
        // console.log(parseInt(sale.amountOfTokensToSell), parseInt(sale.totalTokensSold));
        await SparklaunchSale.finishSale()
        // When
        await SparklaunchSale.withdrawEarningsAndLeftover();

        // Then
        const currentBalance = await ethers.provider.getBalance(deployer.address);
        const contractBalance = await ethers.provider.getBalance(SparklaunchSale.address);
        const currentTokenBalance = await SaleToken.balanceOf(deployer.address);
        const contractTokenBalance = await SaleToken.balanceOf(SparklaunchSale.address);

        // TODO:
        expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
        expect(currentTokenBalance).to.equal(previousTokenBalance.add((AMOUNT_OF_TOKENS_TO_SELL - PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB)));
        expect(contractBalance).to.equal(0);
        expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB);
      });

      it("Should withdraw sale owner's earnings and leftovers separately", async function() {
      

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate({sender: alice});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");
        
        await SparklaunchSale.finishSale();

        const previousBalance = await ethers.provider.getBalance(deployer.address);
        const previousTokenBalance = await SaleToken.balanceOf(deployer.address);

        const sale = await SparklaunchSale.sale();
        console.log(parseInt(sale.hardCap), parseInt(sale.totalTokensSold));

        // When
        await SparklaunchSale.withdrawEarnings();

        await SparklaunchSale.withdrawLeftover();

        // Then
        const currentBalance = await ethers.provider.getBalance(deployer.address);
        const contractBalance = await ethers.provider.getBalance(SparklaunchSale.address);
        const currentTokenBalance = await SaleToken.balanceOf(deployer.address);
        const contractTokenBalance = await SaleToken.balanceOf(SparklaunchSale.address);

        // TODO:
         expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
         expect(currentTokenBalance).to.equal(previousTokenBalance.add((AMOUNT_OF_TOKENS_TO_SELL - PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB)));
         expect(contractBalance).to.equal(0);
         expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB);
      });

      it("Should not withdraw twice", async function() {
       

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate({sender: alice});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await SparklaunchSale.finishSale();

        await SparklaunchSale.withdrawEarningsAndLeftover();

        // Then
        await expect(SparklaunchSale.withdrawEarningsAndLeftover()).to.be.reverted;
      });

      it("Should not withdraw before sale ended", async function() {

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate({sender: alice});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0] - 15]);
        await ethers.provider.send("evm_mine");

        // Then
        await expect(SparklaunchSale.withdrawEarningsAndLeftover()).to.be.reverted;
      });

      it("Should not allow non-sale owner to withdraw", async function() {
    
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate({sender: alice});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await SparklaunchSale.finishSale();

        // Then
        await expect(SparklaunchSale.connect(bob).withdrawEarningsAndLeftover()).to.be.revertedWith("Restricted to sale owner.");
      });


      //TODO:
      xit("Should not crash if earnings are 0", async function() {
        // Given
        await runFullSetup();


        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        const previousBalance = await ethers.provider.getBalance(deployer.address);
        const previousTokenBalance = await SaleToken.balanceOf(deployer.address);

        // When
        await SparklaunchSale.finishSale();
        await SparklaunchSale.withdrawEarningsAndLeftover();

        // Then
        const currentBalance = await ethers.provider.getBalance(deployer.address);
        const contractBalance = await ethers.provider.getBalance(SparklaunchSale.address);
        const currentTokenBalance = await SaleToken.balanceOf(deployer.address);
        const contractTokenBalance = await SaleToken.balanceOf(SparklaunchSale.address);

        expect(currentBalance).to.equal(previousBalance);
        expect(currentTokenBalance).to.equal(previousTokenBalance.add(AMOUNT_OF_TOKENS_TO_SELL));
        expect(contractBalance).to.equal(0);
        expect(contractTokenBalance).to.equal(0);
      });

    });

    describe("Get current round", async function() {
      it("Should return 0 if sale didn't start yet", async function() {
        // Given
        await runFullSetup();

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(0);
      });

      it("Should return correct roundId at very beginning of first round", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(1);
      });

      it("Should return correct roundId at very beginning of middle round", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[1]]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(2);
      });

      it("Should return correct roundId at very beginning of last round", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(3);
      });

      it("Should return correct roundId if first round is active", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0] + 5]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(1);
      });

      it("Should return correct roundId if middle round is active", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[1] + 5]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(2);
      });

      it("Should return correct roundId if last round is active", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2] + 1]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(3);
      });

      it("Should return 0 if sale already ended", async function() {
        // Given
        await runFullSetup();

        // When
        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");

        // Then
        expect(await SparklaunchSale.getCurrentRound()).to.equal(0);
      });
    });
 });

  context("Finish Sale", async function(){

    describe.only("Finish sale", async function(){
       
      it("Make sure sale get’s cancelled when soft cap not reached", async function(){
         // Given

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");


        // When
        await SparklaunchSale.finishSale();
        expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
        expect(await SparklaunchSale.saleFinished()).to.be.true;

      });

      it("Make sure sale doesn’t get cancelled when soft cap reached", async function(){
        // Given
        this.provider = ethers.provider;

       await SparklaunchSale.changeLpPercentage(10000);
       
       const tierA = await SparklaunchSale.tier(alice.address);
       console.log(tierA,'tierA');
       await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
       await ethers.provider.send("evm_mine");

       //await SparklaunchSale.participate(1, {value: ethers.utils.parseEther('2')});
       const previoussBalance = await ethers.provider.getBalance(deployer.address);
       console.log(previoussBalance,'previoussBalance');
       const previoussBalancea = await ethers.provider.getBalance(alice.address);
       console.log(previoussBalancea,'previoussBalancea');
       //participate({participationValue: ethers.utils.parseEther("2")});
       //participate({registrant: alice});
       await SparklaunchSale.participate(1, {value: ethers.utils.parseEther('2')});
       //await SparklaunchSale.connect(alice).participate(2, {value: ethers.utils.parseEther('1')});
       const current = await ethers.provider.getBalance(deployer.address);
       console.log(current,'current');
       const currenta = await ethers.provider.getBalance(alice.address);
       console.log(currenta,'currenta');

       const dP = await SparklaunchSale.getParticipation(deployer.address);
       const aP = await SparklaunchSale.getParticipation(alice.address);
       console.log(dP, 'dP');
       console.log(aP, 'aP');

       await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
       await ethers.provider.send("evm_mine");

       const contractBalanceel = await ethers.provider.getBalance(SparklaunchSale.address);
       const contractBalancee2l = await ethers.utils.formatEther(contractBalanceel);
       console.log(contractBalancee2l, 'contractBalancee2l');
       
       //await SaleToken.connect(SparklaunchSale).approve("0x10ed43c718714eb63d5aa57b78b54704e256024e", ethers.utils.parseEther('300000'));
       // When
       await SparklaunchSale.finishSale();
       this.pairAddress = await SparklaunchSale.defaultPair()
        console.log(this.pairAddress, "pair addr");
        this.pair = new ethers.Contract(
          this.pairAddress,
          ['function totalSupply() external view returns (uint)','function balanceOf(address owner) external view returns (uint)','function approve(address spender, uint value) external returns (bool)','function decimals() external pure returns (uint8)','function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'],
          this.provider
        )
        this.pairsigner =this.pair.connect(deployer) 
        const BNBAmountForLiquidity = await SparklaunchSale.BNBAmountForLiquidity();
        const BNBAmountForLiquidity2 = await ethers.utils.formatEther(BNBAmountForLiquidity);
        console.log(BNBAmountForLiquidity2);
       //const reserves =  await this.pair.getReserves();
       //console.log(reserves);
       const previousBalance = await ethers.provider.getBalance(deployer.address);
       const previousBalanceCedric = await ethers.provider.getBalance(cedric.address);
       const previousTokenBalance = await SaleToken.balanceOf(deployer.address);
       const contractBalancee = await ethers.provider.getBalance(SparklaunchSale.address);
       const contractBalancee2 = await ethers.utils.formatEther(contractBalancee);
       console.log(contractBalancee2, 'contractBalancee2');

       const sale = await SparklaunchSale.sale();
       console.log(parseInt(sale.hardCap), parseInt(sale.totalTokensSold)); 
       // When
       await SparklaunchSale.withdrawEarnings(); 
       await SparklaunchSale.withdrawLeftover(); 
       // Then
       const currentBalance = await ethers.provider.getBalance(deployer.address);
       const currentBalanceCedric = await ethers.provider.getBalance(cedric.address);
       const contractBalance = await ethers.provider.getBalance(SparklaunchSale.address);
       const currentTokenBalance = await SaleToken.balanceOf(deployer.address);
       const contractTokenBalance = await SaleToken.balanceOf(SparklaunchSale.address);
       console.log(previousBalance, 'previousBalance'); 
       console.log(currentBalance, 'currentBalance'); 
       console.log(previousBalanceCedric, 'previousBalanceCedric'); 
       console.log(currentBalanceCedric, 'currentBalanceCedric');

       expect(await SparklaunchSale.isSaleSuccessful()).to.be.true;
       expect(await SparklaunchSale.saleFinished()).to.be.true;

     });
    });

    describe("Withdraw after finish sale if sale successful", async function(){
       
      it("Make sure if sale successful users can withdraw sale tokens", async function(){
         // Given
        const withdrawAmount = (PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB)  * MULTIPLIER;
        await runFullSetup();

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
        await ethers.provider.send("evm_mine");

        participate();

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");

        await SparklaunchSale.finishSale();
        await SaleToken.transfer(SparklaunchSale.address, "10000000000000000000");
        const previousBalance = ethers.BigNumber.from(await SaleToken.balanceOf(deployer.address));
        console.log(parseInt(previousBalance))

        // When
        await SparklaunchSale.withdraw();

        // Then
        const currentBalance = ethers.BigNumber.from(await SaleToken.balanceOf(deployer.address));
        console.log(parseInt(currentBalance))
        
         console.log(withdrawAmount)
        expect(currentBalance).to.equal(previousBalance.add(Math.floor(withdrawAmount)));
      });

      it("Make sure if sale successful sale owner can withdraw earnings+leftover", async function(){
        // Given
        await runFullSetup();


        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate({sender: alice});
        await participate({participationAmount: 1000 * REV});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        const previousBalance = await ethers.provider.getBalance(deployer.address);
        const previousBalanceCedric = await ethers.provider.getBalance(cedric.address);
        console.log(previousBalanceCedric)
        const previousTokenBalance = await SaleToken.balanceOf(deployer.address);

        const sale = await SparklaunchSale.sale();
        await SparklaunchSale.finishSale();
        // When
        await SparklaunchSale.withdrawEarnings();

        let addr = await SparklaunchSale.feeAddr();
        let fee = await SparklaunchSale.serviceFee();
        console.log(addr, fee);

        // Then
        const currentBalance = await ethers.provider.getBalance(deployer.address);
        const currentBalanceCedric = await ethers.provider.getBalance(cedric.address);
        console.log(currentBalanceCedric)
        const contractBalance = await ethers.provider.getBalance(SparklaunchSale.address);
        const currentTokenBalance = await SaleToken.balanceOf(deployer.address);
        const contractTokenBalance = await SaleToken.balanceOf(SparklaunchSale.address);

        // TODO:
        expect(currentBalance).to.equal(previousBalance.add(PARTICIPATION_VALUE));
        expect(currentTokenBalance).to.equal(previousTokenBalance.add((AMOUNT_OF_TOKENS_TO_SELL - PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB)));
        expect(contractBalance).to.equal(0);
        expect(contractTokenBalance).to.equal(PARTICIPATION_VALUE / TOKEN_PRICE_IN_BNB);

  
      });

      it("When withdrawing earnings should take fee", async function(){
        // Given
        await runFullSetup();


        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        await participate({sender: alice});
        await participate({participationAmount: 1000 * REV});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        const previousBalanceCedric = await ethers.provider.getBalance(cedric.address);
        console.log(previousBalanceCedric)

        await SparklaunchSale.finishSale();
        // When
        await SparklaunchSale.withdrawEarnings();

        let addr = await SparklaunchSale.feeAddr();
        let fee = await SparklaunchSale.serviceFee();
        console.log(addr, fee);

        // Then
        const currentBalanceCedric = await ethers.provider.getBalance(cedric.address);
        console.log(currentBalanceCedric)
  
      });

      it("Make sure if sale successful users can not withdraw deposited bnb", async function(){
      
        // Given
        await runFullSetup();

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
        await ethers.provider.send("evm_mine");
 
        participate({participationAmount: 100 * REV})
 
        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
        await ethers.provider.send("evm_mine");
 
        // When
        await SparklaunchSale.finishSale();
        await SparklaunchSale.withdrawUserFundsIfSaleCancelled()
        expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
        expect(await SparklaunchSale.saleFinished()).to.be.true;
        await expect(SparklaunchSale.withdrawUserFundsIfSaleCancelled()).to.be.revertedWith("Sale wasn't cancelled.");
  
      });

      it("Make sure if sale successful sale owner can not withdraw deposited tokens", async function(){
       // Given
       await runFullSetup();

       await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
       await ethers.provider.send("evm_mine");

       participate({participationAmount: 100 * REV})

       await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
       await ethers.provider.send("evm_mine");

       // When
       await SparklaunchSale.finishSale();
       await SparklaunchSale.withdrawDepositedTokensIfSaleCancelled()
       expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
       expect(await SparklaunchSale.saleFinished()).to.be.true;
       await expect(SparklaunchSale.withdrawDepositedTokensIfSaleCancelled()).to.be.revertedWith("Sale wasn't cancelled.");

  
      });
    });

    describe("Withdraw after finish sale if sale cancelled", async function(){

      it("Make sure if sale cancelled sale owner can not withdraw earnings+leftover", async function(){

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        
        participate({participationValue: ethers.utils.parseEther("0.05")});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

    
        await SparklaunchSale.finishSale();

        const sale = await SparklaunchSale.sale();

        expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
       expect(await SparklaunchSale.saleFinished()).to.be.true;
        // When
        await expect(SparklaunchSale.withdrawEarnings()).to.be.reverted;

 
   
      });

      it("Make sure if sale cancelled users can withdraw deposited bnb", async function(){


        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        
        participate({participationValue: ethers.utils.parseEther("0.05")});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        const previousBalance = await ethers.provider.getBalance(deployer.address);
        console.log(previousBalance,'previousBalance');

    
        await SparklaunchSale.finishSale();

        const sale = await SparklaunchSale.sale();

        expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
        expect(await SparklaunchSale.saleFinished()).to.be.true;

        await expect(SparklaunchSale.withdrawUserFundsIfSaleCancelled()).to.be.not.reverted;

        const currentBalance = await ethers.provider.getBalance(deployer.address);
        console.log(currentBalance,'currentBalance');
        await SparklaunchSale.withdrawUserFundsIfSaleCancelled();
      });


      it("Make sure finish sale can be called only after saleEnd", async function(){
    
        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        
        participate({participationValue: ethers.utils.parseEther("0.05")});

  
        await expect(SparklaunchSale.connect(cedric).finishSale()).to.be.reverted;
 
      });


      it("Make sure only the user who have participated can call withdrawUserFundsIfSaleCancelled", async function(){

        await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

        
        participate({participationValue: ethers.utils.parseEther("0.05")});

        await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA - ROUNDS_START_DELTAS[0]]);
        await ethers.provider.send("evm_mine");

    
        await SparklaunchSale.finishSale();

        const sale = await SparklaunchSale.sale();

        expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
        expect(await SparklaunchSale.saleFinished()).to.be.true;

        await expect(SparklaunchSale.connect(alice).withdrawUserFundsIfSaleCancelled()).to.be.reverted;
 
   
      })
    });
      
  });
});