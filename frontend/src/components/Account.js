import React, {useState} from 'react';
import './Account.scss';
import ReactTooltip from "react-tooltip";
import {Link} from "react-router-dom";
import FollowButton from "./FollowButton";

function Account(props) {
  const [account, setAccount] = useState(null);

  const accountId = props.accountId;
  if (props.connected && props._near) {
    props._near.getAccount(accountId).then((account) => {
      setAccount(account);
    })
  }

  return (
    <div className="account">
      <Link className="account-handle" data-tip data-for={`rt-${accountId}`} to={`/a/${accountId}`}>@{accountId}</Link>
      <ReactTooltip id={`rt-${accountId}`} className='account-tooltip' delayHide={100} delayShow={200} effect='solid'>
        <div>
          <h5><Link className="account-handle" to={`/a/${accountId}`}>@{accountId}</Link></h5>
        </div>
        <FollowButton {...props} accountId={accountId} account={account}/>
        {account && (
          <div>
            <div>Num posts: {account.stats.numPosts}</div>
            <div>Num followers: {account.stats.numFollowers}</div>
            <div>Num following: {account.stats.numFollowing}</div>
          </div>
        )}
      </ReactTooltip>
    </div>
  );
}

export default Account;
