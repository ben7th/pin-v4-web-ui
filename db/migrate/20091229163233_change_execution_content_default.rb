class ChangeExecutionContentDefault < ActiveRecord::Migration
  def self.up
    change_column_default(:executions, :content, '')
  end

  def self.down
  end
end
