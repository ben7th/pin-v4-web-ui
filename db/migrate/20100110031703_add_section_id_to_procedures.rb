class AddSectionIdToProcedures < ActiveRecord::Migration
  def self.up
    add_column :teaching_procedures,:section_id,:integer
  end

  def self.down
  end
end
