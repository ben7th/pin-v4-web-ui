class CreateRssItems < ActiveRecord::Migration
  def self.up
    create_table :rss_items do |t|
      t.string :title
      t.string :link
      t.text :description
      t.timestamps
    end
  end

  def self.down
    drop_table :rss_items
  end
end
