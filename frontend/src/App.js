import React from 'react';
import HomePage from "./pages/Home"
import AccountPage from "./pages/Account"
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
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

    this._near = {
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
    };

    this.state = {
      near: null,
    };

    this._initNear().then(() => {
      this.setState({
        near: {
          signedIn: !!this._near.accountId,
          accountId: this._near.accountId,
        }
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
    this._near.storage_minimum_balance = await this._near.contract.storage_minimum_balance();

  }

  async requestSignIn() {
    const appTitle = 'NEAR Vodka';
    await this._walletConnection.requestSignIn(
      NearConfig.contractName,
      appTitle
    )
  }

  async logOut() {
    this._walletConnection.signOut();
    this._accountId = null;
    this.setState({
      near: {
        signedIn: !!this._accountId,
        accountId: this._accountId,
      }
    })
  }

  render() {
    const header = !this.state.near ? (
      <div>Connecting... <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span></div>
    ) : (this.state.near.signedIn ? (
      <div>
        <div className="float-right">
          <button
            className="btn btn-outline-secondary"
            onClick={() => this.logOut()}>Log out ({this.state.near.accountId})</button>
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
      <div className="App">
        <div className="header">
          <h2>NEAR Vodka - connecting people</h2>
          {header}
        </div>
        <a className="github-fork-ribbon right-bottom fixed" href="https://github.com/evgenykuzyakov/near-vodka" data-ribbon="Fork me on GitHub"
           title="Fork me on GitHub">Fork me on GitHub</a>

        <Router basename={process.env.PUBLIC_URL}>
          <Switch>
            <Route exact path={"/"}>
              <HomePage _near={this._near} near={this.state.near}/>
            </Route>
            <Route exact path={"/a/:accountId"}>
              <AccountPage _near={this._near} near={this.state.near} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;
