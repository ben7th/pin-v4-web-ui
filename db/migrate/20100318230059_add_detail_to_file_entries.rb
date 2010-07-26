class AddDetailToFileEntries < ActiveRecord::Migration
  def self.up
    add_column :file_entries, :detail, :string
  end

  def self.down
  end
end
