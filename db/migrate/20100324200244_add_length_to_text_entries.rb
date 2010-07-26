class AddLengthToTextEntries < ActiveRecord::Migration
  def self.up
    add_column :text_entries,:length,:integer,:default=>0
  end

  def self.down
    remove_column(:text_entries, :length)
  end
end
