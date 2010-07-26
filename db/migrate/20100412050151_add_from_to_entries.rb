class AddFromToEntries < ActiveRecord::Migration
  def self.up
    add_column :entries,:from,:string
  end

  def self.down
    remove_column(:entries, :from)
  end
end
