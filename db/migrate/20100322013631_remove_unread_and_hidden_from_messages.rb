class RemoveUnreadAndHiddenFromMessages < ActiveRecord::Migration
  def self.up
    remove_column :messages,:unread
    remove_column :messages,:hidden
  end

  def self.down
  end
end
