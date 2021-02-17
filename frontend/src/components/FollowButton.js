import React from 'react';
import './FollowButton.scss';

function FollowButton(props) {
  const accountId = props.accountId;
  const account = props.account;

  async function follow() {
    if (!props.enoughStorageBalance) {
      alert('Add storage balance to follow');
      return;
    }
    if (!props.followings || (accountId in props.followings)) {
      return;
    }
    props._near.accountData.followings[accountId] = account;
    props.updateState({
      followings: Object.assign({}, props._near.accountData.followings),
    })
    await props._near.contract.follow({account_id: accountId});
  }

  async function unfollow() {
    if (!props.followings || !(accountId in props.followings)) {
      return;
    }
    delete props._near.accountData.followings[accountId];
    props.updateState({
      followings: Object.assign({}, props._near.accountData.followings),
    })
    await props._near.contract.unfollow({account_id: accountId});
  }

  return (
    <div className="follow-button mb-3">
      {(!account) ? (
        <div className="spinner-grow" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (accountId === props.signedAccountId) ? (
        <div>It's you</div>
      ) : (props.followings && (accountId in props.followings)) ? (
        <button className="btn btn-primary btn-unfollow" onClick={unfollow}><span>Following</span></button>
      ) : (props.signedIn) ? (
        <button
          className="btn btn-outline-primary btn-follow"
          onClick={follow}
          >Follow</button>
      ) : (
        <button
          className="btn btn-outline-secondary btn-follow"
          disabled={true}
          >Sign in to Follow</button>
      )}
    </div>
  );
}

export default FollowButton;
