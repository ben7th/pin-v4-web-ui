class AddPositionToTeachingProcedures < ActiveRecord::Migration
  def self.up
    add_column :teaching_procedures,:position,:integer
  end

  def self.down
  end
end
