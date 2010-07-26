class SubscriptionEntry < ActiveRecord::Base

  belongs_to :user
  belongs_to :rss_feed

  validates_presence_of :user
  validates_presence_of :rss_feed

  def self.create_subscription_entry(user,rss_feed)
    # 要保证某一用户对某个rss_feed订阅的唯一性
    return raise '解析错误' if rss_feed.blank?
    subscription_entry = SubscriptionEntry.find_by_user_id_and_rss_feed_id(user.id,rss_feed.id)
    if subscription_entry.blank?
      subscription_entry = SubscriptionEntry.create(:user=>user,:rss_feed=>rss_feed)
      entry = Entry.create(:resource=>subscription_entry,:user=>user)
      return entry
    end
    return raise "已经订阅"
  end

  def self.has_unread_subscriptions(user,count = 3)
    subscriptions = []
    user.entries.type_of('subscription').by_updated_at(:desc).each do |entry|
      subscription = entry.resource
      rss_feed = subscription.rss_feed
      if rss_feed.unread_count(user) != 0
        subscriptions << subscription
        break if subscriptions.count == count
      end
    end
    return subscriptions
  end

  def unread_rss_items(count = 3)
    rss_feed = self.rss_feed
    user = self.user
    read_rss_items = rss_feed.rss_items.find(:all,
      :joins=>"inner join readings on readings.readable_type = 'RssItem' and readings.readable_id = rss_items.id and readings.user_id = #{user.id}"
    )
    unread_rss_items = rss_feed.rss_items - read_rss_items
    unread_rss_items[0...count]
  end

  include Entry::ResourceMethods
end
