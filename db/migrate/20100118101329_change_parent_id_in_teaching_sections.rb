class ChangeParentIdInTeachingSections < ActiveRecord::Migration
  def self.up
    change_column :teaching_sections,:parent_id,:integer,:null=>true
  end

  def self.down
  end
end
