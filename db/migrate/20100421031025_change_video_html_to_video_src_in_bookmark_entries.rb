class ChangeVideoHtmlToVideoSrcInBookmarkEntries < ActiveRecord::Migration
  def self.up
    rename_column :bookmark_entries, :video_html,:video_src
  end

  def self.down
  end
end
