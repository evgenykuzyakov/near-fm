import React from 'react';
import './Account.scss';
import ReactTooltip from "react-tooltip";
import {Link} from "react-router-dom";
import AccountCard from "./AccountCard";

function Account(props) {
  const accountId = props.accountId;

  return (
    <div className="account">
      <Link className="account-handle" data-tip data-for={`rt-${accountId}`} to={`/a/${accountId}`}>@{accountId}</Link>
      <ReactTooltip id={`rt-${accountId}`} className='account-tooltip' delayHide={100} delayShow={200} effect='solid'>
        <AccountCard {...props} accountId={accountId} />

      </ReactTooltip>
    </div>
  );
}

export default Account;
