class AddReceiverIdsToMessage < ActiveRecord::Migration
  def self.up
    add_column :messages,:receiver_ids,:string,:null=>false
  end

  def self.down
  end
end
