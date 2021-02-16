import React, {useState} from 'react';

function NewPost(props) {
  const [ body, setBody ] = useState("");

  const post = async () => {
    let _body = body;
    setBody("");
    await props._near.contract.post({body: _body})
    let newPosts = {
      accountId: props.signedAccountId,
      post: {
        body: _body,
        time: (new Date().getTime() * 1000000).toString(),
      }
    }
    props.updateState({
      newPosts: [...props.newPosts, newPosts]
    })
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
          <button className="btn btn-primary" disabled={!body} onClick={post}>Post now</button>
        </div>
      </form>
    </div>
  );
}

export default NewPost;
