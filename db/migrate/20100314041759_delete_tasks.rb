class DeleteTasks < ActiveRecord::Migration
  def self.up
    drop_table(:task_allocations)
    drop_table(:tasks)
  end

  def self.down
  end
end
