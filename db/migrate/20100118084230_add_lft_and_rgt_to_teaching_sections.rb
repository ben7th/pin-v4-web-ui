class AddLftAndRgtToTeachingSections < ActiveRecord::Migration
  def self.up
    add_column :teaching_sections,:lft,:integer
    add_column :teaching_sections,:rgt,:integer
  end

  def self.down
  end
end
