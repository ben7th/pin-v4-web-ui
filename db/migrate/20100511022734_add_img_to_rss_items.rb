class AddImgToRssItems < ActiveRecord::Migration
  def self.up
    add_column :rss_items, :img_file_name,    :string
    add_column :rss_items, :img_content_type, :string
    add_column :rss_items, :img_file_size,    :integer
    add_column :rss_items, :img_updated_at,   :datetime
  end

  def self.down
  end
end
