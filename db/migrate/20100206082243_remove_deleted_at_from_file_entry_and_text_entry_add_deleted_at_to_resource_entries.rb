class RemoveDeletedAtFromFileEntryAndTextEntryAddDeletedAtToResourceEntries < ActiveRecord::Migration
  def self.up
    remove_column(:text_entries, :deleted_at)
    remove_column(:file_entries, :deleted_at)
    add_column :resource_entries,:deleted_at,:datetime
    add_column :teaching_procedures,:deleted_at,:datetime
  end

  def self.down
  end
end
