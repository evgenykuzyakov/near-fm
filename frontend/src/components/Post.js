import React from 'react';

function Feed(props) {
  const accountId = props.accountId;
  const post = props.post.post;
  return (
    <div>
      <div>Posted by {accountId} on {post.time}</div>
      <div>
        {post.body}
      </div>
    </div>
  );
}

export default Feed;
