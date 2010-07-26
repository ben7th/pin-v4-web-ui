class CreateTeachingAssigns < ActiveRecord::Migration
  def self.up
    create_table :teaching_assigns do |t|
      t.integer :procedure_id,:null=>false
      t.integer :user_id,:null=>false
      t.timestamps
    end
    add_index :teaching_assigns,:procedure_id
    add_index :teaching_assigns,:user_id
  end

  def self.down
    drop_table :teaching_assigns
  end
end
