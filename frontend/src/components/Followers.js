import React from 'react';
import './Post.scss';
import AccountCard from "./AccountCard";

function Followers(props) {
  const notFollowing = Object.keys(props.followers).filter((accountId) => !(accountId in props.followings));

  const followers = notFollowing.map((accountId) => {
    const key = `f/${accountId}`;
    return (
      <div key={key} className="follower">
        <div className="card mb-3">
          <div className="card-body">
            <AccountCard accountId={accountId} {...props}/>
          </div>
        </div>
      </div>
    );
  });

  return !props.connected ? (
    <div className="d-flex justify-content-center">
      <div className="spinner-grow" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : (followers.length > 0) ? (
    <div>
      <h3>Follow back</h3>
      {followers}
    </div>
  ) : (
    <div></div>
  );
}

export default Followers;
