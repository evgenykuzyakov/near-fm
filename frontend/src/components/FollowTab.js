import React, {useCallback, useEffect, useState} from 'react';
import uuid from "react-uuid";
import AccountCard from "./AccountCard";

function FollowTab(props) {
  const accountId = props.accountId;
  const [account, setAccount] = useState(null);
  const [follow, setFollow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gkey] = useState(uuid());

  const showFollowers = props.showFollowers;
  const hidden = props.hidden;

  const fetchAccount = useCallback(async () => {
    let account = await props._near.getAccount(accountId);
    setAccount(account);
    let list;
    if (showFollowers) {
      await account.fetchFollowers();
      list = account.followers;
    } else {
      await account.fetchFollowings();
      list = account.followings;
    }
    if (props.signedIn && props.signedAccountId !== accountId) {
      const notFollowing = Object.keys(list).filter((accountId) => !(accountId in props.followings));
      const following = Object.keys(list).filter((accountId) => (accountId in props.followings));

      setFollow([...notFollowing, ...following]);
    } else {
      setFollow(Object.keys(list));
    }
  }, [accountId, props._near, props.followings, props.signedIn, props.signedAccountId, showFollowers])

  useEffect(() => {
    if (props.connected && !hidden && (!account || account.accountId !== accountId)) {
      setLoading(true);
      fetchAccount().then(() => setLoading(false))
    }
  }, [accountId, props.connected, hidden, account, fetchAccount]);


  const list = follow.map((accountId) => {
    const key = `${gkey}-f/${accountId}`;
    return (
      <div key={key} className="follower">
        <div className="card mb-3">
          <div className="card-body">
            <AccountCard  {...props} accountId={accountId}/>
          </div>
        </div>
      </div>
    );
  });

  return loading ? (
      <div className="d-flex justify-content-center">
        <div className="spinner-grow" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : (list.length > 0) ? (
    <div>
      {list}
    </div>
    ) : (
      <div className="text-muted">No one is here</div>
    );
}

export default FollowTab;
