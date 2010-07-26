class RenameResourceEntryToEntry < ActiveRecord::Migration
  def self.up
    rename_table(:resource_entries, :entries)
  end

  def self.down
    rename_table(:entries, :resource_entries)
  end
end
