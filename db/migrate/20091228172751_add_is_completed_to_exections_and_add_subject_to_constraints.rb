class AddIsCompletedToExectionsAndAddSubjectToConstraints < ActiveRecord::Migration
  def self.up
    add_column :executions,:is_completed,:boolean,:default => false
    add_column :constraints,:subject,:text
  end

  def self.down
    remove_column :executions,:is_completed
    remove_column :constraints,:subject
  end
end
