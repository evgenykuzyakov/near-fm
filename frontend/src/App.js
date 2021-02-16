import React from 'react';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import './gh-fork-ribbon.css';
import HomePage from "./pages/Home"
import AccountPage from "./pages/Account"
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import {AccountData} from "./data/Account";
import NearVodkaLogo from "./images/near_vodka_logo.png"

// 4 epochs
const NumBlocksNonArchival = 4 * 12 * 3600;

const IsMainnet = window.location.hostname === "near.vodka";
const TestNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  archivalNodeUrl: 'https://rpc.testnet.internal.near.org',
  contractName: 'dev-1613368835598-7014445',
  walletUrl: 'https://wallet.testnet.near.org',
};

const MainNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  archivalNodeUrl: 'https://rpc.testnet.internal.near.org',
  contractName: 'dev-1613368835598-7014445',
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

    this._near = {
      async blockViewCall(blockId, methodName, args) {
        args = args || {};
        this.account.validateArgs(args);
        const connection = blockId + NumBlocksNonArchival < this.lastBlockHeight ?
          this.archivalConnection :
          this.account.connection;
        const result = await connection.provider.query({
          request_type: 'call_function',
          block_id: blockId,
          account_id: NearConfig.contractName,
          method_name: methodName,
          args_base64: new Buffer(JSON.stringify(args), 'utf8').toString('base64'),
        });
        return result.result && result.result.length > 0 && JSON.parse(Buffer.from(result.result).toString());
      }
    };

    this.state = {
      connected: false,
      isNavCollapsed: true,
      newPosts: [],
    };

    this._initNear().then(() => {
      this.setState({
        signedIn: !!this._near.accountId,
        signedAccountId: this._near.accountId,
        connected: true,
      });
    });
  }


  async _initNear() {
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const near = await nearAPI.connect(Object.assign({deps: {keyStore}}, NearConfig));
    this._near.archivalConnection = nearAPI.Connection.fromConfig({
      networkId: NearConfig.networkId,
      provider: { type: 'JsonRpcProvider', args: { url: NearConfig.archivalNodeUrl } },
      signer: { type: 'InMemorySigner', keyStore }
    });
    this._near.keyStore = keyStore;
    this._near.near = near;

    this._near.walletConnection = new nearAPI.WalletConnection(near, NearConfig.contractName);
    this._near.accountId = this._near.walletConnection.getAccountId();

    this._near.account = this._near.walletConnection.account();
    const block = await this._near.account.connection.provider.block({ finality: 'final' });
    this._near.lastBlockHeight = block.header.height;
    this._near.contract = new nearAPI.Contract(this._near.account, NearConfig.contractName, {
      viewMethods: ['get_account', 'get_accounts', 'get_num_accounts', 'get_followers', 'get_following', 'get_post', 'storage_minimum_balance', 'storage_balance_of'],
      changeMethods: ['storage_deposit', 'storage_withdraw', 'post', 'follow', 'unfollow'],
    });
    this._near.storageMinimumBalance = await this._near.contract.storage_minimum_balance();

    this._near.accounts = {};
    this._near.getAccount = (accountId) => {
      if (accountId in this._near.accounts) {
        return this._near.accounts[accountId];
      }
      return this._near.accounts[accountId] = Promise.resolve(AccountData.load(this._near, accountId));
    };

    if (this._near.accountId) {
      this._near.accountData = await this._near.getAccount(this._near.accountId);
      await this._near.accountData.fetchFollowings();
      this.setState({
        followings: Object.assign({}, this._near.accountData.followings),
        enoughStorageBalance: this._near.accountData.stats.enoughStorageBalance,
      });
    }
  }


  async requestSignIn(e) {
    e.preventDefault();
    const appTitle = 'NEAR Vodka';
    await this._near.walletConnection.requestSignIn(
      NearConfig.contractName,
      appTitle
    )
    return false;
  }

  async logOut() {
    this._near.walletConnection.signOut();
    this._near.accountId = null;
    this.setState({
      signedIn: !!this._accountId,
      signedAccountId: this._accountId,
    })
  }

  async requestStorageBalance(e) {
    e.preventDefault();
    await this._near.contract.storage_deposit({}, "30000000000000", "100000000000000000000000");
  }

  render() {
    window.yo = this;
    const header = !this.state.connected ? (
      <div>Connecting... <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span></div>
    ) : (this.state.signedIn ? (
      <div>
        {!this.state.enoughStorageBalance && (
          <button
            className="btn btn-primary me-md-2"
            onClick={(e) => this.requestStorageBalance(e)}>Add storage balance</button>
        )}
        <button
          className="btn btn-outline-secondary"
          onClick={() => this.logOut()}>Log out ({this.state.signedAccountId})</button>
      </div>
    ) : (
      <div>
        <button
          className="btn btn-primary"
          onClick={(e) => this.requestSignIn(e)}>Log in with NEAR Wallet</button>
      </div>
    ));

    return (
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
          <div className="container-fluid">
            <a className="navbar-brand" href="/" title="NEAR Vodka - connecting people">
              <img src={NearVodkaLogo} alt="NEAR Vodka" className="d-inline-block align-middle" />
              [TESTNET] NEAR Vodka
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  {/*<a className="nav-link active" aria-current="page" href="/">Home</a>*/}
                </li>
              </ul>
              <form className="d-flex">
                {header}
              </form>
            </div>
          </div>
        </nav>

        <a className="github-fork-ribbon right-bottom fixed" href="https://github.com/evgenykuzyakov/near-vodka" data-ribbon="Fork me on GitHub"
           title="Fork me on GitHub">Fork me on GitHub</a>

        <Router basename={process.env.PUBLIC_URL}>
          <Switch>
            <Route exact path={"/"}>
              <HomePage _near={this._near} {...this.state} updateState={(s) => this.setState(s)}/>
            </Route>
            <Route exact path={"/a/:accountId"}>
              <AccountPage _near={this._near} {...this.state} updateState={(s) => this.setState(s)} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;
