# Kenya Loans

Kenya Loans is an application built on the Solana blockchain that aims to bring affordable and accessible loans to the masses - starting with Kenya first.  Kenya Loans is powered by a smart contracted that I can "Loans254".

## Loans254

Loans254 is a smart contract built on the Solana blockchain.  Loans254 can work for anyone in any country, but it is initially meant to be used in Kenya where loan interest rates are disgustingly high.

Loans254 is currently deployed on Solana's Devnet and the UI is available here.  This is a proof of concept.

This project was built for the [Solana DeFi hackathon](https://solana.com/defi) that ran from Feb 15 2021 to March 1 2021.  It consists of these two repos:

- [Kenya Loans](https://github.com/moshthepitt/kenyaloans-defi)
- [Loans254](https://github.com/moshthepitt/loans254-program)

### The Problem

In Kenya we have a type of loan generally known as an "auto logbook loan".  Simply put, this is a loan that is secured by a car.  In Kenya, getting this kind of loan generally happens like this:

1. Borrower finds a Lending Company and applies for the loan
2. The Lending Company reviews the request and contacts the Borrower to do a valuation on the Borrower's car. The valuation is usually done by a third party Valuer.
3. Once the car has been valued, the Lending Company gives the Borrower an offer of the loan and its terms.  Usually the Lending Company lends only upto 50% of the value of the car.  Additionally, the Lending Company usually requires that the Borrower hands over the car logbook as well as signed transfer documents for the car.  (In Kenya, a car logbook is a government-issued document that is a proof of ownership of the car.)
4. After receiving the car logbook and the car transfer document, the Lending Company transfers the loan amount to the Borrower.  The loan's interest rate is usually between 5% - 10% per month. How much is that annualized?
5. Once the loan is repaid, the Lending Company gives back the car logbook and the signed car transfer document that the Borrower had initially provided.

If we think about what happened, we can see that essentially this is a really expensive and perhaps even predatory loan.  The Lending Company receives rich interest payments, and for the duration of the loan they effectively own the Borrower's car.

Why would anyone agree to such terms for a loan?  As it turns out this is a really popular form of loan in Kenya.  So why do people do this?

a. It is usually an "emergency" loan where the Borrower really needs the money
b. There are no good alternatives in Kenya

I started [Kenyaloans.com](Kenyaloans.com) years and years ago with the aim of solving exactly this problem.  How do we make financing more accessible and affordable in Kenya?  My answer has always been by providing more options than are currently available.  Kenya Loans does this by providing information on where you can get loans.  Indeed you used to be able to fill in a form with your loan-need details and Kenya Loans would help match you with local Lending Companies.  But this did not work out very well because I always felt uneasy about matching people with Lenders who I felt were too expensive and not appropriate, to say the least.

#### Can we do it better?

I believe that we indeed can.  The goal is still the same: provide more options to people who need financing.  I want to make it possible for Borrowers in Kenya to get financing from around the world through the Solana block chain.

#### How would it work?

Essentially, I am building a smart contract that I lovingly call "Loans254".

First, let's introduce the parties involved:

##### 0. Loans254

The fully on-chain smart contract that powers the lending.

##### 1. Borrower

The borrower sends an instruction to Loans254 that they want to borrow X amount of a certain Token.

##### 2. Guarantor

The guarantor provides collateral for a given loan request.  Currently, they need to provide 100% collateral for each loan, in the same Token as was requested by the Borrower.

##### 3. Lender

The lender... lends the money.  The loan has already been collaterized by the guarantor so the lender faces minimal risk of losing their investment.

#### Cool, but how would it work in real-life, in Kenya?

Things would progress loosely in this way:

1. Borrower finds a Smart Lending Company i.e. a Lending Company who uses Loans254
2. Just as before, the lending company does a valuation of the Borrower's car, and offers up to 50% of the value as a loan.  The Smart Lending Company takes possession of the car logbook just as they would have done if this was any other logbook loan.
3. Borrower sends an instruction to Loans254 through a website or other UI that they want to borrow X of some Token.  Ideally, this would be a Stablecoin such as USDC.
4. The Smart Lending Company sends an instruction to Loans254 to provide collateral (i.e. "guarantee") the loan request submitted by the Borrower.  The Smart Lending Company plays the role of Guarantor in the smart contract.
5. An investor (the lender) in America or Germany or wherever sees the loan request, and notes that it is fully secured.  He sends instructions to Loans254 and thus provides funds to the Borrower.
6. When the Borrower repays the loan this happens:
    - Loans254 calculates how much of the interest to distribute to the lender and how much to the guarantor
    - Loans254 then distributes to the guarantor and lender the appropriate amounts

** Note that for the initial version of Loans254 the tokens used by Guarantor and Lender should be the same type as was requested by the Borrower.

#### Why would this work?

Essentially, the Guarantor can be said to be somehow tokenizing the value of the Borrower's car and using it to collaterize the loan.

The Guarantor therefore has to be an entity that is able to:

- Determine a value for the Borrower's car (the asset)
- Enter into a legally enforceable contract with the Borrower that empowers the Guarantor to liquidate the asset should the Borrower be unable to repay the loan.  The contract should of course also offer protection for the Borrower.
- Access funds to collaterize the loan on the block chain

The Guarantor thus does a significant amount of the work and so the smart contract pays them a significant portion of the loan's interest as a return on their investment.

The lender on the other hand has little or no risk of losing their funds.  They might be on the other side of the world and participate only as an investor seeking a return on investment.

### Future Plans

- Make it possible for a Guarantor's funds to be used as collateral for more than one loan.  This would really make things interesting.
- Make it possible for both the Guarantor and Borrower to provide funds of different token type than requested by the Borrower.  The very very early groundwork for this has been done.