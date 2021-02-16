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
  constructor(_near, accountId, accountStats) {
    this._near = _near;
    this.accountId = accountId;
    this.stats = {
      lastPostHeight: 0,
      numFollowers: 0,
      numFollowing: 0,
      numPosts: 0,
      enoughStorageBalance: false,
    };
    if (accountStats) {
      Object.assign(this.stats, convertAccountStats(accountStats));
      this._ready = true;
    } else {
      this._ready = false;
    }
    this.followings = false;
    this.followers = false;
    this._near.cacheAccount(accountId, this);
  }

  static async load(_near, accountId) {
    let account = new AccountData(_near, accountId);
    await account.fetchAccountStats();
    return account;
  }

  async fetchStorageBalance() {
    let storageBalance = await this._near.contract.storage_balance_of({account_id: this.accountId});
    this.stats.storageTotal = new BN(storageBalance.total);
    this.stats.storageAvailable = new BN(storageBalance.available);
    this.stats.enoughStorageBalance = this.stats.storageAvailable > MinEnoughStorageBalance;
  }

  async fetchAccountStats() {
    const accountStats = await this._near.contract.get_account({account_id: this.accountId});
    if (accountStats) {
      Object.assign(this.stats, convertAccountStats(accountStats));
      this._ready = true;
    }
  }

  async fetchFollowings() {
    if (this.followings !== false) {
      return;
    }
    const promises = [];
    for (let i = 0; i < this.stats.numFollowing; i += FetchLimit) {
      promises.push(this._near.contract.get_following({
        account_id: this.accountId,
        from_index: i,
        limit: FetchLimit,
      }));
    }
    this.followings = {};
    (await Promise.all(promises)).flat().forEach(([accountId, accountStats]) => {
      this.followings[accountId] = new AccountData(this._near, accountId, accountStats);
    });
  }

  async fetchFollowers() {
    if (this.followers !== false) {
      return;
    }
    const promises = [];
    for (let i = 0; i < this.stats.numFollowers; i += FetchLimit) {
      promises.push(this._near.contract.get_followers({
        account_id: this.accountId,
        from_index: i,
        limit: FetchLimit,
      }));
    }
    this.followers = {};
    (await Promise.all(promises)).flat().forEach(([accountId, accountStats]) => {
      this.followers[accountId] = new AccountData(this._near, accountId, accountStats);
    });
  }
}

export {AccountData, convertAccountStats};
