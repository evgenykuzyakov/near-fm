use crate::*;
use near_sdk::collections::{UnorderedSet, Vector};

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
    pub last_post_height: u64,
}

impl From<Account> for AccountStats {
    fn from(account: Account) -> Self {
        Self {
            num_posts: account.num_posts,
            num_followers: account.followers.len(),
            num_following: account.following.len(),
            last_post_height: account.last_post_height,
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn follow(&mut self, account_id: ValidAccountId) {
        let account_id = account_id.into();
        let from_account_id = env::predecessor_account_id();
        assert_ne!(
            &account_id, &from_account_id,
            "Can't follow your own account"
        );

        let storage_update = self.new_storage_update(from_account_id.clone());
        let mut from_account = self.internal_get_account(&from_account_id);
        assert!(
            from_account.following.insert(&account_id),
            "Already following this account"
        );
        self.internal_set_account(&from_account_id, from_account);
        self.finalize_storage_update(storage_update);

        let storage_update = self.new_storage_update(account_id.clone());
        let mut account = self.internal_get_account(&account_id);
        assert!(
            account.followers.insert(&from_account_id),
            "Already followed by your account"
        );
        self.internal_set_account(&account_id, account);
        self.finalize_storage_update(storage_update);
    }

    pub fn unfollow(&mut self, account_id: String) {
        let account_id = account_id.into();
        let from_account_id = env::predecessor_account_id();
        assert_ne!(
            &account_id, &from_account_id,
            "Can't unfollow your own account"
        );

        let storage_update = self.new_storage_update(from_account_id.clone());
        let mut from_account = self.internal_get_account(&from_account_id);
        assert!(
            from_account.following.remove(&account_id),
            "Not following this account"
        );
        self.internal_set_account(&from_account_id, from_account);
        self.finalize_storage_update(storage_update);

        let storage_update = self.new_storage_update(account_id.clone());
        let mut account = self.internal_get_account(&account_id);
        assert!(
            account.followers.remove(&from_account_id),
            "Not followed by your account"
        );
        self.internal_set_account(&account_id, account);
        self.finalize_storage_update(storage_update);
    }

    pub fn get_followers(
        &self,
        account_id: ValidAccountId,
        from_index: u64,
        limit: u64,
    ) -> Vec<(AccountId, AccountStats)> {
        let account = self.internal_get_account(account_id.as_ref());
        self.get_account_range(account.followers.as_vector(), from_index, limit)
    }

    pub fn get_following(
        &self,
        account_id: ValidAccountId,
        from_index: u64,
        limit: u64,
    ) -> Vec<(AccountId, AccountStats)> {
        let account = self.internal_get_account(account_id.as_ref());
        self.get_account_range(account.following.as_vector(), from_index, limit)
    }

    pub fn get_account(&self, account_id: ValidAccountId) -> Option<AccountStats> {
        self.internal_get_account_optional(account_id.as_ref())
            .map(|a| a.into())
    }

    pub fn get_accounts(&self, from_index: u64, limit: u64) -> Vec<(AccountId, AccountStats)> {
        let account_ids = self.accounts.keys_as_vector();
        let accounts = self.accounts.values_as_vector();
        (from_index..std::cmp::min(from_index + limit, account_ids.len()))
            .map(|index| {
                let account_id = account_ids.get(index).unwrap();
                let account: Account = accounts.get(index).unwrap().into();
                (account_id, account.into())
            })
            .collect()
    }
}

impl Contract {
    pub(crate) fn get_account_range(
        &self,
        account_ids: &Vector<AccountId>,
        from_index: u64,
        limit: u64,
    ) -> Vec<(AccountId, AccountStats)> {
        (from_index..std::cmp::min(from_index + limit, account_ids.len()))
            .filter_map(|index| {
                account_ids.get(index).and_then(|account_id| {
                    self.internal_get_account_optional(&account_id)
                        .map(|account| (account_id, account.into()))
                })
            })
            .collect()
    }

    pub(crate) fn internal_create_account(&mut self, account_id: &AccountId) -> Account {
        let hash = env::sha256(account_id.as_bytes());
        let mut following_key = vec![b'o'];
        following_key.extend_from_slice(&hash);
        let mut followers_key = vec![b'i'];
        followers_key.extend(&hash);
        let account = Account {
            following: UnorderedSet::new(following_key),
            followers: UnorderedSet::new(followers_key),
            num_posts: 0,
            last_post_height: 0,
        };
        let v_account = account.into();
        assert!(
            self.accounts.insert(&account_id, &v_account).is_none(),
            "Account already exists"
        );
        v_account.into()
    }

    pub(crate) fn internal_get_account_optional(&self, account_id: &AccountId) -> Option<Account> {
        self.accounts.get(&account_id).map(|a| a.into())
    }

    pub(crate) fn internal_get_account(&self, account_id: &AccountId) -> Account {
        self.internal_get_account_optional(account_id)
            .expect("Account doesn't exist")
    }

    pub(crate) fn internal_set_account(&mut self, account_id: &AccountId, account: Account) {
        self.accounts.insert(account_id, &account.into());
    }
}
