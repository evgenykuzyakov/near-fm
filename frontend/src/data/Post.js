const convertPost = (post) => {
  return {
    body: post.body,
    time: new Date(parseFloat(post.time) / 1_000_000),
    blockHeight: post.block_height,
    lastPostHeight: post.last_post_height,
  };
};

class PostData {
  constructor(_near, accountId, requestBlockHeight) {
    this._near = _near;
    this.accountId = accountId;
    this.requestBlockHeight = requestBlockHeight;
    this._ready = false;
  }

  static async load(_near, accountId, requestBlockHeight) {
    let post = new PostData(_near, accountId, requestBlockHeight);
    await post.fetch();
    return post;
  }


  async fetch() {
    const post = await this._near.blockViewCall(this.requestBlockHeight, 'get_post', {account_id: this.accountId});
    if (post) {
      Object.assign(this, convertPost(post));
    }
    this._ready = true;
  }
}

export {PostData, convertPost};
