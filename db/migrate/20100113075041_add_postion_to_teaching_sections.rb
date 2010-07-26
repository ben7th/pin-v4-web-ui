class AddPostionToTeachingSections < ActiveRecord::Migration
  def self.up
    add_column :teaching_sections,:position,:integer
  end

  def self.down
  end
end
