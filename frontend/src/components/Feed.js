import React, {useEffect, useState} from 'react';
import Post from "./Post";
import { SortedSet } from "collections/sorted-set";

function Feed(props) {
  const [posts, setPosts] = useState([]);

  const seed = props.seed;

  async function fetchPosts(seed) {
    const posts = [];
    const recent = SortedSet(seed);
    while (recent.length > 0 && posts.length < 10) {
      const [blockHeight, accountId] = recent.pop();
      if (blockHeight === 0) {
        break;
      }
      const post = await props._near.blockViewCall(blockHeight, 'get_post', {account_id: accountId});
      if (post) {
        if (post.last_post_height > 0) {
          recent.push([post.last_post_height, accountId])
        }
        posts.push({
          accountId,
          post
        })
        setPosts([...posts]);
      }
    }
  }

  useEffect(() => {
    if (seed !== false) {
      fetchPosts(seed);
    }
  }, [seed]);

  const feed = posts.map(post => {
    const key = `${post.accountId}/${post.post.block_height}`;
    return <Post key={key} accountId={post.accountId} post={post.post} {...props}/>;
  });
  return (
    <div>
      {feed}
    </div>
  );
}

export default Feed;
