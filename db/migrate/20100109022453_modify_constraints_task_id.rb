class ModifyConstraintsTaskId < ActiveRecord::Migration
  def self.up
    rename_column(:constraints, :task_id, :host_id)
    add_column :constraints,:host_type,:string
  end

  def self.down
  end
end
