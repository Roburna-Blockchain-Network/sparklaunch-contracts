SalesFactory Setup:
1. deploy admin contract with admin addresses array
2. deploy Salefactory with admin contract address as constructor argument
3. setFee() - a function to set bnb fee for deploying a sale (in bnb, 18 decimals)
4. setSeviceFee() - a function to set serviceFee , a percent of raised funds that will be taken from owners profit. (10000 = 100%)
5. setFeeAddr() - set the address to receive fees

Deploy a sale: 
1. deployNormalSale() - call this function in order to deploy a sale. The function accepts 4 arrays with arguments. The order of array elements should be exactly the same as following:

const tx = await factoryContract.deployERC20Sale(
        [router, ADMIN_CONTRACT_ADDRESS, ADMIN_ADDRESS, TOKENADDDYY, ADMIN_ADDRESS], 
        [serviceFee, minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKEN_PRICE_IN_BNB, 
         saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
        [ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS],
        [1, 2, 3],
        startTimes,
        40);

setupAddys[] : 
1. Router address
2. admin contract address    
3. sale token address
4. sale owner address

uints[] :

1. min participation (with 18 decimals)
2. max participation (with 18 decimals)
3. lp percentage, from total of 10000, should be >= 5100 (51%) and <= 10000 (100%)
4. dex listing rate (how much tokens for 1 bnb) with 18 decimals
5. lpLockDelta , lp lock period
6. token price in bnb (wiith 18 decimals)
7. Sale end time (unix timestamp)
8. Sale satrt time (unix timestamp)
9. Public round start time delta. Public round start time calculates like : 5th tier start time + PublicRoundStartsDelta
10. HardCap in tokens
11. softCap in tokens 


WLAddys[]:
1. array with addresses that need to be added to the whitelist and get tiers
e.g [ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS]

tiers4WL[]: 
1. array with numbers from 1 to 5 , e.g [1, 2, 3]
2. the number of elements in the array should be equal the number of elements in the WLAddys array
e.g :
WLAddys[ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS]
tiers4WL[1, 2, 3]
3. that means ADMIN_ADDRESS will be granted 1st tier, 
ALICE_ADDRESS will be granted 2nd tier,
BOB_ADDRESS will be granted 3rd tier

startTimes[]:
1. tiers start times
2. should be exactly 5 numbers in the array (start time for each tier from total of 5)
3. in unix timestamp format 

id:
1. a unique sale id 


SparkLaunchSale: 
1. All sale parameters are set from the constructor
2. 


