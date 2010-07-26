class DeleteParentTypeFromTeachingSections < ActiveRecord::Migration
  def self.up
    remove_column :teaching_sections,:parent_type
  end

  def self.down
  end
end
