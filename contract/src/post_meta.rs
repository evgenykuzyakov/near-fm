use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct PostMeta {
    pub num_comments: u64,
    pub comments: PostComments,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub enum VPostMeta {
    Last(PostMeta),
}

impl From<PostMeta> for VPostMeta {
    fn from(post_meta: PostMeta) -> Self {
        Self::Last(post_meta)
    }
}

impl From<VPostMeta> for PostMeta {
    fn from(v_post_meta: VPostMeta) -> Self {
        match v_post_meta {
            VPostMeta::Last(post_meta) => post_meta,
        }
    }
}
