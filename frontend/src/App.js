import "./App.scss";
import "./gh-fork-ribbon.css";
import React from 'react';
import BN from 'bn.js';
import * as nearAPI from 'near-api-js'

const IsMainnet = window.location.hostname === "near.vodka";
const TestNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  contractName: 'dev-1613260991415-7394706',
  walletUrl: 'https://wallet.testnet.near.org',
};

const MainNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  contractName: 'dev-1613260991415-7394706',
  walletUrl: 'https://wallet.testnet.near.org',
};

// const MainNearConfig = {
//   networkId: 'mainnet',
//   nodeUrl: 'https://rpc.mainnet.near.org',
//   contractName: 'berryclub.ek.near',
//   walletUrl: 'https://wallet.near.org',
// };
const NearConfig = IsMainnet ? MainNearConfig : TestNearConfig;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      signedIn: false,
      accountId: null,
    };

    this._accounts = {};

    this._initNear().then(() => {
      this.setState({
        connected: true,
        signedIn: !!this._accountId,
        accountId: this._accountId,
      });
    });
  }

  componentDidMount() {

  }

  async _initNear() {
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const near = await nearAPI.connect(Object.assign({deps: {keyStore}}, NearConfig));
    this._keyStore = keyStore;
    this._near = near;

    this._walletConnection = new nearAPI.WalletConnection(near, NearConfig.contractName);
    this._accountId = this._walletConnection.getAccountId();

    this._account = this._walletConnection.account();
    this._contract = new nearAPI.Contract(this._account, NearConfig.contractName, {
      viewMethods: ['get_account', 'get_accounts', 'get_followers', 'get_following', 'get_post', 'storage_minimum_balance', 'storage_balance_of'],
      changeMethods: ['storage_deposit', 'storage_withdraw', 'post', 'follow', 'unfollow'],
    });
    this._storage_minimum_balance = await this._contract.storage_minimum_balance();

  }

  async requestSignIn() {
    const appTitle = '[TEST] Berry Club';
    await this._walletConnection.requestSignIn(
      NearConfig.contractName,
      appTitle
    )
  }

  async logOut() {
    this._walletConnection.signOut();
    this._accountId = null;
    this.setState({
      signedIn: !!this._accountId,
      accountId: this._accountId,
    })
  }

  async blockViewCall(blockId, methodName, args) {
    args = args || {};
    this._account.validateArgs(args);
    const result = await this._account.connection.provider.query({
      request_type: 'call_function',
      block_id: blockId,
      account_id: NearConfig.contractName,
      method_name: methodName,
      args_base64: new Buffer(JSON.stringify(args), 'utf8').toString('base64'),
    });
    return result.result && result.result.length > 0 && JSON.parse(Buffer.from(result.result).toString());
  }

  render() {
    window.yo = this;

    const content = !this.state.connected ? (
        <div>Connecting... <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span></div>
    ) : (this.state.signedIn ? (
        <div>
          <div className="float-right">
            <button
              className="btn btn-outline-secondary"
              onClick={() => this.logOut()}>Log out ({this.state.accountId})</button>
          </div>

        </div>
    ) : (
        <div style={{marginBottom: "10px"}}>
          <button
              className="btn btn-primary"
              onClick={() => this.requestSignIn()}>Log in with NEAR Wallet</button>
        </div>
    ));

    return (
      <div>
        <div className="header">
          <h2>NEAR Vodka - connecting people</h2>
          {content}
        </div>
        <div className="container">
          <div className="row">
            <div>

            </div>
          </div>
        </div>
        <a className="github-fork-ribbon right-bottom fixed" href="https://github.com/evgenykuzyakov/near-vodka" data-ribbon="Fork me on GitHub"
           title="Fork me on GitHub">Fork me on GitHub</a>
      </div>
    );
  }
}

export default App;
