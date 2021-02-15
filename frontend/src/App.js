import React from 'react';
import "./App.scss";
import './gh-fork-ribbon.css';
import HomePage from "./pages/Home"
import AccountPage from "./pages/Account"
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import * as nearAPI from 'near-api-js'
import BN from 'bn.js';
import AccountData from "./data/Account";

const IsMainnet = window.location.hostname === "near.vodka";
const TestNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  contractName: 'dev-1613368835598-7014445',
  walletUrl: 'https://wallet.testnet.near.org',
};

const MainNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
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
        const result = await this.account.connection.provider.query({
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
    };

    this._initNear().then(() => {
      this.setState({
        signedIn: !!this._near.accountId,
        accountId: this._near.accountId,
        connected: true,
      });
    });
  }


  async _initNear() {
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const near = await nearAPI.connect(Object.assign({deps: {keyStore}}, NearConfig));
    this._near.keyStore = keyStore;
    this._near.near = near;

    this._near.walletConnection = new nearAPI.WalletConnection(near, NearConfig.contractName);
    this._near.accountId = this._near.walletConnection.getAccountId();

    this._near.account = this._near.walletConnection.account();
    this._near.contract = new nearAPI.Contract(this._near.account, NearConfig.contractName, {
      viewMethods: ['get_account', 'get_accounts', 'get_followers', 'get_following', 'get_post', 'storage_minimum_balance', 'storage_balance_of'],
      changeMethods: ['storage_deposit', 'storage_withdraw', 'post', 'follow', 'unfollow'],
    });
    this._near.storageMinimumBalance = await this._near.contract.storage_minimum_balance();
    if (this._near.accountId) {
      this._near.accountData = await AccountData.load(this._near, this._near.accountId);
      this.setState({
        account: this._near.accountData.state(),
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
      accountId: this._accountId,
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
        {!this.state.account.enoughStorageBalance && (
          <div style={{marginBottom: "10px"}}>
            <button
              className="btn btn-primary"
              onClick={(e) => this.requestStorageBalance(e)}>Add storage balance</button>
          </div>
        )}
        <div className="float-end">
          <button
            className="btn btn-outline-secondary"
            onClick={() => this.logOut()}>Log out ({this.state.accountId})</button>
        </div>

      </div>
    ) : (
      <div style={{marginBottom: "10px"}}>
        <button
          className="btn btn-primary"
          onClick={(e) => this.requestSignIn(e)}>Log in with NEAR Wallet</button>
      </div>
    ));

    return (
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">NEAR Vodka - connecting people</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="/">Home</a>
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
              <HomePage _near={this._near} {...this.state}/>
            </Route>
            <Route exact path={"/a/:accountId"}>
              <AccountPage _near={this._near} {...this.state} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;
