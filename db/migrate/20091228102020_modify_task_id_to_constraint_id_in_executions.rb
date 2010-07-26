class ModifyTaskIdToConstraintIdInExecutions < ActiveRecord::Migration
  def self.up
    rename_column(:executions, :task_id, :constraint_id)
    add_index(:executions, :constraint_id)
  end

  def self.down
    rename_column(:executions, :constraint_id, :task_id)
  end
end
