class AddPubDateIntoRssItems < ActiveRecord::Migration
  def self.up
    add_column :rss_items, :pub_date, :datetime
  end

  def self.down
    remove_column(:rss_items, :pub_date)
  end
end
