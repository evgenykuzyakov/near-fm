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
pub use crate::notification::*;
pub use crate::post::*;
use crate::post_meta::VPostMeta;
pub use crate::storage_manager::*;

mod account;
mod internal;
mod notification;
mod post;
mod post_meta;
mod storage_manager;

near_sdk::setup_alloc!();

#[derive(BorshStorageKey, BorshSerialize)]
pub(crate) enum StorageKey {
    StorageAccounts,
    Accounts,
    Posts,
    AccountFollowers { account_hash: CryptoHash },
    AccountFollowing { account_hash: CryptoHash },
    Notifications,
    PostMetas,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub storage_accounts: LookupMap<AccountId, StorageAccount>,

    pub accounts: UnorderedMap<AccountId, VAccount>,

    pub posts: LookupMap<AccountId, VPost>,

    pub storage_account_in_bytes: StorageUsage,

    pub notifications: LookupMap<AccountId, AccountNotifications>,

    pub post_metas: LookupMap<PostLink, VPostMeta>,
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
            notifications: LookupMap::new(StorageKey::Notifications),
            post_metas: LookupMap::new(StorageKey::PostMetas),
        };

        this.measure_storage_account_in_bytes();

        this
    }

    fn measure_storage_account_in_bytes(&mut self) {
        let account_id = "a".repeat(64);
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
