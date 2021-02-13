use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::json_types::{ValidAccountId, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, Balance, BlockHeight, PanicOnDefault, Promise, StorageUsage,
};

pub use crate::graph::*;
use crate::internal::*;
pub use crate::post::*;
pub use crate::storage_manager::*;
use crate::types::*;

const LONGEST_ACCOUNT_ID: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const MAX_ACCOUNT_ID_LENGTH: usize = 64;

mod graph;
mod internal;
mod post;
mod storage_manager;
mod types;

#[global_allocator]
static ALLOC: near_sdk::wee_alloc::WeeAlloc<'_> = near_sdk::wee_alloc::WeeAlloc::INIT;

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
        assert!(!env::state_exists(), "Already initialized");
        let mut this = Self {
            storage_accounts: LookupMap::new(b"s".to_vec()),
            accounts: UnorderedMap::new(b"a".to_vec()),
            posts: LookupMap::new(b"p".to_vec()),
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
