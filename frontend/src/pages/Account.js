import React, {useEffect, useState} from 'react';
import {useParams} from "react-router";
import Feed from "../components/Feed";
import FollowButton from "../components/FollowButton";

function AccountPage(props) {
  const { accountId } = useParams();
  const [seed, setSeed] = useState(false);

  const [account, setAccount] = useState(null);

  if (props.connected && props._near) {
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
        <div className="col col-lg-8 col-xl-6">
          <h3>Account @{accountId}</h3>
          <FollowButton {...props} accountId={accountId} account={account}/>
          <h3>Posts</h3>
          {seed && <Feed {...props} seed={seed}/>}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
