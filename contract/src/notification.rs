use crate::*;
use near_sdk::json_types::WrappedTimestamp;
use near_sdk::Timestamp;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AccountNotifications {
    pub timestamp: Timestamp,
    pub block_height: BlockHeight,
    pub notifications: Vec<Notification>,
    pub previous_notification_block_height: BlockHeight,
}

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountNotificationsView {
    pub timestamp: WrappedTimestamp,
    pub block_height: BlockHeight,
    pub notifications: Vec<Notification>,
    pub previous_notification_block_height: BlockHeight,
}

impl From<AccountNotifications> for AccountNotificationsView {
    fn from(notifications: AccountNotifications) -> Self {
        Self {
            timestamp: notifications.timestamp.into(),
            block_height: notifications.block_height,
            notifications: notifications.notifications,
            previous_notification_block_height: notifications.previous_notification_block_height,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Notification {
    FollowedBy {
        account_id: AccountId,
    },
    UnfollowedBy {
        account_id: AccountId,
    },
    MentionedBy {
        account_id: AccountId,
    },
    RepostedBy {
        account_id: AccountId,
        post_height: BlockHeight,
    },
    CommentedBy {
        account_id: AccountId,
        post_height: BlockHeight,
    },
    RatedBy {
        account_id: AccountId,
        post_height: BlockHeight,
        rating: u32,
    },
}

#[near_bindgen]
impl Contract {
    pub fn get_notifications(
        &self,
        account_id: ValidAccountId,
    ) -> Option<AccountNotificationsView> {
        self.notifications
            .get(account_id.as_ref())
            .map(|an| an.into())
    }
}

impl Contract {
    pub(crate) fn internal_notify_account(
        &mut self,
        account_id: &AccountId,
        notification: Notification,
    ) {
        let storage_update = self.new_storage_update(account_id.clone());
        let block_height = env::block_height();
        let mut previous_notification_block_height = 0;
        let mut notifications = self
            .notifications
            .remove(&account_id)
            .filter(|notifications| {
                previous_notification_block_height = notifications.block_height;
                notifications.block_height == block_height
            })
            .unwrap_or_else(|| AccountNotifications {
                timestamp: env::block_timestamp(),
                block_height,
                notifications: Vec::with_capacity(1),
                previous_notification_block_height,
            });
        notifications.notifications.push(notification);
        self.notifications.insert(&account_id, &notifications);
        self.finalize_storage_update(storage_update);
    }
}
