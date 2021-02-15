import React from 'react';
import Account from "./Account";
import TimeAgo from "timeago-react";

function Post(props) {
  const accountId = props.accountId;
  const post = props.post;
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title"><Account {...props} accountId={accountId} /></h5>
        <h6 className="card-subtitle mb-2 text-muted"><TimeAgo datetime={new Date(parseFloat(post.time) / 1_000_000)} /></h6>
        <p className="card-text">
          {post.body}
        </p>
      </div>
    </div>
  );
}

export default Post;
