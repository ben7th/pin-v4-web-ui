class CreateTeachingAssignRules < ActiveRecord::Migration
  def self.up
    create_table :teaching_assign_rules do |t|
      t.integer :res_id,:null=>false
      t.integer :uset_id,:null=>false
      t.string :res_type,:null=>false
      t.string :uset_type,:null=>false
      t.string :status,:null=>false,:default=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_assign_rules
  end
end
