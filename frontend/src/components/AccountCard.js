import React, {useCallback, useEffect, useState} from 'react';
import './Account.scss';
import {Link} from "react-router-dom";
import FollowButton from "./FollowButton";
import Account from "./Account";
import uuid from "react-uuid";

function AccountCard(props) {
  const [account, setAccount] = useState(null);
  const [knownFollowers, setKnownFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [key] = useState(uuid());

  const hidden = props.hidden;
  const accountId = props.accountId;

  const fetchAccount = useCallback(async () => {
    let account = await props._near.getAccount(accountId);
    setAccount(account);
    if (props.signedIn && props.signedAccountId !== accountId) {
      await account.fetchFollowers();
      setKnownFollowers(Object.keys(account.followers).filter((accountId) => (accountId in props.followings)));
    }
  }, [accountId, props._near, props.followings, props.signedIn, props.signedAccountId])

  useEffect(() => {
    if (props.connected && !hidden && !account) {
      setLoading(true);
      fetchAccount().then(() => setLoading(false))
    }
  }, [props.connected, hidden, account, fetchAccount]);

  const num = (knownFollowers.length === 4) ? 4 : 3;

  const followers = knownFollowers.slice(0, num).map(
    (accountId) => <Account key={`${key}-${accountId}`} {...props} accountId={accountId}/>
  );

  const andOthers = knownFollowers.length - followers.length;

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
              {account.stats.numPosts ? <b>{account.stats.numPosts}</b> : <span className="text-muted">No</span>} <span className="text-muted">post{account.stats.numPosts !== 1 && "s"}</span>
            </div>
            <div>
              <span className="me-md-2"><b>{account.stats.numFollowing}</b> <span className="text-muted">following</span></span>
              <span><b>{account.stats.numFollowers}</b> <span className="text-muted">followers</span></span>
            </div>
          </div>
          {props.signedIn && accountId !== props.signedAccountId && (
            <div className="text-muted">
              { knownFollowers.length > 0 ? (
                <div>
                  Followed by {followers} {andOthers ? ` and ${andOthers} others you follow` : ""}
                </div>
              ) : (
                "Not followed by anyone you know"
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
