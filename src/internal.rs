use crate::*;
use near_sdk::collections::UnorderedSet;

pub(crate) fn assert_one_yocto() {
    assert_eq!(
        env::attached_deposit(),
        1,
        "Requires attached deposit of exactly 1 yoctoNEAR"
    )
}

impl Contract {
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

    pub(crate) fn internal_get_account(&self, account_id: &AccountId) -> Account {
        self.accounts
            .get(&account_id)
            .map(|a| a.into())
            .expect("Account doesn't exist")
    }

    pub(crate) fn internal_set_account(&mut self, account_id: &AccountId, account: Account) {
        self.accounts.insert(account_id, &account.into());
    }
}
