use super::*;
use near_sdk::json_types::{ValidAccountId, U128};
use near_sdk::serde::Serialize;
use std::convert::TryInto;

/// Price per 1 byte of storage from mainnet config after `0.18` release and protocol version `42`.
/// It's 10 times lower than the genesis price.
const STORAGE_PRICE_PER_BYTE: Balance = 10_000_000_000_000_000_000;

/// The minimum amount in bytes to register an account.
const MIN_STORAGE_SIZE: StorageUsage = 1000;

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountStorageBalance {
    total: U128,
    available: U128,
}

pub trait StorageManager {
    fn storage_deposit(&mut self, account_id: Option<ValidAccountId>) -> AccountStorageBalance;

    fn storage_withdraw(&mut self, amount: Option<U128>) -> AccountStorageBalance;

    fn storage_minimum_balance(&self) -> U128;

    fn storage_balance_of(&self, account_id: ValidAccountId) -> AccountStorageBalance;
}

#[near_bindgen]
impl StorageManager for Contract {
    #[payable]
    fn storage_deposit(&mut self, account_id: Option<ValidAccountId>) -> AccountStorageBalance {
        let amount = env::attached_deposit();
        let account_id = account_id
            .map(|a| a.into())
            .unwrap_or_else(|| env::predecessor_account_id());
        if let Some(mut storage_account) = self.storage_accounts.get(&account_id) {
            storage_account.balance += amount;
            self.storage_accounts.insert(&account_id, &storage_account);
        } else {
            let min_balance = self.storage_minimum_balance().0;
            if amount < min_balance {
                env::panic(b"Requires attached deposit of at least the storage minimum balance");
            }
            let initial_storage = env::storage_usage();
            self.internal_create_account(&account_id);
            let used_bytes = env::storage_usage() - initial_storage;
            let storage_account = StorageAccount {
                balance: amount,
                used_bytes: self.storage_account_in_bytes + used_bytes,
            };
            self.storage_accounts.insert(&account_id, &storage_account);
        }
        self.storage_balance_of(account_id.try_into().unwrap())
    }

    #[payable]
    fn storage_withdraw(&mut self, amount: Option<U128>) -> AccountStorageBalance {
        assert_one_yocto();
        let account_id = env::predecessor_account_id();
        let storage_balance = self.storage_balance_of((account_id.as_str()).try_into().unwrap());
        let amount: Balance = amount.unwrap_or(storage_balance.available).into();
        if amount > storage_balance.available.0 {
            env::panic(b"Requested storage balance withdrawal amount is larger than available");
        } else if amount > 0 {
            let mut storage_account = self.storage_accounts.get(&account_id).unwrap();
            storage_account.balance -= amount;
            self.storage_accounts.insert(&account_id, &storage_account);
            Promise::new(account_id.clone()).transfer(amount + 1);
        }
        self.storage_balance_of(account_id.try_into().unwrap())
    }

    fn storage_minimum_balance(&self) -> U128 {
        (Balance::from(MIN_STORAGE_SIZE) * STORAGE_PRICE_PER_BYTE).into()
    }

    fn storage_balance_of(&self, account_id: ValidAccountId) -> AccountStorageBalance {
        if let Some(storage_account) = self.storage_accounts.get(account_id.as_ref()) {
            AccountStorageBalance {
                total: storage_account.balance.into(),
                available: std::cmp::min(
                    storage_account.balance - self.storage_minimum_balance().0,
                    Balance::from(storage_account.used_bytes) * STORAGE_PRICE_PER_BYTE,
                )
                .into(),
            }
        } else {
            AccountStorageBalance {
                total: 0.into(),
                available: 0.into(),
            }
        }
    }
}

pub(crate) struct StorageUpdate {
    account_id: AccountId,
    storage_account: StorageAccount,
    initial_storage: StorageUsage,
}

impl StorageAccount {
    pub fn assert_enough_balance(&self) {
        assert!(
            Balance::from(self.used_bytes) * STORAGE_PRICE_PER_BYTE <= self.balance,
            "Not enough storage balance to cover changes"
        );
    }
}

impl Contract {
    pub(crate) fn new_storage_update(&mut self, account_id: AccountId) -> StorageUpdate {
        let storage_account = self
            .storage_accounts
            .get(&account_id)
            .expect("Account is not registered");
        let initial_storage = env::storage_usage();
        StorageUpdate {
            account_id,
            storage_account,
            initial_storage,
        }
    }

    pub(crate) fn finalize_storage_update(&mut self, storage_update: StorageUpdate) {
        let StorageUpdate {
            account_id,
            mut storage_account,
            initial_storage,
        } = storage_update;
        storage_account.used_bytes =
            storage_account.used_bytes + initial_storage - env::storage_usage();
        storage_account.assert_enough_balance();
        self.storage_accounts.insert(&account_id, &storage_account);
    }
}
