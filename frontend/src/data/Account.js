import BN from "bn.js";

const MinEnoughStorageBalance = new BN("50000000000000000000000");
const FetchLimit = 100;

const convertAccountStats = (accountStats) => {
  return {
    numPosts: accountStats.num_posts,
    numFollowers: accountStats.num_followers,
    numFollowing: accountStats.num_following,
    lastPostHeight: accountStats.last_post_height,
  };
};

class AccountData {
  constructor(_near, accountId) {
    this._near = _near;
    this._accountId = accountId;
    this.account = {
      accountId: this._accountId,
    };
    this.followings = false;
    this.followers = false;
    this._ready = false;
  }

  static async load(_near, accountId) {
    let account = new AccountData(_near, accountId);
    await account.fetch();
    return account;
  }

  async _fetchStorageBalance() {
    let storageBalance = await this._near.contract.storage_balance_of({account_id: this._accountId});
    this.account.storageBalance = {
      total: new BN(storageBalance.total),
      available: new BN(storageBalance.available),
    };
    this.account.enoughStorageBalance = storageBalance.available > MinEnoughStorageBalance;
  }

  async _fetchAccountStats() {
    const accountStats = await this._near.contract.get_account({account_id: this._accountId});
    if (accountStats) {
      Object.assign(this.account, convertAccountStats(accountStats));
    }
  }

  async fetch() {
    await Promise.all([this._fetchStorageBalance(), this._fetchAccountStats()]);
    this._ready = true;
  }

  async fetchFollowings() {
    if (this.followings !== false) {
      return;
    }
    const promises = [];
    for (let i = 0; i < this.account.numFollowing; i += FetchLimit) {
      promises.push(this._contract.get_following({
        account_id: this._accountId,
        from_index: i,
        limit: FetchLimit,
      }));
    }
    this.followings = (await Promise.all(promises)).reduce((fs, f) => {
      fs.append(f.map(([accountId, accountStats]) => [accountId, convertAccountStats(accountStats)]));
      return fs;
    }, []);
  }

  state() {
    return Object.assign({}, this.account)
  }
}

export default AccountData;
