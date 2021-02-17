import "./Home.scss";
import React, {useCallback, useEffect, useState} from 'react';
import Feed from "../components/Feed";
import {AccountData} from "../data/Account";
import Followers from "../components/Followers";

const FetchLimit = 100;

function DiscoverPage(props) {
  const [seed, setSeed] = useState(false);

  const fetchSeed = useCallback(async () => {
    if (props.connected) {
      const numAccounts = await props._near.contract.get_num_accounts();
      return (await props._near.contract.get_accounts({
        from_index: Math.max(numAccounts - FetchLimit, 0),
        limit: FetchLimit
      })).map(([accountId, accountStats]) => {
        let account = new AccountData(props._near, accountId, accountStats);
        return [account.stats.lastPostHeight, accountId]
      });
    } else {
      return false;
    }
  }, [props.connected, props._near])

  useEffect(() => {
    fetchSeed().then(setSeed);
  }, [fetchSeed]);


  return (
    <div>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col col-12 col-lg-8 col-xl-6">
            {seed && seed.length > 0 && (
              <div>
                <h3>Discover</h3>
                <Feed {...props} seed={seed}/>
              </div>
            )}
            {!seed && (
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

export default DiscoverPage;
