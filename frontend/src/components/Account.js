import React, {useState} from 'react';
import './Account.scss';
import ReactTooltip from "react-tooltip";
import {Link} from "react-router-dom";
import AccountCard from "./AccountCard";
import uuid from "react-uuid";

function Account(props) {
  const [hidden, setHidden] = useState(true);
  const [key] = useState(uuid());
  const accountId = props.accountId;

  return (
    <div className="account">
      <Link className="account-handle" data-tip data-for={key} to={`/a/${accountId}`}>@{accountId}</Link>
      <ReactTooltip
        id={key}
        type="light"
        border={true}
        className='account-tooltip'
        delayHide={100}
        delayShow={200}
        effect='solid'
        afterShow={() => setHidden(false)}
        afterHide={() => setHidden(true)}
      >
        <AccountCard {...props} accountId={accountId} hidden={hidden} />

      </ReactTooltip>
    </div>
  );
}

export default Account;
