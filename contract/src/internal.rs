use crate::*;

pub(crate) fn assert_one_yocto() {
    assert_eq!(
        env::attached_deposit(),
        1,
        "Requires attached deposit of exactly 1 yoctoNEAR"
    )
}

pub(crate) fn hash(account_id: &AccountId) -> CryptoHash {
    let mut h = CryptoHash::default();
    h.copy_from_slice(&env::sha256(account_id.as_bytes()));
    h
}
