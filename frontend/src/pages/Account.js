import React, {useEffect, useState} from 'react';
import './Account.scss';
import {useParams} from "react-router";
import Feed from "../components/Feed";
import Followers from "../components/Followers";
import NewPost from "../components/NewPost";
import AccountCard from "../components/AccountCard";
import FollowTab from "../components/FollowTab";
import {Link} from "react-router-dom";

function AccountPage(props) {
  const { accountId, suffix } = useParams();
  const [seed, setSeed] = useState(false);

  useEffect(() => {
    if (props.connected) {
      props._near.getAccount(accountId).then((account) => {
        setSeed([[account.stats.lastPostHeight, account.accountId]]);
      })
    }
  }, [props.connected, props._near, accountId])

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col col-12 col-lg-8 col-xl-6">
          {props.connected && (
            <div>
              <AccountCard {...props} accountId={accountId} />
              <div className="mb-3"></div>
              <ul className="nav nav-pills mb-2" id="accountTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <Link to={`/a/${accountId}`} className={`nav-link${!suffix ? " active" : ""}`} id="posts-tab"
                          type="button" aria-controls="posts" aria-selected={!suffix}>{accountId === props.signedAccountId && "Your "} Posts
                  </Link>
                </li>
                <li className="nav-item" role="presentation">
                  <Link to={`/a/${accountId}/following`} className={`nav-link${suffix === 'following' ? " active" : ""}`} id="following-tab"
                          role="tab" aria-controls="following" aria-selected={suffix === 'following'}>Following
                  </Link>
                </li>
                <li className="nav-item" role="presentation">
                  <Link to={`/a/${accountId}/followers`} className={`nav-link${suffix === 'followers' ? " active" : ""}`} id="followers-tab"
                          role="tab" aria-controls="followers" aria-selected={suffix === 'followers'}>Followers
                  </Link>
                </li>
              </ul>
              <div className="tab-content">
                { !suffix ? (
                  <div>
                    {accountId === props.signedAccountId && (
                      <NewPost {...props}/>
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
                ) : suffix === 'following' ? (
                  <div>
                    <FollowTab {...props} showFollowers={false} accountId={accountId} hidden={suffix !== 'following'}/>
                  </div>
                ) : suffix === 'followers' ? (
                  <div>
                    <FollowTab {...props} showFollowers={true} accountId={accountId} hidden={suffix !== 'followers'}/>
                  </div>
                ) : (
                  <div>Bug</div>
                )}
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
