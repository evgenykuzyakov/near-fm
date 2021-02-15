import React from 'react';
import {useParams} from "react-router";

function AccountPage(props) {
  const { accountId } = useParams();

  console.log(props);

  return (
    <div>
      Account {accountId}
    </div>
  );
}

export default AccountPage;
