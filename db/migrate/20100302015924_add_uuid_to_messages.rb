class AddUuidToMessages < ActiveRecord::Migration
  def self.up
    add_column :messages,:uuid,:string
  end

  def self.down
    remove_column(:messages, :uuid)
  end
end
