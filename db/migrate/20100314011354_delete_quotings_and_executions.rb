class DeleteQuotingsAndExecutions < ActiveRecord::Migration
  def self.up
    drop_table :quotings
    drop_table :executions
  end

  def self.down
  end
end
