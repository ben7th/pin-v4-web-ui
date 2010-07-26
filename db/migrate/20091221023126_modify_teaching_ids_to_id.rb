class ModifyTeachingIdsToId < ActiveRecord::Migration
  def self.up
    rename_column(:teaching_units, :teaching_lesson_id, :lesson_id)
    rename_column(:teaching_procedures, :teaching_unit_id, :unit_id)
  end

  def self.down
    rename_column(:teaching_units, :lesson_id, :teaching_lesson_id)
    rename_column(:teaching_procedures, :unit_id, :teaching_unit_id)
  end
end
