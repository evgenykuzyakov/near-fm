import React from 'react';

function AddStorageButton(props) {
  async function requestStorageBalance(e) {
    e.preventDefault();
    await props._near.contract.storage_deposit({}, "30000000000000", "100000000000000000000000");
  }

  return !props.enoughStorageBalance && (
    <button
      className="btn btn-primary me-md-2"
      onClick={requestStorageBalance}
    >
      Add storage balance
    </button>
  );
}

export default AddStorageButton;
