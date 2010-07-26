class AddPostionToTeachingUnits < ActiveRecord::Migration
  def self.up
    add_column :teaching_units,:position,:integer
  end

  def self.down
  end
end
