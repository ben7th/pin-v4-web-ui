class ChangeResourceEntryIdToEntryIdInReadings < ActiveRecord::Migration
  def self.up
    rename_column(:readings, :resource_entry_id, :entry_id)
  end

  def self.down
  end
end
