import React, {useCallback, useEffect, useState} from 'react';
import Post from "./Post";
import { SortedSet } from "collections/sorted-set";
import uuid from "react-uuid";

function Feed(props) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [gkey] = useState(uuid())

  const seed = props.seed;
  const extraPosts = props.extraPosts || [];

  const fetchPosts = useCallback(async (state) => {
    const posts = [];
    const recent = SortedSet(seed);
    while (recent.length > 0 && posts.length < 30) {
      const [blockHeight, accountId] = recent.pop();
      if (blockHeight === 0) {
        break;
      }

      const post = await props._near.getPost(accountId, blockHeight);
      if (post) {
        if (post.lastPostHeight > 0) {
          recent.push([post.lastPostHeight, accountId])
        }
        posts.push(post);
        if (state.mounted) {
          setPosts([...posts]);
        } else {
          break;
        }
      }
    }
  }, [seed, props._near])

  useEffect(() => {
    let state = {
      mounted: true
    };
    setLoading(true);
    fetchPosts(state).then(() => {
      if (state.mounted) {
        setLoading(false)
      }
    })
    return () => {
      state.mounted = false;
    }
  }, [seed, fetchPosts]);

  const feed = [...extraPosts, ...posts].map(post => {
    const key = `${gkey}-${post.accountId}/${post.blockHeight}`;
    return <Post {...props} key={key} post={post}/>;
  });
  return (
    <div>
      {(feed.length > 0) ? feed : !loading && (
        <div className="text-muted">
          No posts.
        </div>
      )}
      {loading && (
        <div className="d-flex justify-content-center">
          <div className="spinner-grow" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feed;
