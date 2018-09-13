const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
 accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({ from: accounts[0], gas: '1000000'});
  
  lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
 it('deploys a contract', () => {
     
     assert.ok(lottery.options.address);
 });

 it('enters players', async () => {
    await lottery.methods.enter().send({
        from:accounts[0], 
        value:web3.utils.toWei('.02','ether')
    });

    const players = await lottery.methods.getPlayers().call({
        from: accounts[0]
    });


    assert.equal(accounts[0],players[0]);
    assert.equal(1, players.length);
    
 })

    it('enters multiple players', async () => {
        await lottery.methods.enter().send({
            from:accounts[0], 
            value:web3.utils.toWei('.02','ether')
        });
        await lottery.methods.enter().send({
            from:accounts[1], 
            value:web3.utils.toWei('.02','ether')
        });
        await lottery.methods.enter().send({
            from:accounts[2], 
            value:web3.utils.toWei('.02','ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });


        assert.equal(accounts[0],players[0]);
        assert.equal(accounts[1],players[1]);
        assert.equal(accounts[2],players[2]);
        assert.equal(3, players.length);

    });

    it('requires minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from:accounts[0],
                value: web3.utils.toWei('.01','ether')
            });
            
            assert(false);
        } catch (error) {
            //test for a the presence of an error
            assert(error)
        }
    });

    it('only manager can pick winner', async () => {
        try{
            await lottery.methods.pickWinner().call({
                from: accounts[1]
            })
            assert(false);
        }catch(err){
            assert(err);
        }
    });

    it('sends money to winner and resets the player list', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        
        await lottery.methods.pickWinner().send({ from: accounts[0] })
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference  = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});