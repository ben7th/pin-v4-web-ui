class ChangeVideoHtmlTypeInBookmarkEntries < ActiveRecord::Migration
  def self.up
    change_column :bookmark_entries,:video_html,:text
  end

  def self.down
  end
end
