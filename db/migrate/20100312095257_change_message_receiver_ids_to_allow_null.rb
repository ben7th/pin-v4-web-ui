class ChangeMessageReceiverIdsToAllowNull < ActiveRecord::Migration
  def self.up
    change_column :messages, :receiver_ids, :string, :null=>true
  end

  def self.down
  end
end
