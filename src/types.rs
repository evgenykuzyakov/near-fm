use crate::*;
use near_sdk::collections::UnorderedSet;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Post {
    pub body: String,
    pub time: U64,
    pub block_height: BlockHeight,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub enum VPost {
    Last(Post),
}

impl From<Post> for VPost {
    fn from(post: Post) -> Self {
        Self::Last(post)
    }
}

impl From<VPost> for Post {
    fn from(v_post: VPost) -> Self {
        match v_post {
            VPost::Last(post) => post,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct StorageAccount {
    pub balance: Balance,
    pub used_bytes: StorageUsage,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Account {
    pub following: UnorderedSet<AccountId>,
    pub followers: UnorderedSet<AccountId>,
    pub num_posts: u64,
    pub last_post_height: BlockHeight,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub enum VAccount {
    Last(Account),
}

impl From<Account> for VAccount {
    fn from(account: Account) -> Self {
        Self::Last(account)
    }
}

impl From<VAccount> for Account {
    fn from(v_account: VAccount) -> Self {
        match v_account {
            VAccount::Last(account) => account,
        }
    }
}

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountStats {
    pub num_posts: u64,
    pub num_followers: u64,
    pub num_following: u64,
}
