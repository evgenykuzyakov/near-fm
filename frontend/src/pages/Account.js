import React, {useEffect, useState} from 'react';
import './Account.scss';
import {useParams} from "react-router";
import Feed from "../components/Feed";
import Followers from "../components/Followers";
import NewPost from "../components/NewPost";
import AccountCard from "../components/AccountCard";
import FollowTab from "../components/FollowTab";

function AccountPage(props) {
  const { accountId } = useParams();
  const [seed, setSeed] = useState(false);

  const [account, setAccount] = useState(null);

  if (props.connected) {
    props._near.getAccount(accountId).then((account) => {
      setAccount(account);
    })
  }

  useEffect(() => {
    if (props.connected && account) {
      setSeed([[account.stats.lastPostHeight, account.accountId]]);
    }
  }, [props.connected, account])

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
                  <button className="nav-link active" id="posts-tab" data-bs-toggle="pill" data-bs-target="#posts"
                          type="button" role="tab" aria-controls="home" aria-selected="true">{accountId === props.signedAccountId && "Your "} Posts
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="following-tab" data-bs-toggle="pill" data-bs-target="#following" type="button"
                          role="tab" aria-controls="profile" aria-selected="false">Following
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="followers-tab" data-bs-toggle="pill" data-bs-target="#followers" type="button"
                          role="tab" aria-controls="contact" aria-selected="false">Followers
                  </button>
                </li>
              </ul>
              <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
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
                <div className="tab-pane fade" id="following" role="tabpanel" aria-labelledby="following-tab">
                  <FollowTab {...props} showFollowers={false} accountId={accountId} hidden={false}/>
                </div>
                <div className="tab-pane fade" id="followers" role="tabpanel" aria-labelledby="followers-tab">
                  <FollowTab {...props} showFollowers={true} accountId={accountId} hidden={false}/>
                </div>
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
