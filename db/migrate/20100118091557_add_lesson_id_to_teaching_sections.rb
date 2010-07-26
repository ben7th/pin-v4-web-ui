class AddLessonIdToTeachingSections < ActiveRecord::Migration
  def self.up
    add_column :teaching_sections,:lesson_id,:integer
  end

  def self.down
  end
end
