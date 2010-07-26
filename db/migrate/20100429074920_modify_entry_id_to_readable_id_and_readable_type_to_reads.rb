class ModifyEntryIdToReadableIdAndReadableTypeToReads < ActiveRecord::Migration
  def self.up
    rename_column :readings, :entry_id, :readable_id
    add_column :readings, :readable_type, :string
  end

  def self.down
    rename_column(:readings, :readable_id, :entry_id)
    remove_column(:readings, :readable_type)
  end
end
