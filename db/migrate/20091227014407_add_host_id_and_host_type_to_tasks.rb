class AddHostIdAndHostTypeToTasks < ActiveRecord::Migration
  def self.up
    add_column :tasks,:host_id,:integer
    add_column :tasks,:host_type,:string
  end

  def self.down
    remove_column :tasks,:host_id
    remove_column :tasks,:host_type
  end
end
