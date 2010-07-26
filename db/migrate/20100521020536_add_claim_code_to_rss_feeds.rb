class AddClaimCodeToRssFeeds < ActiveRecord::Migration
  def self.up
    add_column :rss_feeds,:claim_code,:string
  end

  def self.down
  end
end