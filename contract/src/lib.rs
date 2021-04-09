use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::json_types::{ValidAccountId, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, Balance, BlockHeight, BorshStorageKey, CryptoHash,
    PanicOnDefault, Promise, StorageUsage,
};

pub use crate::account::*;
use crate::internal::*;
pub use crate::post::*;
pub use crate::storage_manager::*;

const LONGEST_ACCOUNT_ID: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const MAX_ACCOUNT_ID_LENGTH: usize = 64;

mod account;
mod internal;
mod post;
mod storage_manager;

near_sdk::setup_alloc!();

#[derive(BorshStorageKey, BorshSerialize)]
pub(crate) enum StorageKey {
    StorageAccounts,
    Accounts,
    Posts,
    AccountFollowers { account_hash: CryptoHash },
    AccountFollowing { account_hash: CryptoHash },
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub storage_accounts: LookupMap<AccountId, StorageAccount>,

    pub accounts: UnorderedMap<AccountId, VAccount>,

    pub posts: LookupMap<AccountId, VPost>,

    pub storage_account_in_bytes: StorageUsage,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        let mut this = Self {
            storage_accounts: LookupMap::new(StorageKey::StorageAccounts),
            accounts: UnorderedMap::new(StorageKey::Accounts),
            posts: LookupMap::new(StorageKey::Posts),
            storage_account_in_bytes: 0,
        };

        this.measure_storage_account_in_bytes();

        this
    }

    fn measure_storage_account_in_bytes(&mut self) {
        let account_id = LONGEST_ACCOUNT_ID.to_string();
        assert_eq!(account_id.len(), MAX_ACCOUNT_ID_LENGTH);
        let initial_storage = env::storage_usage();
        self.storage_accounts.insert(
            &account_id,
            &StorageAccount {
                balance: 0,
                used_bytes: 0,
            },
        );
        self.storage_account_in_bytes = env::storage_usage() - initial_storage;
        self.storage_accounts.remove(&account_id);
    }
}
