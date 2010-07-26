class AddCreatorIdToTeachingUnits < ActiveRecord::Migration
  def self.up
    add_column :teaching_units,:creator_id,:integer,:null=>false
  end

  def self.down
    remove_column(:teaching_units, :creator_id)
  end
end
