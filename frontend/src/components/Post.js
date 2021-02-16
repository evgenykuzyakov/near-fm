import React from 'react';
import './Post.scss';
import Account from "./Account";
import TimeAgo from "timeago-react";
import {Link} from "react-router-dom";

function Post(props) {
  const post = props.post;
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title"><Account {...props} accountId={post.accountId} /></h5>
        <h6 className="card-subtitle mb-2 text-muted">
          <Link className="post-link" to={`/p/${post.accountId}/${post.blockHeight}`}><TimeAgo datetime={post.time} /></Link>
        </h6>
        <div className="card-text">
          {post.body}
        </div>
      </div>
    </div>
  );
}

export default Post;
