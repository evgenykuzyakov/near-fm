import React, {useState} from 'react';
import {convertPost} from "../data/Post";
import AddStorageButton from "./AddStorageButton";
import Post from "./Post";

function NewPost(props) {
  const [ body, internalSetBody ] = useState("");
  const [ post, setPost ] = useState(null);
  const [ loading, setLoading ] = useState(false);

  function setBody(body) {
    setPost(body ? {
      accountId: props.signedAccountId,
      blockHeight: 0,
      time: new Date().getTime() * 1000000,
      body,
    } : null)

    internalSetBody(body);
  }

  const postNow = async () => {
    let _body = body;
    setLoading(true);
    setBody("");
    let newPosts = convertPost(await props._near.contract.post({body: _body}));
    newPosts.accountId = props.signedAccountId;
    props.updateState({
      newPosts: [...props.newPosts, newPosts]
    })
    setLoading(false);
  };

  return props.enoughStorageBalance ? (
    <div>
      <form>
        <div className="mb-3">
          <textarea
            className="form-control" placeholder={"New post (supports markdown)"} rows="5" value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="mb-3 d-grid gap-2 d-md-flex justify-content-md-end">
          <button className="btn btn-primary" disabled={!body} onClick={postNow}>
            {loading ? (
              <span>
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                <span className="visually-hidden">Loading...</span>
                {' '}Posting
              </span>
            ) : (
              <span>Post now</span>
            )}
          </button>
        </div>
        {post && (
          <div className="mb-3">
            <h3 className="text-muted">Preview</h3>
            <Post {...props} post={post} />
          </div>
        )}
      </form>
    </div>
  ) : (
    <div className="mb-3">
      <div>
        <div className="alert alert-danger" role="alert">
          <b>Not enough storage balance!</b><br/>
          Add storage balance to be able to post and follow people.
        </div>
      </div>
      <div>
        <AddStorageButton {...props}/>
      </div>
    </div>
  );
}

export default NewPost;
