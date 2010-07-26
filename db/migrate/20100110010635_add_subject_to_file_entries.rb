class AddSubjectToFileEntries < ActiveRecord::Migration
  def self.up
    add_column :file_entries,:subject,:text
  end

  def self.down
  end
end
