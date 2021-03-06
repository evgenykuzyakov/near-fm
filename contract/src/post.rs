use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Post {
    pub body: String,
    pub time: U64,
    pub block_height: BlockHeight,
    pub last_post_height: BlockHeight,
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

#[near_bindgen]
impl Contract {
    pub fn post(&mut self, body: String) -> Post {
        let account_id = env::predecessor_account_id();
        let storage_update = self.new_storage_update(account_id.clone());
        let mut account = self.internal_get_account(&account_id);
        let block_height = env::block_index();
        if account.last_post_height == block_height {
            env::panic(b"Can't post twice per block");
        }
        let post = Post {
            body,
            time: env::block_timestamp().into(),
            block_height,
            last_post_height: account.last_post_height,
        };
        let v_post = post.into();
        self.posts.insert(&account_id, &v_post);
        account.num_posts += 1;
        account.last_post_height = block_height;
        self.internal_set_account(&account_id, account);
        self.finalize_storage_update(storage_update);
        v_post.into()
    }

    pub fn get_post(&self, account_id: ValidAccountId) -> Option<Post> {
        self.posts.get(account_id.as_ref()).map(|p| p.into())
    }
}
