const { 
  defaultSetup,
  ANY_ADDRESS
} = require('./common.js');
const { assertRevert } = require('@aragon/test-helpers/assertThrow');
const { encodeCallScript, EMPTY_SCRIPT } = require('@aragon/test-helpers/evmScript');

contract('HCVoting', accounts => {

  const [ 
    holder1, 
    holder2, 
    holder3, 
    appManager
  ] = accounts;

  const HOLDER_1_BALANCE = 1;
  const HOLDER_2_BALANCE = 1;
  const HOLDER_3_BALANCE = 1;

  describe('When executing proposals', () => {

    beforeEach(async () => {
      await defaultSetup(this, appManager);

      await this.voteToken.generateTokens(holder1, HOLDER_1_BALANCE);
      await this.voteToken.generateTokens(holder2, HOLDER_2_BALANCE);
      await this.voteToken.generateTokens(holder3, HOLDER_3_BALANCE);
    });
    
    it('Should execute a proposal\'s script', async () => {
      
      // Create the proposal to change the app's supportPct.
      const newSupportPct = 60;
      const action = { 
        to: this.app.address, 
        calldata: this.app.contract.changeSupportPct.getData(newSupportPct) 
      };
      const script = encodeCallScript([action])
      const receipt = await this.app.createProposal(script, `Modify support percent`);
      
      // Support proposal with absolute majority so that it executes.
      await this.app.vote(0, false, { from: holder1 });
      await this.app.vote(0, true,  { from: holder2 });
      await this.app.vote(0, true,  { from: holder3 });

      // Retrieve new supportPercent value.
      const supportPct = await this.app.supportPct();
      expect(supportPct.toString()).to.equal(`${newSupportPct}`);
    });

    it('Should not execute a proposal\'s script if it targets a blacklisted address', async () => {
      
      // Create the proposal to withdraw stake tokens.
      // This shouldn't be allowed.
      const action = { 
        to: this.stakeToken.address, 
        calldata: this.stakeToken.contract.transfer.getData(ANY_ADDRESS, 1000) 
      };
      const script = encodeCallScript([action])
      const receipt = await this.app.createProposal(script, `Remove some stake from the voting app`);
      
      // Support proposal so that it executes.
      // Should fail because the auto-execution of the proposal is blacklisted for the stake token.
      await this.app.vote(0, false, { from: holder1 });
      await this.app.vote(0, true,  { from: holder2 });
      await assertRevert(
        this.app.vote(0, true, { from: holder3 }),
        `EVMCALLS_BLACKLISTED_CALL`
      );
    });

  });
});