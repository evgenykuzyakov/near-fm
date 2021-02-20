import React, {useEffect, useRef, useState} from 'react';
import './Post.scss';
import Account from "./Account";
import TimeAgo from "timeago-react";
import {Link} from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

function Post(props) {
  const container = useRef(null);
  const [expand, setExpand] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const post = props.post;

  useEffect(() => {
    if (container && container.current) {
      const {scrollHeight, clientHeight} = container.current;
      setOverflow(scrollHeight > clientHeight);
    }
  }, [expand, container, post.body])

  const expanded = props.expanded || expand;

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title"><Account {...props} accountId={post.accountId} /></h5>
        <h6 className="card-subtitle mb-2 text-muted">
          <Link className="post-link" to={`/p/${post.accountId}/${post.blockHeight}`}><TimeAgo datetime={post.time} /></Link>
        </h6>
        <div>
          <div className={`card-text post-body${!expanded ? ' post-body-truncated' : ''}${overflow ? ' post-body-overflow' : ''}`} ref={container}>
            <ReactMarkdown plugins={[gfm]}>{post.body}</ReactMarkdown>
          </div>
          {expand ? (
            <div className="mt-1">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setExpand(false)}
              >Show less</button>
            </div>
          ) : overflow && (
            <div className="mt-1">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setExpand(true)}
              >Show more</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Post;
