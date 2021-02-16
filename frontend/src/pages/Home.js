import "./Home.scss";
import React, {useEffect, useState} from 'react';
import NewPost from "../components/NewPost";
import Feed from "../components/Feed";
import {convertAccountStats} from "../data/Account";

const FetchLimit = 100;

function HomePage(props) {
  const [followingSeed, setFollowingSeed] = useState(false);
  const [latestSeed, setLatestSeed] = useState(false);

  const accountData = props._near.accountData;
  if (accountData && followingSeed === false) {
    const seed = Object.entries(accountData.followings).map(
      ([accountId, accountStats]) => [accountStats.lastPostHeight, accountId]
    );
    if (accountData.stats.lastPostHeight > 0) {
      seed.push([accountData.stats.lastPostHeight, accountData.accountId]);
    }
    setFollowingSeed(seed);
  }

  async function fetchRandomFeed() {
    const numAccounts = await props._near.contract.get_num_accounts();
    return (await props._near.contract.get_accounts({
      from_index: Math.max(numAccounts - FetchLimit, 0),
      limit: FetchLimit
    })).map(([accountId, accountStats]) => [convertAccountStats(accountStats).lastPostHeight, accountId]);
  }

  useEffect(() => {
    if (props.connected && props._near) {
      fetchRandomFeed().then((seed) => {
        setLatestSeed(seed);
      });
    }
  }, [props.connected])

  return (
    <div>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col col-lg-8 col-xl-6">
            {props.enoughStorageBalance && (
              <NewPost {...props}/>
            )}
            {followingSeed && followingSeed.length > 0 && (
              <div>
                <h3>Your Feed</h3>
                <Feed {...props} seed={followingSeed} extraPosts={props.newPosts}/>
              </div>
            )}
            {latestSeed && latestSeed.length > 0 && (
              <div>
                <h3>Random people</h3>
                <Feed {...props} seed={latestSeed}/>
              </div>
            )}
            {(!followingSeed || !latestSeed) && (
              <div className="d-flex justify-content-center">
                <div className="spinner-grow" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
