class AddCreatorIdAndSubjectToTeachingSections < ActiveRecord::Migration
  def self.up
    add_column :teaching_sections,:creator_id,:integer,:null=>false
    add_column :teaching_sections,:subject,:text
  end

  def self.down
    remove_column :teaching_sections,:creator_id
    remove_column :teaching_sections,:subject
  end
end
