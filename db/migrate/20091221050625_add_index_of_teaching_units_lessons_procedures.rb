class AddIndexOfTeachingUnitsLessonsProcedures < ActiveRecord::Migration
  def self.up
    add_index(:teaching_lessons, :creator_id)
    add_index(:teaching_procedures, :creator_id)
    add_index(:teaching_procedures, :unit_id)
    add_index(:teaching_units, :creator_id)
    add_index(:teaching_units, :lesson_id)
  end

  def self.down
    remove_index :teaching_lessons
    remove_index :teaching_procedures
    remove_index :teaching_units
  end
end
