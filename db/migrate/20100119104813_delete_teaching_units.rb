class DeleteTeachingUnits < ActiveRecord::Migration
  def self.up
    drop_table :teaching_units
  end

  def self.down
  end
end
