import "./Home.scss";
import React, {useEffect, useState} from 'react';
import NewPost from "../components/NewPost";
import Feed from "../components/Feed";
import { SortedSet } from "collections/sorted-set";

function HomePage(props) {
  const [followingPosts, setFollowingPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);

  const account = props.account;
  async function fetchPosts() {
    if (!account || !account.lastPostHeight) {
      return;
    }
    const accountData = props._near.accountData;
    await accountData.fetchFollowings();

    const recent = new SortedSet(accountData.followings.map(
      ([accountId, accountStats]) => [accountStats.lastPostHeight, accountId]
    ));
    recent.push([accountData.account.lastPostHeight, accountData.account.accountId]);

    const posts = [];
    while (recent.length > 0 && posts.length < 10) {
      const [blockHeight, accountId] = recent.pop();
      if (blockHeight === 0) {
        break;
      }
      const post = await props._near.blockViewCall(blockHeight, 'get_post', {account_id: accountId});
      if (post) {
        recent.push([post.block_height - 1, accountId])
        posts.push({
          accountId,
          post
        })
      }
    }
    setFollowingPosts(posts);
  }

  useEffect(() => {
    fetchPosts();
  }, [account]);

  return (
    <div>
      <div className="container">
        <div className="row">
          {account && account.enoughStorageBalance && (
            <NewPost {...props}/>
          )}
          {followingPosts && (
            <div>
              <h3>Following</h3>
              <Feed {...props} posts={followingPosts}/>
            </div>
          )}
          {latestPosts && (
            <div>
              <h3>Latest posts</h3>
              <Feed {...props} posts={latestPosts}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
