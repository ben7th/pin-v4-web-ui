class ModifyContactings < ActiveRecord::Migration
  def self.up
    rename_column :contactings, :friend_id, :contact_id
  end

  def self.down
  end
end
