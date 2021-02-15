import React from 'react';
import './FollowButton.scss';

function FollowButton(props) {
  const accountId = props.accountId;
  const account = props.account;

  const follow = async () => {
    if (!props.followings || (accountId in props.followings)) {
      return;
    }
    props._near.accountData.followings[accountId] = account.stats;
    props.updateState({
      followings: Object.assign({}, props._near.accountData.followings),
    })
    await props._near.contract.follow({account_id: accountId});
  };

  const unfollow = async () => {
    if (!props.followings || !(accountId in props.followings)) {
      return;
    }
    delete props._near.accountData.followings[accountId];
    props.updateState({
      followings: Object.assign({}, props._near.accountData.followings),
    })
    await props._near.contract.unfollow({account_id: accountId});
  };

  return (
    <div className="follow-button mb-3">
      {(!account) ? (
        <div>Loading</div>
      ) : (accountId === props.signedAccountId) ? (
        <div>It's you</div>
      ) : (props.followings && (accountId in props.followings)) ? (
        <button className="btn btn-primary btn-unfollow" onClick={unfollow}><span>Following</span></button>
      ) : (
        <button className="btn btn-outline-primary btn-follow" onClick={follow}>Follow</button>
      )}
    </div>
  );
}

export default FollowButton;
