class AddLessonIdAndEclassIdToAssignRules < ActiveRecord::Migration
  def self.up
    add_column :teaching_assign_rules,:lesson_id,:integer,:null=>false
    add_column :teaching_assign_rules,:eclass_id,:integer,:null=>false
  end

  def self.down
    remove_column(:teaching_assign_rules, :lesson_id)
    remove_column(:teaching_assign_rules, :eclass_id)
  end
end
