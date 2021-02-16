import React, {useState} from 'react';
import {useParams} from "react-router";
import Post from "../components/Post";

function PostPage(props) {
  const { accountId, blockHeight } = useParams();
  const [post, setPost] = useState(false);

  if (props.connected && props._near) {
    props._near.getPost(accountId, parseInt(blockHeight)).then((post) => {
      setPost(post);
    })
  }

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col col-lg-8 col-xl-6">
          {post ? (
            <Post {...props} post={post}/>
          ) : (
            <div className="d-flex justify-content-center">
              <div className="spinner-grow" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostPage;
