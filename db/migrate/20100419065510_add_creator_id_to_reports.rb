class AddCreatorIdToReports < ActiveRecord::Migration
  def self.up
    add_column :reports, :creator_id, :integer
    add_index :reports, :creator_id
  end

  def self.down
    remove_column :reports, :creator_id 
    remove_index :reports, :creator_id
  end
end
