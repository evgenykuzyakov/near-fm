import React, {useCallback, useEffect, useState} from 'react';
import './Account.scss';
import {Link} from "react-router-dom";
import FollowButton from "./FollowButton";
import Account from "./Account";
import uuid from "react-uuid";

function AccountCard(props) {
  const [account, setAccount] = useState(null);
  const [knownFollowers, setKnownFollowers] = useState([]);
  const [newFollowing, setNewFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followsYou, setFollowsYou] = useState(false);
  const [key] = useState(uuid());

  const hidden = props.hidden;
  const accountId = props.accountId;

  const fetchAccount = useCallback(async () => {
    let account = await props._near.getAccount(accountId);
    setAccount(account);
    if (props.signedIn && props.signedAccountId !== accountId) {
      setFollowsYou(accountId in props.followers);
      account.fetchFollowers().then(() => {
        setKnownFollowers(Object.keys(account.followers).filter((accountId) => (accountId in props.followings)));
      });
      account.fetchFollowings().then(() => {
        setNewFollowing(Object.keys(account.followings).filter((accountId) => !(accountId in props.followings) && accountId !== props.signedAccountId));
      });
    }
  }, [accountId, props._near, props.followings, props.signedIn, props.signedAccountId, props.followers])

  useEffect(() => {
    if (props.connected && !hidden && (!account || account.accountId !== accountId)) {
      setLoading(true);
      fetchAccount().then(() => setLoading(false))
    }
  }, [props.connected, accountId, hidden, account, fetchAccount]);

  const followers = knownFollowers.slice(0, (knownFollowers.length === 4) ? 4 : 3).map(
    (accountId, i) => (
      <span key={`a-${key}-${accountId}`}>
        {i > 0 && ", "}
        <Account {...props} accountId={accountId}/>
      </span>
    )
  );

  const followersAndOthers = knownFollowers.length - followers.length;

  const following = newFollowing.slice(0, (newFollowing.length === 4) ? 4 : 3).map(
    (accountId, i) => (
      <span key={`b-${key}-${accountId}`}>
        {i > 0 && ", "}
        <Account {...props} accountId={accountId}/>
      </span>
    )
  );

  const followingAndOthers = newFollowing.length - following.length;

  return (
    <div>
      <div>
        <h5><Link className="account-handle" to={`/a/${accountId}`}>@{accountId}</Link></h5>
      </div>
      { loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-grow" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : account ? (
        <div>
          <FollowButton {...props} accountId={accountId} account={account}/>
          <div className="mb-2">
            <div>
              <span className="me-md-2">
                {account.stats.numPosts ? <b>{account.stats.numPosts}</b> : <span className="text-muted">No</span>} <span className="text-muted">post{account.stats.numPosts !== 1 && "s"}</span>
              </span>
              {followsYou && <span className="badge bg-secondary">Follows You</span>}
            </div>
            <div>
              <span className="me-md-2"><b>{account.stats.numFollowing}</b> <span className="text-muted">following</span></span>
              <span><b>{account.stats.numFollowers}</b> <span className="text-muted">followers</span></span>
            </div>
          </div>
          {props.signedIn && accountId !== props.signedAccountId && (
            <div>
              <div className="text-muted">
                { followers.length > 0 ? (
                  <div>
                    Followed by {followers} {followersAndOthers ? ` and ${followersAndOthers} others you follow` : ""}
                  </div>
                ) : (
                  "Not followed by anyone you know"
                )}
              </div>
              { following.length > 0 && (
                <div className="text-muted">
                  Follows {following} {followingAndOthers ? ` and ${followingAndOthers} others you don't follow` : ""}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>Error loading account</div>
      )}
    </div>
  );
}

export default AccountCard;
