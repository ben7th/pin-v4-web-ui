class AddImageMarkColumnsToRemarks < ActiveRecord::Migration
  def self.up
    add_column :remarks,:left,:float
    add_column :remarks,:top,:float
    add_column :remarks,:width,:float
    add_column :remarks,:height,:float
  end

  def self.down
  end
end
