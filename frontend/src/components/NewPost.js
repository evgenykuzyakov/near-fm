import React from 'react';

function NewPost(props) {
  let textInput = React.createRef();

  const post = async () => {
    let body = textInput.current.value;
    await props._near.contract.post({body})
  };

  return (
    <div>
      <form>
        <div className="mb-3">
          <textarea ref={textInput} className="form-control" placeholder={"New post"}></textarea>
        </div>
        <div className="mb-3">
        <button className="btn btn-primary" onClick={post}>Post</button>
        </div>
      </form>
    </div>
  );
}

export default NewPost;
