class AddTitleSnapshotToBookmarkEntries < ActiveRecord::Migration
  def self.up
    add_column :bookmark_entries,:title,:string
    add_column :bookmark_entries,:snapshot,:text
  end

  def self.down
    remove_column(:bookmark_entries, :title)
    remove_column(:bookmark_entries, :snapshot)
  end
end
