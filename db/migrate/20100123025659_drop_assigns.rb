class DropAssigns < ActiveRecord::Migration
  def self.up
    drop_table(:teaching_assigns)
  end

  def self.down
  end
end
