class AddImageSrcAndVideoHtmlToBookmarkEntries < ActiveRecord::Migration
  def self.up
    add_column :bookmark_entries,:image_src,:string
    add_column :bookmark_entries,:video_html,:string
  end

  def self.down
  end
end
