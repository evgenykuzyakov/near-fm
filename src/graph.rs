use crate::*;

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
    ) -> Vec<AccountId> {
        let account = self.internal_get_account(account_id.as_ref());
        let followers = account.followers.as_vector();
        (from_index..std::cmp::min(from_index + limit, followers.len()))
            .filter_map(|index| followers.get(index))
            .collect()
    }

    pub fn get_following(
        &self,
        account_id: ValidAccountId,
        from_index: u64,
        limit: u64,
    ) -> Vec<AccountId> {
        let account = self.internal_get_account(account_id.as_ref());
        let following = account.following.as_vector();
        (from_index..std::cmp::min(from_index + limit, following.len()))
            .filter_map(|index| following.get(index))
            .collect()
    }

    pub fn get_account(&self, account_id: ValidAccountId) -> AccountStats {
        let account = self.internal_get_account(account_id.as_ref());
        AccountStats {
            num_posts: account.num_posts,
            num_followers: account.followers.len(),
            num_following: account.following.len(),
        }
    }
}
