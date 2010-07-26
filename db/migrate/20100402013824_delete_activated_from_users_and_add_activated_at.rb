class DeleteActivatedFromUsersAndAddActivatedAt < ActiveRecord::Migration
  def self.up
    remove_column :users,:activated
    add_column :users,:activated_at,:datetime
    rename_column :users,:active_code,:activation_code
  end

  def self.down
  end
end
