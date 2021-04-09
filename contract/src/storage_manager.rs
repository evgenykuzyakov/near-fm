use super::*;
use near_contract_standards::storage_management::{
    StorageBalance, StorageBalanceBounds, StorageManagement,
};
use near_sdk::json_types::{ValidAccountId, U128};
use std::convert::TryInto;

/// The minimum amount in bytes to register an account.
const MIN_STORAGE_SIZE: StorageUsage = 1000;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct StorageAccount {
    pub balance: Balance,
    pub used_bytes: StorageUsage,
}

#[near_bindgen]
impl StorageManagement for Contract {
    #[payable]
    fn storage_deposit(
        &mut self,
        account_id: Option<ValidAccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        let amount = env::attached_deposit();
        let account_id = account_id
            .map(|a| a.into())
            .unwrap_or_else(|| env::predecessor_account_id());
        let mut refund_amount = 0;
        let registration_only = registration_only.unwrap_or(false);
        if let Some(mut storage_account) = self.storage_accounts.get(&account_id) {
            if registration_only {
                refund_amount = amount;
            } else {
                storage_account.balance += amount;
                self.storage_accounts.insert(&account_id, &storage_account);
            }
        } else {
            let min_balance = self.storage_balance_bounds().min.0;
            if amount < min_balance {
                env::panic(b"Requires attached deposit of at least the storage minimum balance");
            }
            let initial_storage = env::storage_usage();
            self.internal_create_account(&account_id);
            let used_bytes = env::storage_usage() - initial_storage;
            if registration_only {
                refund_amount = amount - min_balance;
            }
            let storage_account = StorageAccount {
                balance: amount - refund_amount,
                used_bytes: self.storage_account_in_bytes + used_bytes,
            };
            self.storage_accounts.insert(&account_id, &storage_account);
        }
        if refund_amount > 0 {
            Promise::new(env::predecessor_account_id()).transfer(refund_amount);
        }
        self.storage_balance_of(account_id.try_into().unwrap())
            .unwrap()
    }

    #[payable]
    fn storage_withdraw(&mut self, amount: Option<U128>) -> StorageBalance {
        assert_one_yocto();
        let account_id = env::predecessor_account_id();
        let storage_balance = self
            .storage_balance_of((account_id.as_str()).try_into().unwrap())
            .expect("Account is not registered");
        let amount: Balance = amount.unwrap_or(storage_balance.available).into();
        if amount > storage_balance.available.0 {
            env::panic(b"Requested storage balance withdrawal amount is larger than available");
        } else if amount > 0 {
            let mut storage_account = self.storage_accounts.get(&account_id).unwrap();
            storage_account.balance -= amount;
            self.storage_accounts.insert(&account_id, &storage_account);
            Promise::new(account_id.clone()).transfer(amount);
        }
        self.storage_balance_of(account_id.try_into().unwrap())
            .unwrap()
    }

    #[allow(unused_variables)]
    fn storage_unregister(&mut self, force: Option<bool>) -> bool {
        unimplemented!();
    }

    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        StorageBalanceBounds {
            min: (Balance::from(MIN_STORAGE_SIZE) * env::storage_byte_cost()).into(),
            max: None,
        }
    }

    fn storage_balance_of(&self, account_id: ValidAccountId) -> Option<StorageBalance> {
        self.storage_accounts
            .get(account_id.as_ref())
            .map(|storage_account| StorageBalance {
                total: storage_account.balance.into(),
                available: (storage_account.balance
                    - std::cmp::max(
                        self.storage_balance_bounds().min.0,
                        Balance::from(storage_account.used_bytes) * env::storage_byte_cost(),
                    ))
                .into(),
            })
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
            Balance::from(self.used_bytes) * env::storage_byte_cost() <= self.balance,
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
            (storage_account.used_bytes + env::storage_usage()).saturating_sub(initial_storage);
        storage_account.assert_enough_balance();
        self.storage_accounts.insert(&account_id, &storage_account);
    }
}
