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
  const TOKENS_4_1_BNB = ethers.utils.parseEther('400');
  const SALE_END_DELTA = 10000;
  const PUBLIC_ROUND_DELTA = 10;
  const SOFT_CAP = ethers.utils.parseEther('1');
  const HARD_CAP = ethers.utils.parseEther('5');
  const ROUNDS_START_DELTAS = [50, 70, 90, 100, 110];




  function firstOrDefault(first, key, def) {
    if (first && first[key] !== undefined) {
      return first[key];
    }
    return def;
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
      [router, Admin.address, SaleToken.address, deployer.address], 
      [minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKENS_4_1_BNB, 
       saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
      [deployer.address, alice.address, bob.address],
      [1, 2, 3],
      startTimes,
      false);
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
       
    
       await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
       await ethers.provider.send("evm_mine");

       
      
       await SparklaunchSale.participate(1, {value: ethers.utils.parseEther('1')});
       await SparklaunchSale.connect(alice).participate(2, {value: ethers.utils.parseEther('2')});
       await SparklaunchSale.connect(bob).participate(3, {value: ethers.utils.parseEther('0.05')});

      

       await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
       await ethers.provider.send("evm_mine");

       const contractBalanceBNBb4Finish= await ethers.provider.getBalance(SparklaunchSale.address);
       const previousBalanceCedric = await ethers.provider.getBalance(cedric.address);
    
       
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
       const TokensAmountForLiquidity = await SparklaunchSale.tokensAmountForLiquidity();
       const BNBAmountForLiquidity2 = await ethers.utils.formatEther(BNBAmountForLiquidity);
       const TokensAmountForLiquidity2 = await ethers.utils.formatEther(TokensAmountForLiquidity);
       console.log(BNBAmountForLiquidity2, "BNB amount for liquidity");
       console.log(TokensAmountForLiquidity2, "tokens amount for liquidity");

       const reserves =  await this.pair.getReserves();
       console.log(reserves, "reserves");

    

       const sale = await SparklaunchSale.sale();
       
       // When
       await SparklaunchSale.withdrawEarnings(); 
       await SparklaunchSale.connect(alice).withdraw(); 
       await SparklaunchSale.connect(bob).withdraw(); 
       await SparklaunchSale.withdraw();
      
       
       const currentBalanceCedric = await ethers.provider.getBalance(cedric.address);
       const contractBNBBalanceAfterFinish = await ethers.provider.getBalance(SparklaunchSale.address);
       const contractTokenBalanceAfterFinish = await SaleToken.balanceOf(SparklaunchSale.address);
       const bobTokenBalanceAfterFinish = await SaleToken.balanceOf(bob.address);
       const aliceTokenBalanceAfterFinish = await SaleToken.balanceOf(alice.address);

      
       console.log(previousBalanceCedric, 'fee balance before finish'); 
       console.log(currentBalanceCedric, 'fee balance after finish'); 
       console.log(contractBNBBalanceAfterFinish, 'contract bnb balance after finish');
       console.log(contractTokenBalanceAfterFinish, 'contract token balance after finish');
       console.log(bobTokenBalanceAfterFinish, 'bob token balance after finish');
       console.log(aliceTokenBalanceAfterFinish, 'alice token balance after finish');
      

       expect(await SparklaunchSale.isSaleSuccessful()).to.be.true;
       expect(await SparklaunchSale.saleFinished()).to.be.true;

     });

     it("sale  gets cancelled when soft cap reached", async function(){
      // Given
      this.provider = ethers.provider;

     await SparklaunchSale.changeLpPercentage(7000);
     
  
     await ethers.provider.send("evm_increaseTime", [ROUNDS_START_DELTAS[2]]);
     await ethers.provider.send("evm_mine");

  
     await SparklaunchSale.connect(bob).participate(3, {value: ethers.utils.parseEther('0.05')});

   

     await ethers.provider.send("evm_increaseTime", [SALE_END_DELTA]);
     await ethers.provider.send("evm_mine");

    
     const balanceb4Refund = await SaleToken.balanceOf(deployer.address);
     const bobBalanceb4 = await ethers.provider.getBalance(bob.address);
     
     await SparklaunchSale.finishSale();
   

  

     const sale = await SparklaunchSale.sale();
    
     // When
    
     await SparklaunchSale.connect(bob).withdrawUserFundsIfSaleCancelled();
   
     // Then
    
     const contractBalance = await ethers.provider.getBalance(SparklaunchSale.address);

     const bobBalance = await ethers.provider.getBalance(bob.address);
     

     const balanceAfterRefund = await SaleToken.balanceOf(deployer.address);

    
     console.log(balanceAfterRefund, 'balanceAfterRefund');
     console.log(balanceb4Refund, 'balanceb4Refund');
    
     console.log(contractBalance, 'contractBalance');
     console.log(bobBalance, 'bobBalance');
     console.log(bobBalanceb4, 'bobBalanceb4');

     expect(await SparklaunchSale.isSaleSuccessful()).to.be.false;
     expect(await SparklaunchSale.saleFinished()).to.be.true;

     });
    });

   

    
      
  });
});