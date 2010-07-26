class AddRssFeedIdToRssItems < ActiveRecord::Migration
  def self.up
    add_column :rss_items, :rss_feed_id,:integer
  end

  def self.down
    remove_column(:rss_items, :rss_feed_id)
  end
end
