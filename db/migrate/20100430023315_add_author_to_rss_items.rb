class AddAuthorToRssItems < ActiveRecord::Migration
  def self.up
    add_column :rss_items, :author, :string
  end

  def self.down
    remove_column(:rss_items, :author)
  end
end
