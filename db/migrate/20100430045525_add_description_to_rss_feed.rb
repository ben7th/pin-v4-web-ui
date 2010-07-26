class AddDescriptionToRssFeed < ActiveRecord::Migration
  def self.up
    add_column :rss_feeds, :description, :string
  end

  def self.down
    remove_column(:rss_feeds, :description)
  end
end
