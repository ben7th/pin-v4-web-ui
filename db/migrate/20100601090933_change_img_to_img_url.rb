class ChangeImgToImgUrl < ActiveRecord::Migration
  def self.up
    remove_column(:rss_items, :img_file_name)
    remove_column(:rss_items, :img_content_type)
    remove_column(:rss_items, :img_file_size)
    remove_column(:rss_items, :img_updated_at)

    add_column :rss_items, :img_url, :string
  end

  def self.down
  end
end
