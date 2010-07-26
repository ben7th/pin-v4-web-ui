class AddDeletedAtToFileEntries < ActiveRecord::Migration
  def self.up
    add_column :file_entries,:deleted_at,:datetime
  end

  def self.down
    remove_column(:file_entries, :deleted_at)
  end
end
