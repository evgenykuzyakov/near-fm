import React, {useEffect, useState} from 'react';
import {useParams} from "react-router";
import Feed from "../components/Feed";
import FollowButton from "../components/FollowButton";
import Followers from "../components/Followers";
import NewPost from "../components/NewPost";

function AccountPage(props) {
  const { accountId } = useParams();
  const [seed, setSeed] = useState(false);

  const [account, setAccount] = useState(null);

  if (props.connected && props._near) {
    console.log(props._near);
    props._near.getAccount(accountId).then((account) => {
      setAccount(account);
    })
  }

  useEffect(() => {
    if (props.connected && props._near && account) {
      setSeed([[account.stats.lastPostHeight, accountId]]);
    }
  }, [props.connected, account])

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col col-12 col-lg-8 col-xl-6">
          <h3>Account @{accountId}</h3>
          {accountId === props.signedAccountId ? (
            <div>
              <NewPost {...props}/>
              <h3>Your Posts</h3>
            </div>
          ) : (
            <div>
              <FollowButton {...props} accountId={accountId} account={account}/>
              <h3>Posts</h3>
            </div>
          )}
          {seed ? (
            <Feed {...props} seed={seed}/>
          ) : (
            <div className="d-flex justify-content-center">
              <div className="spinner-grow" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
        <div className="col col-12 col-lg-4 col-xl-4">
          {props.signedIn && <Followers {...props} />}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
