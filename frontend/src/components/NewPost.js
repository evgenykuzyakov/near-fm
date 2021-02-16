import React, {useState} from 'react';
import {convertPost} from "../data/Post";

function NewPost(props) {
  const [ body, setBody ] = useState("");
  const [ loading, setLoading ] = useState(false);

  const post = async () => {
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

  return (
    <div>
      <form>
        <div className="mb-3">
          <textarea
            className="form-control" placeholder={"New post"} rows="5" value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="mb-3 d-grid gap-2 d-md-flex justify-content-md-end">
          <button className="btn btn-primary" disabled={!body} onClick={post}>
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
      </form>
    </div>
  );
}

export default NewPost;
