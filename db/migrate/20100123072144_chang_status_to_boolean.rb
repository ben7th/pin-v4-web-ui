class ChangStatusToBoolean < ActiveRecord::Migration
  def self.up
    change_column :teaching_assign_rules,:status,:boolean,:null=>false,:default=>false
  end

  def self.down
  end
end
