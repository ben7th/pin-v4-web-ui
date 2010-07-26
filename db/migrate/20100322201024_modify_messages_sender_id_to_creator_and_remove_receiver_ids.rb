class ModifyMessagesSenderIdToCreatorAndRemoveReceiverIds < ActiveRecord::Migration
  def self.up
    remove_column :messages,:receiver_ids
    rename_column :messages,:sender_id,:creator_id
  end

  def self.down
  end
end
