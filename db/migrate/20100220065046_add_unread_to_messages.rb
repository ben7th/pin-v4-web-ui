class AddUnreadToMessages < ActiveRecord::Migration
  def self.up
    add_column :messages,:unread,:boolean,:default =>false
  end

  def self.down
  end
end
