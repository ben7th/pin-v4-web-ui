class AddDraftToMessages < ActiveRecord::Migration
  def self.up
    add_column :messages,:draft,:boolean,:default=>false
  end

  def self.down
    remove_column(:messages, :draft)
  end
end
