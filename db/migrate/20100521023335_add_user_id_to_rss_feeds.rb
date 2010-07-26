class AddUserIdToRssFeeds < ActiveRecord::Migration
  def self.up
    add_column :rss_feeds,:user_id,:integer
  end

  def self.down
  end
end
