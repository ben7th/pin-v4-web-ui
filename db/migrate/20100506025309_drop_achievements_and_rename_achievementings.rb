class DropAchievementsAndRenameAchievementings < ActiveRecord::Migration
  def self.up
    drop_table :achievements
    rename_table :achievementings, :achievements
    rename_column :achievements, :achievement_id, :honor
    change_column :achievements,:honor,:string
  end

  def self.down
  end
end
