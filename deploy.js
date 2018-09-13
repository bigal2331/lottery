const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const Mneumonic = 'tobacco quit unusual elevator core liberty inject illegal toe nominee suspect hidden';
const networkEndPoint = 'https://rinkeby.infura.io/v3/b16b09e1bfe240cda1e1ae98198e8813';
const provider = new HDWalletProvider(Mneumonic, networkEndPoint);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('attempting to deploy from account number: ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to the address: ', result.options.address);
    console.log(interface);

};

deploy();