import React, {useCallback, useEffect, useState} from 'react';
import Post from "./Post";
import { SortedSet } from "collections/sorted-set";

function Feed(props) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const seed = props.seed;
  const extraPosts = props.extraPosts || [];

  const fetchPosts = useCallback(async () => {
    const posts = [];
    const recent = SortedSet(seed);
    while (recent.length > 0 && posts.length < 10) {
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
        setPosts([...posts]);
      }
    }
  }, [seed, props._near])

  useEffect(() => {
    setLoading(true);
    fetchPosts().then(() => setLoading(false))
  }, [fetchPosts]);

  const feed = [...extraPosts, ...posts].map(post => {
    const key = `${post.accountId}/${post.blockHeight}`;
    return <Post key={key} post={post} {...props}/>;
  });
  return (
    <div>
      {!loading ? (
        (feed.length > 0) ? feed : (
          <div className="text-muted">
            No posts.
          </div>
        )
      ) : (
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
