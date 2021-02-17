import "./Home.scss";
import React, {useEffect, useState} from 'react';
import NewPost from "../components/NewPost";
import Feed from "../components/Feed";
import Followers from "../components/Followers";
import {Link} from "react-router-dom";

function HomePage(props) {
  const [followingSeed, setFollowingSeed] = useState(false);

  useEffect(() => {
    if (props.connected) {
      const accountData = props._near.accountData;
      if (accountData) {
        const seed = Object.entries(props.followings).map(
          ([accountId, account]) => [account.stats.lastPostHeight, accountId]
        );
        if (accountData.stats.lastPostHeight > 0) {
          seed.push([accountData.stats.lastPostHeight, accountData.accountId]);
        }
        setFollowingSeed(seed);
      } else {
        setFollowingSeed([]);
      }
    }
  }, [props.connected, props.followings, props._near.accountData])

  return (
    <div>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col col-12 col-lg-8 col-xl-6">
            <NewPost {...props}/>
            {(followingSeed && followingSeed.length > 0) ? (
              <div>
                <h3>Your Feed</h3>
                <Feed {...props} seed={followingSeed} extraPosts={props.newPosts}/>
              </div>
            ) : followingSeed ? (
              <div>
                <h3>Feed is empty</h3>
                <div>
                  <Link to={"/discover"} className="btn btn-outline-secondary">Discover more</Link>
                </div>
              </div>
            ) :  (
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
    </div>
  );
}

export default HomePage;
