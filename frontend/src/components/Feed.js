import React from 'react';
import Post from "./Post";

function Feed(props) {
  const posts = props.posts;
  const feed = posts.map(post => {
    const key = `${post.accountId}/${post.post.block_height}`;
    return <Post key={key} post={post} {...props}/>;
  });
  return (
    <div>
      {feed}
    </div>
  );
}

export default Feed;
