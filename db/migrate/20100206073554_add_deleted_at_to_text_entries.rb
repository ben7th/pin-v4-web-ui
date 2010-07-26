class AddDeletedAtToTextEntries < ActiveRecord::Migration
  def self.up
    add_column :text_entries,:deleted_at,:datetime
  end

  def self.down
    remove_column(:text_entries, :deleted_at)
  end
end
